'use client';

import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────
   Live cross-sector cascade-trigger feed.
   USGS earthquakes · NASA EONET wildfires · UK EA floods ·
   NOAA SWPC geomagnetic Kp.
   For visual demonstration only — Munin's production
   telemetry is operator-supplied (SCADA, sensors, ministry
   feeds), not these public feeds.
   ───────────────────────────────────────────────────────── */

type EventType = 'EQ' | 'FL' | 'WF' | 'GR';

interface SignalEvent {
  id: string;
  type: EventType;
  lat: number;
  lon: number;
  mag: number;          // 0..1 normalised intensity for ripple amplitude
  magLabel: string;     // human-readable e.g. "M4.2" or "Kp5"
  place: string;
  time: number;         // epoch ms
}

const W = 720;
const H = 320;

function project(lat: number, lon: number) {
  const x = ((lon + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return { x, y };
}

function fmtAgo(ms: number) {
  const d = Date.now() - ms;
  if (d < 0) return 'NOW';
  const s = Math.floor(d / 1000);
  if (s < 60) return `T-00:${String(s).padStart(2, '0')}`;
  const m = Math.floor(s / 60);
  if (m < 60) return `T-${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  return `T-${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}h`;
}

function fmtCoord(lat: number, lon: number) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}  ${Math.abs(lon).toFixed(2)}°${ew}`;
}

async function fetchUSGS(): Promise<SignalEvent[]> {
  try {
    const r = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
    const d = await r.json();
    return (d.features ?? []).slice(0, 40).map((f: any): SignalEvent => {
      const [lon, lat] = f.geometry.coordinates;
      const m = f.properties.mag ?? 2.5;
      return {
        id: 'eq-' + f.id,
        type: 'EQ',
        lat, lon,
        mag: Math.min(1, Math.max(0.2, (m - 2) / 6)),
        magLabel: 'M' + m.toFixed(1),
        place: (f.properties.place || '').toUpperCase().slice(0, 32),
        time: f.properties.time,
      };
    });
  } catch { return []; }
}

async function fetchEONET(): Promise<SignalEvent[]> {
  try {
    const r = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?days=14&category=wildfires&status=open&limit=80');
    const d = await r.json();
    return (d.events ?? []).map((e: any): SignalEvent | null => {
      const g = e.geometry?.[e.geometry.length - 1];
      if (!g) return null;
      const [lon, lat] = g.coordinates;
      const ha = g.magnitudeValue ?? 0;
      return {
        id: 'wf-' + e.id,
        type: 'WF',
        lat, lon,
        mag: Math.min(1, Math.max(0.25, Math.log10(Math.max(ha, 100)) / 5)),
        magLabel: ha ? Math.round(ha) + 'ha' : 'WF',
        place: (e.title || '').toUpperCase().slice(0, 32),
        time: new Date(g.date).getTime(),
      };
    }).filter(Boolean) as SignalEvent[];
  } catch { return []; }
}

async function fetchEAFloods(): Promise<SignalEvent[]> {
  try {
    const r = await fetch('https://environment.data.gov.uk/flood-monitoring/id/floods', {
      headers: { Accept: 'application/json' },
    });
    const d = await r.json();
    const items = d.items ?? [];
    const enriched = await Promise.all(items.slice(0, 12).map(async (it: any): Promise<SignalEvent | null> => {
      try {
        const fa = typeof it.floodArea === 'string' ? it.floodArea : it.floodArea?.['@id'];
        if (!fa) return null;
        const fr = await fetch(fa, { headers: { Accept: 'application/json' } });
        const fd = await fr.json();
        const item = fd.items ?? fd;
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.long);
        if (!isFinite(lat) || !isFinite(lon)) return null;
        const sev = it.severityLevel ?? 4;
        const mag = sev <= 1 ? 0.95 : sev === 2 ? 0.7 : sev === 3 ? 0.45 : 0.3;
        return {
          id: 'fl-' + (it['@id'] || fa),
          type: 'FL',
          lat, lon, mag,
          magLabel: 'L' + sev,
          place: ((item.county || it.eaAreaName || 'UK') + ' · UK EA').toUpperCase().slice(0, 32),
          time: new Date(it.timeRaised || Date.now()).getTime(),
        };
      } catch { return null; }
    }));
    return enriched.filter(Boolean) as SignalEvent[];
  } catch { return []; }
}

async function fetchSWPC(): Promise<SignalEvent[]> {
  try {
    const r = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
    const d = await r.json();
    const last = d[d.length - 1];
    const kp = parseFloat(last.Kp);
    if (!isFinite(kp) || kp < 4) return [];
    const t = new Date(last.time_tag + 'Z').getTime();
    return [{
      id: 'gr-' + t,
      type: 'GR',
      lat: 70, lon: 0,
      mag: Math.min(1, kp / 9),
      magLabel: 'Kp' + Math.round(kp),
      place: kp >= 7 ? 'SEVERE GEOMAGNETIC' : kp >= 5 ? 'G1+ GEOMAGNETIC' : 'ELEVATED Kp',
      time: t,
    }];
  } catch { return []; }
}

export default function GlobalSignal() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [tick, setTick] = useState(0);
  const seenRef = useRef(new Set<string>());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [eq, wf, fl, gr] = await Promise.all([fetchUSGS(), fetchEONET(), fetchEAFloods(), fetchSWPC()]);
      if (cancelled) return;
      const all = [...eq, ...wf, ...fl, ...gr]
        .filter(e => isFinite(e.lat) && isFinite(e.lon))
        .sort((a, b) => b.time - a.time)
        .slice(0, 80);

      const fresh = new Set<string>();
      for (const e of all) {
        if (!seenRef.current.has(e.id)) { fresh.add(e.id); seenRef.current.add(e.id); }
      }
      setEvents(all);
      if (fresh.size) {
        setNewIds(fresh);
        setTimeout(() => setNewIds(new Set()), 4000);
      }
    }
    load();
    const poll = setInterval(load, 60_000);
    const tickInt = setInterval(() => setTick(t => t + 1), 1000);
    return () => { cancelled = true; clearInterval(poll); clearInterval(tickInt); };
  }, []);

  const tickerEvents = events.slice(0, 6);
  const counts = events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <section style={{
      padding: '64px 32px',
      borderTop: '1px solid var(--rule)',
      borderBottom: '1px solid var(--rule)',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Header strip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 24, gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <div className="frag" style={{ marginBottom: 6 }}>/M.0 · LIVE TELEMETRY</div>
            <h2 style={{
              fontSize: 'clamp(20px, 2vw, 28px)', fontWeight: 500,
              color: 'var(--ink)', letterSpacing: '-0.02em', maxWidth: 720,
            }}>
              Cross-sector cascade-trigger feed,{' '}
              <span className="serif-italic" style={{ color: 'var(--ink-2)' }}>live.</span>
            </h2>
          </div>
          <div className="mono" style={{
            fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em',
            display: 'flex', gap: 18, flexWrap: 'wrap',
          }}>
            <span><span style={{ color: 'var(--signal)' }}>●</span> LIVE · {events.length} EVENTS · LAST 24-72H</span>
            <span>EQ {counts.EQ ?? 0}  ·  WF {counts.WF ?? 0}  ·  FL {counts.FL ?? 0}  ·  GR {counts.GR ?? 0}</span>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 32, alignItems: 'stretch',
        }} className="grid-2-collapse">
          {/* Map */}
          <div style={{
            position: 'relative',
            border: '1px solid var(--rule)',
            background: 'var(--paper)',
            aspectRatio: `${W} / ${H}`,
            overflow: 'hidden',
          }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
              {/* Graticule — lat/lon grid only, no continents */}
              <g stroke="var(--ink)" fill="none" strokeWidth="0.4" opacity="0.16">
                {Array.from({ length: 11 }).map((_, i) => {
                  const y = (i / 10) * H;
                  return <line key={'lat-' + i} x1={0} y1={y.toFixed(2)} x2={W} y2={y.toFixed(2)} />;
                })}
                {Array.from({ length: 13 }).map((_, i) => {
                  const x = (i / 12) * W;
                  return <line key={'lon-' + i} x1={x.toFixed(2)} y1={0} x2={x.toFixed(2)} y2={H} />;
                })}
              </g>
              {/* Equator + prime meridian — heavier */}
              <g stroke="var(--ink)" fill="none" strokeWidth="0.6" opacity="0.32">
                <line x1={0} y1={H / 2} x2={W} y2={H / 2} />
                <line x1={W / 2} y1={0} x2={W / 2} y2={H} />
              </g>
              {/* Tropics + polar circles — dashed, low opacity */}
              <g stroke="var(--ink)" fill="none" strokeWidth="0.4" opacity="0.18" strokeDasharray="2 4">
                {[23.5, -23.5, 66.5, -66.5].map(lat => {
                  const y = (((90 - lat) / 180) * H).toFixed(2);
                  return <line key={'l-' + lat} x1={0} y1={y} x2={W} y2={y} />;
                })}
              </g>
              {/* Frame ticks at corners */}
              <g stroke="var(--ink)" strokeWidth="0.8">
                {[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y], i) => (
                  <g key={i}>
                    <line x1={x} y1={y} x2={x + (x === 0 ? 8 : -8)} y2={y} />
                    <line x1={x} y1={y} x2={x} y2={y + (y === 0 ? 8 : -8)} />
                  </g>
                ))}
              </g>

              {/* Events — dots + ripple for new */}
              {events.map(e => {
                const { x, y } = project(e.lat, e.lon);
                const fresh = newIds.has(e.id);
                const r = 1.2 + e.mag * 2.2;
                const colour = e.type === 'WF' ? '#7c3a14' : 'var(--signal)';
                return (
                  <g key={e.id}>
                    {fresh && (
                      <>
                        <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r={r}
                          fill="none" stroke={colour} strokeWidth="0.8" opacity="0.8">
                          <animate attributeName="r" from={r} to={r + 22 + e.mag * 18} dur="2.6s" repeatCount="1" />
                          <animate attributeName="opacity" from="0.8" to="0" dur="2.6s" repeatCount="1" />
                        </circle>
                        <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r={r}
                          fill="none" stroke={colour} strokeWidth="0.6" opacity="0.6">
                          <animate attributeName="r" from={r} to={r + 14 + e.mag * 12} dur="2s" begin="0.3s" repeatCount="1" />
                          <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="0.3s" repeatCount="1" />
                        </circle>
                      </>
                    )}
                    <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r={r} fill={colour} opacity={0.55 + e.mag * 0.35} />
                    <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r={r * 0.4} fill="var(--paper)" opacity="0.7" />
                  </g>
                );
              })}
            </svg>

            {/* Map label overlay — bottom-left coords */}
            <div className="mono" style={{
              position: 'absolute', left: 10, bottom: 8,
              fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em',
            }}>
              EQUIRECTANGULAR · WGS84 · 60S POLL
            </div>
            <div className="mono" style={{
              position: 'absolute', right: 10, bottom: 8,
              fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.1em',
            }}>
              ◯ EQ &nbsp; ◯ WF &nbsp; ◯ FL &nbsp; ◯ GR
            </div>
          </div>

          {/* Ticker */}
          <div style={{
            border: '1px solid var(--rule)',
            background: 'var(--paper-2)',
            padding: '20px 22px',
            display: 'flex', flexDirection: 'column', gap: 10,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 12, color: 'var(--ink)',
            minHeight: 0,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em',
              paddingBottom: 8, borderBottom: '1px solid var(--rule)',
            }}>
              <span>RECENT EVENTS</span>
              <span>{tickerEvents.length} OF {events.length}</span>
            </div>
            {tickerEvents.length === 0 ? (
              <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                ·· awaiting feed ··
              </div>
            ) : (
              tickerEvents.map((e, i) => (
                <div key={e.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '52px 30px 56px 1fr',
                  gap: 10,
                  fontSize: 11.5,
                  opacity: 1 - i * 0.12,
                  color: newIds.has(e.id) ? 'var(--signal)' : 'var(--ink)',
                  transition: 'color 0.4s ease',
                }}>
                  <span style={{ color: 'var(--ink-3)' }}>{fmtAgo(e.time)}</span>
                  <span style={{ color: 'var(--signal)' }}>{e.type}</span>
                  <span>{e.magLabel}</span>
                  <span style={{ color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fmtCoord(e.lat, e.lon)}  ·  {e.place}
                  </span>
                </div>
              ))
            )}
            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
              <div style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.06em', lineHeight: 1.6 }}>
                SOURCES · USGS · NASA EONET · UK ENVIRONMENT AGENCY · NOAA SWPC.
                Visual demonstration of the event-class universe Munin&apos;s playbooks address.
                Munin&apos;s production telemetry is operator-supplied (SCADA, sensor networks, ministry feeds).
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
