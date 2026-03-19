'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Shared Constants ─── */
const GITHUB = 'https://github.com/jacobsprake/munin';
const DOCS = (name: string) => `${GITHUB}/blob/main/docs/${name}`;

/* ─── Utility: Intersection Observer for scroll animations ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Animated Counter ─── */
function Counter({ end, suffix = '', prefix = '', duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [visible, end, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

/* ─── Latency Comparison Bar ─── */
function LatencyBar({ label, minutes, max, color, delay }: { label: string; minutes: number; max: number; color: string; delay: string }) {
  const { ref, visible } = useInView();
  const pct = (minutes / max) * 100;
  return (
    <div ref={ref} style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: '#a3a3a3', fontFamily: 'Inter, sans-serif' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color, fontFamily: 'JetBrains Mono, monospace' }}>
          {minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}min`}
        </span>
      </div>
      <div style={{ height: 8, background: '#111', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: visible ? `${pct}%` : '0%',
          background: color,
          borderRadius: 4,
          transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}`,
        }} />
      </div>
    </div>
  );
}

/* ─── Shadow Link Graph SVG ─── */
function ShadowLinkGraph() {
  const { ref, visible } = useInView(0.3);
  const nodes = [
    { id: 'SUB_A', x: 80, y: 60, label: 'Substation A', sector: 'power', color: '#3b82f6' },
    { id: 'PUMP_7', x: 280, y: 40, label: 'Pump Station 7', sector: 'water', color: '#22c55e' },
    { id: 'TOWER_3', x: 460, y: 70, label: 'Cell Tower 3', sector: 'telecom', color: '#a855f7' },
    { id: 'HOSP_1', x: 180, y: 160, label: 'Hospital A', sector: 'health', color: '#ef4444' },
    { id: 'TREAT_2', x: 380, y: 170, label: 'Treatment Plant', sector: 'water', color: '#22c55e' },
  ];
  const links = [
    { from: 0, to: 1, lag: '30s', shadow: true },
    { from: 0, to: 3, lag: '15min', shadow: false },
    { from: 1, to: 4, lag: '2min', shadow: true },
    { from: 2, to: 3, lag: '0s', shadow: false },
    { from: 0, to: 2, lag: '45s', shadow: true },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 540, margin: '0 auto' }}>
      <svg viewBox="0 0 540 220" style={{ width: '100%', height: 'auto' }}>
        {links.map((l, i) => {
          const a = nodes[l.from], b = nodes[l.to];
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          return (
            <g key={i}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={l.shadow ? '#f59e0b' : '#333'}
                strokeWidth={l.shadow ? 2 : 1}
                strokeDasharray={l.shadow ? '6 3' : 'none'}
                opacity={visible ? 1 : 0}
                style={{ transition: `opacity 0.6s ease ${0.3 + i * 0.15}s` }}
              />
              {l.shadow && (
                <text x={mx} y={my - 8} textAnchor="middle" fontSize={10} fill="#f59e0b"
                  opacity={visible ? 1 : 0} style={{ transition: `opacity 0.5s ease ${0.6 + i * 0.15}s` }}>
                  {l.lag}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n, i) => (
          <g key={n.id} opacity={visible ? 1 : 0} style={{ transition: `opacity 0.4s ease ${i * 0.1}s` }}>
            <circle cx={n.x} cy={n.y} r={visible ? 18 : 12} fill={n.color + '20'} stroke={n.color} strokeWidth={1.5}
              style={{ transition: 'r 0.6s ease' }} />
            <circle cx={n.x} cy={n.y} r={4} fill={n.color} />
            <text x={n.x} y={n.y + 32} textAnchor="middle" fontSize={11} fill="#a3a3a3" fontFamily="Inter, sans-serif">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      {visible && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          background: '#111', border: '1px solid #f59e0b33', borderRadius: 6, padding: '6px 10px',
          fontSize: 11, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace',
        }}>
          ── shadow link (discovered)
        </div>
      )}
    </div>
  );
}

/* ─── Cascade Timeline ─── */
function CascadeTimeline() {
  const { ref, visible } = useInView(0.2);
  const events = [
    { t: '0:00', label: 'Substation A trips', color: '#3b82f6', sector: 'POWER' },
    { t: '0:30', label: 'Pump Station 7 loses power', color: '#22c55e', sector: 'WATER' },
    { t: '2:00', label: 'Treatment plant pressure drops', color: '#22c55e', sector: 'WATER' },
    { t: '5:00', label: 'Cell Tower 3 on backup battery', color: '#a855f7', sector: 'TELECOM' },
    { t: '15:00', label: 'Hospital A water pressure critical', color: '#ef4444', sector: 'HEALTH' },
    { t: '45:00', label: 'Cell tower battery depleted', color: '#a855f7', sector: 'TELECOM' },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: 11, top: 8, bottom: 8, width: 2,
        background: visible ? 'linear-gradient(180deg, #3b82f6, #ef4444)' : '#222',
        transition: 'background 1s ease',
      }} />
      {events.map((ev, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20,
          opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-12px)',
          transition: `all 0.5s ease ${0.2 + i * 0.12}s`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: ev.color,
            marginTop: 6, flexShrink: 0, position: 'relative', left: -20,
            boxShadow: `0 0 8px ${ev.color}66`,
          }} />
          <div style={{ marginLeft: -12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: ev.color, fontWeight: 600 }}>
                T+{ev.t}
              </span>
              <span style={{
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: ev.color, fontWeight: 600,
                background: ev.color + '15', padding: '1px 6px', borderRadius: 3, letterSpacing: '0.05em',
              }}>
                {ev.sector}
              </span>
            </div>
            <span style={{ fontSize: 14, color: '#d4d4d4' }}>{ev.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── M-of-N Signing Animation ─── */
function MultiSigFlow() {
  const { ref, visible } = useInView(0.3);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2200),
      setTimeout(() => setStep(4), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const ministries = [
    { name: 'Environment Agency', icon: '🌊' },
    { name: 'Energy Authority', icon: '⚡' },
    { name: 'Civil Protection', icon: '🛡' },
  ];

  return (
    <div ref={ref} style={{ maxWidth: 460, margin: '0 auto' }}>
      {/* Quorum policy */}
      <div style={{
        textAlign: 'center', marginBottom: 24, fontSize: 13,
        fontFamily: 'JetBrains Mono, monospace', color: '#666',
      }}>
        QUORUM POLICY: 2 of 3 ministries required
      </div>

      {/* Ministry cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {ministries.map((m, i) => {
          const signed = step > i;
          return (
            <div key={i} style={{
              flex: 1, padding: '16px 12px', borderRadius: 8,
              border: `1px solid ${signed ? '#22c55e44' : '#222'}`,
              background: signed ? '#22c55e08' : '#0a0a0a',
              textAlign: 'center',
              transition: 'all 0.4s ease',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 12, color: '#a3a3a3', marginBottom: 8 }}>{m.name}</div>
              <div style={{
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                color: signed ? '#22c55e' : '#444',
                transition: 'color 0.3s ease',
              }}>
                {signed ? '✓ SIGNED' : 'PENDING'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#111', borderRadius: 6, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>
            Signatures: {Math.min(step, 3)}/3
          </span>
          <span style={{
            fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
            color: step >= 2 ? '#22c55e' : step >= 4 ? '#22c55e' : '#f59e0b',
          }}>
            {step >= 2 ? 'QUORUM MET' : 'COLLECTING...'}
          </span>
        </div>
        <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: step >= 2 ? '#22c55e' : '#f59e0b',
            width: `${(Math.min(step, 3) / 3) * 100}%`,
            transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
        {step >= 4 && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 4,
            background: '#22c55e10', border: '1px solid #22c55e33',
            fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#22c55e',
            textAlign: 'center',
          }}>
            PACKET AUTHORISED — PQC signed, Merkle-chained, audit-logged
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Terminal Demo ─── */
function TerminalDemo() {
  const { ref, visible } = useInView(0.3);
  const [lineIdx, setLineIdx] = useState(0);
  const lines = [
    { text: '$ ./scripts/munin demo real-data', color: '#22c55e', delay: 400 },
    { text: '', color: '', delay: 200 },
    { text: '  Loading real Environment Agency river gauge data...', color: '#a3a3a3', delay: 600 },
    { text: '  Source: environment.data.gov.uk/flood-monitoring', color: '#666', delay: 400 },
    { text: '', color: '', delay: 200 },
    { text: '  ✓ Loaded eden_sands_centre: 1000 readings', color: '#d4d4d4', delay: 500 },
    { text: '  ✓ Loaded petteril_botcherby: 1000 readings', color: '#d4d4d4', delay: 500 },
    { text: '', color: '', delay: 200 },
    { text: '  ━━━ Shadow Link Discovered ━━━', color: '#f59e0b', delay: 600 },
    { text: '  eden_sands_centre → petteril_botcherby', color: '#fff', delay: 400 },
    { text: '    Confidence: 0.971', color: '#facc15', delay: 300 },
    { text: '    Lag: 300s (5 minutes)', color: '#facc15', delay: 300 },
    { text: '    Stability: 0.640', color: '#facc15', delay: 300 },
    { text: '', color: '', delay: 200 },
    { text: '  No synthetic data. No simulation. Real sensor readings.', color: '#666', delay: 500 },
    { text: '  Known hydrological relationship confirmed.', color: '#22c55e', delay: 0 },
  ];

  useEffect(() => {
    if (!visible || lineIdx >= lines.length) return;
    const timer = setTimeout(() => setLineIdx(i => i + 1), lines[lineIdx].delay);
    return () => clearTimeout(timer);
  }, [visible, lineIdx, lines.length]);

  return (
    <div ref={ref} style={{
      background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12,
      overflow: 'hidden', maxWidth: 620, margin: '0 auto',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
        background: '#111', borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>
          munin — real data demo
        </span>
      </div>
      {/* Terminal body */}
      <div style={{ padding: '16px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.8, minHeight: 320 }}>
        {lines.slice(0, lineIdx).map((l, i) => (
          <div key={i} style={{ color: l.color, minHeight: l.text ? undefined : 8 }}>
            {l.text || '\u00a0'}
          </div>
        ))}
        {lineIdx < lines.length && (
          <span style={{ display: 'inline-block', width: 8, height: 16, background: '#22c55e', animation: 'pulse-glow 1s infinite' }} />
        )}
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ value, label, sub }: { value: React.ReactNode; label: string; sub: string }) {
  return (
    <div style={{
      padding: '28px 24px', borderRadius: 12, border: '1px solid #1a1a1a', background: '#0a0a0a',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#fff', marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#d4d4d4', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#666' }}>{sub}</div>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ id, children, dark }: { id: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <section id={id} style={{
      padding: '80px 24px',
      background: dark ? '#050508' : 'transparent',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12,
      }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: subtitle ? 16 : 0 }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: 17, color: '#888', lineHeight: 1.7, maxWidth: 640 }}>{subtitle}</p>}
    </div>
  );
}

/* ─── Navigation ─── */
function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1a1a1a',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: '#111', border: '1px solid #222',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace',
          }}>
            M
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#fff', letterSpacing: '0.05em' }}>
            MUNIN
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {['Evidence', 'Problem', 'Solution', 'Demo', 'Docs'].map(s => (
            <a key={s} href={`#${s.toLowerCase()}`} style={{ fontSize: 13, color: '#888', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
              {s}
            </a>
          ))}
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 13, fontWeight: 600, color: '#fff', padding: '6px 14px',
            background: '#fff1', border: '1px solid #333', borderRadius: 6,
          }}>
            GitHub →
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <main>
      <Nav />

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 120, paddingBottom: 80, padding: '120px 24px 80px',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.08), transparent)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="animate-fade-in-up" style={{
            display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace',
            padding: '4px 12px', border: '1px solid #3b82f633', borderRadius: 20, marginBottom: 24,
          }}>
            Sovereign Infrastructure Orchestration
          </div>
          <h1 className="animate-fade-in-up delay-100" style={{
            fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 24,
            letterSpacing: '-0.03em',
          }}>
            Infrastructure fails in minutes.<br />
            <span style={{ color: '#3b82f6' }}>Authorization takes hours.</span>
          </h1>
          <p className="animate-fade-in-up delay-200" style={{
            fontSize: 19, color: '#888', lineHeight: 1.7, marginBottom: 40, maxWidth: 580, margin: '0 auto 40px',
          }}>
            Munin discovers cross-sector dependencies that no existing system can see,
            pre-simulates cascade failures, and compresses crisis authorization from
            2–6 hours to under 30 minutes.
          </p>
          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" style={{
              padding: '12px 28px', background: '#fff', color: '#000', fontWeight: 600,
              borderRadius: 8, fontSize: 15,
            }}>
              View Repository
            </a>
            <a href={DOCS('MUNIN_DOCTRINE.md')} target="_blank" rel="noopener noreferrer" style={{
              padding: '12px 28px', background: 'transparent', color: '#d4d4d4', fontWeight: 600,
              borderRadius: 8, fontSize: 15, border: '1px solid #333',
            }}>
              Read the Doctrine
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <StatCard value={<Counter end={85} suffix="%" />} label="Faster authorization" sub="2-6 hours → 20-30 minutes" />
          <StatCard value={<Counter end={38} />} label="Scenarios simulated" sub="End-to-end in 0.3 seconds" />
          <StatCard value="0.971" label="Real data confidence" sub="EA river gauge correlation" />
          <StatCard value="PQC" label="Quantum-safe signing" sub="Ed25519 + ML-DSA dual-stack" />
        </div>
      </section>

      {/* ── EVIDENCE: REAL DISASTERS ── */}
      <Section id="evidence" dark>
        <SectionTitle
          eyebrow="The Evidence"
          title="This isn't theoretical. It keeps happening."
          subtitle="Every major post-incident review identifies the same bottleneck: multi-agency coordination and legal authorization — not detection."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {[
            {
              name: 'Hurricane Katrina',
              year: '2005',
              delay: '37 days',
              detail: 'FEMA, state, and Red Cross operated in parallel without coordination. Meals took 37 days to reach some areas. The 9/11 Commission-style review found "the single most important failure was coordination."',
              source: 'Select Bipartisan Committee Report, 2006',
              color: '#ef4444',
            },
            {
              name: 'Fukushima Daiichi',
              year: '2011',
              delay: '7+ hours',
              detail: 'Reactor venting was delayed 7+ hours while operators, TEPCO management, and the Prime Minister\'s office argued over authorization. Evacuation was uncoordinated across jurisdictions.',
              source: 'NAIIC Report to the Japanese Diet, 2012',
              color: '#f59e0b',
            },
            {
              name: 'UK Summer Floods',
              year: '2007',
              delay: '3–5 hours',
              detail: 'Cross-government coordination took 3–5 hours per decision. The Pitt Review recommended "a single framework for multi-agency response" — which still doesn\'t exist.',
              source: 'The Pitt Review, Cabinet Office, 2008',
              color: '#3b82f6',
            },
            {
              name: 'Storm Desmond (Carlisle)',
              year: '2015',
              delay: '2–6 hours',
              detail: 'Power substation flooded → water pumps failed → treatment offline → hospitals on emergency supply. Each agency responded independently. Cross-sector cascade was not predicted.',
              source: 'Environment Agency Post-Incident Review, 2016',
              color: '#22c55e',
            },
          ].map(d => (
            <div key={d.name} style={{
              padding: 24, borderRadius: 12, border: '1px solid #1a1a1a', background: '#0a0a0a',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{d.name}</span>
                  <span style={{ fontSize: 13, color: '#666', marginLeft: 8 }}>{d.year}</span>
                </div>
                <span style={{
                  fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: d.color,
                  padding: '2px 8px', borderRadius: 4, background: d.color + '15',
                }}>
                  {d.delay} delay
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#a3a3a3', lineHeight: 1.6, marginBottom: 12 }}>{d.detail}</p>
              <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>{d.source}</div>
            </div>
          ))}
        </div>
        <div style={{
          textAlign: 'center', padding: '20px 24px', borderRadius: 8,
          background: '#111', border: '1px solid #1a1a1a',
        }}>
          <p style={{ fontSize: 15, color: '#d4d4d4', marginBottom: 4 }}>
            The common thread in every case: <strong style={{ color: '#fff' }}>the technology to detect the problem existed.
            The authority to act did not arrive in time.</strong>
          </p>
        </div>
      </Section>

      {/* ── THE PROBLEM ── */}
      <Section id="problem">
        <SectionTitle
          eyebrow="The Problem"
          title="The cascade consumes entire sectors before anyone is allowed to act"
          subtitle="Infrastructure failure is not a data problem — we have enough sensors. It is an authority problem. Cross-sector coordination takes 2–6 hours because every step requires phone calls, legal review, and multi-agency sign-off."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ef4444', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>
              TRADITIONAL COORDINATION
            </h3>
            <LatencyBar label="Incident detection" minutes={10} max={360} color="#ef4444" delay="0s" />
            <LatencyBar label="Cross-agency phone calls" minutes={45} max={360} color="#ef4444" delay="0.1s" />
            <LatencyBar label="Legal review" minutes={60} max={360} color="#ef4444" delay="0.2s" />
            <LatencyBar label="Multi-ministry approval" minutes={120} max={360} color="#ef4444" delay="0.3s" />
            <LatencyBar label="Command execution" minutes={10} max={360} color="#ef4444" delay="0.4s" />
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#ef444410', border: '1px solid #ef444433', borderRadius: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
                Total: 2–6 hours
              </span>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#22c55e', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace' }}>
              WITH MUNIN
            </h3>
            <LatencyBar label="Incident detection (same)" minutes={10} max={360} color="#22c55e" delay="0.5s" />
            <LatencyBar label="Playbook retrieval" minutes={0.1} max={360} color="#22c55e" delay="0.6s" />
            <LatencyBar label="Packet generation" minutes={0.1} max={360} color="#22c55e" delay="0.7s" />
            <LatencyBar label="3× biometric sign-off" minutes={15} max={360} color="#22c55e" delay="0.8s" />
            <LatencyBar label="Command execution (same)" minutes={10} max={360} color="#22c55e" delay="0.9s" />
            <div style={{ marginTop: 16, padding: '12px 16px', background: '#22c55e10', border: '1px solid #22c55e33', borderRadius: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#22c55e' }}>
                Total: 20–30 minutes
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SHADOW LINKS ── */}
      <Section id="solution">
        <SectionTitle
          eyebrow="Shadow Link Discovery"
          title="Cross-sector dependencies exist in physics, not in any database"
          subtitle="Munin infers hidden interdependencies from time-series correlation with lag detection. A power substation and a water pump station 3km away are linked — Munin discovers this before any human maps it."
        />
        <ShadowLinkGraph />
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { label: 'Temporal correlation', desc: 'Statistical co-movement between sensor feeds across sectors' },
            { label: 'Lag detection', desc: 'Physical delay between cause and effect (e.g. 30s power→water)' },
            { label: 'Evidence windows', desc: 'Sliding confidence intervals with stability and health scoring' },
          ].map(f => (
            <div key={f.label} style={{ padding: 20, border: '1px solid #1a1a1a', borderRadius: 8, background: '#0a0a0a' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CASCADE PREDICTION ── */}
      <Section id="cascade" dark>
        <SectionTitle
          eyebrow="Cascade Prediction"
          title="See the failure propagate before it happens"
          subtitle="Once shadow links are discovered, Munin simulates how a single failure cascades across sectors — power to water to telecom to health — and recommends pre-validated playbooks."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <CascadeTimeline />
          <div>
            <div style={{
              padding: 24, borderRadius: 12, border: '1px solid #1a1a1a', background: '#0a0a0a',
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#3b82f6',
                fontWeight: 600, letterSpacing: '0.05em', marginBottom: 12,
              }}>
                MUNIN RECOMMENDATION
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                Activate backup power to Pump Station 7
              </div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 16 }}>
                Prevents downstream cascade to treatment plant and hospital.
                Estimated impact reduction: 4 sectors → 1 sector.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Flood Risk Act §12.3', 'EA Standing Order 7'].map(r => (
                  <span key={r} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 4,
                    background: '#3b82f610', border: '1px solid #3b82f633', color: '#3b82f6',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div style={{
              padding: 16, borderRadius: 8, border: '1px solid #22c55e22', background: '#22c55e05',
              fontSize: 13, color: '#22c55e', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center',
            }}>
              Playbook pre-validated. Evidence packaged. Ready for sign-off.
            </div>
          </div>
        </div>
      </Section>

      {/* ── MULTI-SIG ── */}
      <Section id="authorization">
        <SectionTitle
          eyebrow="Byzantine Multi-Ministry Approval"
          title="No single entity can unilaterally authorize a dangerous action"
          subtitle="M-of-N signing with post-quantum cryptography. Packets carry Ed25519 + ML-DSA dual signatures, Merkle-chained audit trails, and TEE attestation records."
        />
        <MultiSigFlow />
      </Section>

      {/* ── REAL DATA DEMO ── */}
      <Section id="demo" dark>
        <SectionTitle
          eyebrow="Live Demo"
          title="Real data. Real results."
          subtitle="Running on actual Environment Agency river gauge data from the Carlisle catchment. No synthetic data. No simulation. Munin discovered the known hydrological relationship between the River Eden and River Petteril — the 5-minute lag matches physical rainfall travel time."
        />
        <TerminalDemo />
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href={DOCS('DEMO_WALKTHROUGH.md')} target="_blank" rel="noopener noreferrer" style={{
            padding: '10px 24px', background: '#111', border: '1px solid #222', borderRadius: 8,
            fontSize: 14, fontWeight: 600, color: '#d4d4d4', display: 'inline-block',
          }}>
            Full demo walkthrough →
          </a>
        </div>
      </Section>

      {/* ── SAFETY ── */}
      <Section id="safety">
        <SectionTitle
          eyebrow="Safety-First Design"
          title="Read-only v1. Humans always decide."
          subtitle="Munin v1 is architecturally incapable of sending commands to any SCADA endpoint. This is enforced at compile-time, tested in CI, and documented in a structured safety case."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { title: 'WRITE_ACCESS = false', desc: 'Compile-time flag with CI tests proving no code path can actuate. Static analysis scans for socket/HTTP writes to SCADA ports.', badge: 'Enforced' },
            { title: 'Data diode architecture', desc: 'Ingestion is strictly one-way. Any attempt to open an outbound socket from the analysis enclave fails tests.', badge: 'Tested' },
            { title: 'Structured safety case', desc: 'GSN-style claims → evidence mapping. STPA hazard analysis with 17 unsafe control actions identified and mitigated.', badge: 'Documented' },
            { title: 'NIST 800-82 + IEC 62443', desc: 'Architecture mapped to real OT security standards. Zones, conduits, security levels, and foundational requirements traced to code.', badge: 'Compliant' },
          ].map(c => (
            <div key={c.title} style={{ padding: 24, borderRadius: 12, border: '1px solid #1a1a1a', background: '#0a0a0a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{c.title}</span>
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  background: '#22c55e15', color: '#22c55e', fontWeight: 600,
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {c.badge}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── VIDEO PLACEHOLDER ── */}
      <Section id="video" dark>
        <SectionTitle
          eyebrow="See It In Action"
          title="Full system walkthrough"
        />
        <div style={{
          maxWidth: 720, margin: '0 auto', aspectRatio: '16/9', borderRadius: 12,
          border: '1px solid #1a1a1a', background: '#0a0a0a',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 48, opacity: 0.3 }}>▶</div>
          <div style={{ fontSize: 15, color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>
            Video walkthrough coming soon
          </div>
          <div style={{ fontSize: 13, color: '#444' }}>
            CLI demo, graph visualization, cascade prediction, and packet authorization
          </div>
        </div>
      </Section>

      {/* ── DOCS ── */}
      <Section id="docs">
        <SectionTitle
          eyebrow="Documentation"
          title="Deep technical depth. Open to inspection."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { title: 'Munin Doctrine', desc: 'Vision, contrarian thesis, 10-year view', href: 'MUNIN_DOCTRINE.md' },
            { title: 'Safety Case', desc: 'GSN claims, evidence, residual risks', href: 'SAFETY_CASE.md' },
            { title: 'Threat Model', desc: 'NIST 800-82 aligned, 4 attacker profiles', href: 'THREAT_MODEL.md' },
            { title: "What's Next", desc: 'Concrete roadmap, what needs funding', href: 'WHATS_NEXT.md' },
            { title: 'Limitations', desc: 'Honest gaps and how we attack them', href: 'LIMITATIONS.md' },
            { title: 'Founder Notes', desc: 'Background, motivation, trajectory', href: 'FOUNDER_NOTES.md' },
            { title: 'Governance', desc: 'Byzantine multi-sig, quorum policies', href: 'GOVERNANCE.md' },
            { title: 'Ministry Integration', desc: 'How Munin fits into government', href: 'MINISTRY_INTEGRATION.md' },
            { title: 'Operator Handbook', desc: 'Step-by-step for field operators', href: 'OPERATOR_HANDBOOK.md' },
          ].map(d => (
            <a key={d.title} href={DOCS(d.href)} target="_blank" rel="noopener noreferrer" style={{
              padding: 16, borderRadius: 8, border: '1px solid #1a1a1a', background: '#0a0a0a',
              display: 'block', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a1a')}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{d.desc}</div>
            </a>
          ))}
        </div>
      </Section>

      {/* ── TECH STACK ── */}
      <Section id="stack" dark>
        <SectionTitle
          eyebrow="Architecture"
          title="Built for sovereign deployment"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { cat: 'Engine', items: ['Python inference engine', 'Granger causality + lag detection', 'Sensor health scoring', 'Property-based + adversarial tests'] },
            { cat: 'Cryptography', items: ['Ed25519 + ML-DSA (FIPS 204)', 'Merkle-chained audit trail', 'Shamir secret sharing', 'Multi-TEE attestation'] },
            { cat: 'Platform', items: ['Next.js 14 operator console', 'Air-gapped deployment ready', 'Data diode architecture', 'TLA+ formal specification'] },
          ].map(s => (
            <div key={s.cat} style={{ padding: 24, borderRadius: 12, border: '1px solid #1a1a1a', background: '#0a0a0a' }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: '#3b82f6', letterSpacing: '0.08em',
                fontFamily: 'JetBrains Mono, monospace', marginBottom: 16,
              }}>
                {s.cat.toUpperCase()}
              </div>
              {s.items.map(item => (
                <div key={item} style={{ fontSize: 13, color: '#a3a3a3', marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid #222' }}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      {/* ── MARKET & TIMING ── */}
      <Section id="market">
        <SectionTitle
          eyebrow="Why Now"
          title="Three forces converging"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
          {[
            {
              title: 'EU CER Directive',
              date: 'July 2026',
              desc: '27 EU member states must identify critical entities and implement cross-sector risk assessment. Compliance "will need to be technology enabled."',
              color: '#3b82f6',
            },
            {
              title: 'Post-quantum deadline',
              date: 'NIST 2024',
              desc: 'NIST standardized ML-DSA. Critical infrastructure commands signed today need quantum-safe signatures before cryptographically relevant quantum computers arrive.',
              color: '#a855f7',
            },
            {
              title: 'Cascading events accelerating',
              date: '2020–2025',
              desc: 'Storm Éowyn, Texas freeze, European heatwaves — interconnected infrastructure failures are increasing in frequency and cross-sector impact.',
              color: '#ef4444',
            },
          ].map(f => (
            <div key={f.title} style={{ padding: 24, borderRadius: 12, border: '1px solid #1a1a1a', background: '#0a0a0a' }}>
              <div style={{
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                color: f.color, letterSpacing: '0.08em', marginBottom: 8,
              }}>
                {f.date.toUpperCase()}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>What exists today vs what Munin adds</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 20, borderRadius: 8, border: '1px solid #1a1a1a', background: '#0a0a0a' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>EXISTING APPROACHES</div>
              {['Palantir — analytics, not authorization', 'Everbridge — notification, not dependency modelling', 'Siemens/ABB — sector-specific SCADA, no cross-sector view', 'Manual coordination — phone calls, email chains, committees'].map(item => (
                <div key={item} style={{ fontSize: 13, color: '#888', marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid #222' }}>{item}</div>
              ))}
            </div>
            <div style={{ padding: 20, borderRadius: 8, border: '1px solid #22c55e22', background: '#22c55e05' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>WHAT MUNIN ADDS</div>
              {['Cross-sector dependency discovery from physics', 'Pre-validated playbooks with regulatory basis', 'Cryptographic authorization packets (PQC + audit trail)', 'Byzantine multi-ministry approval in minutes, not hours'].map(item => (
                <div key={item} style={{ fontSize: 13, color: '#d4d4d4', marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid #22c55e44' }}>{item}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          padding: 24, borderRadius: 12, border: '1px solid #1a1a1a', background: '#0a0a0a',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 15, color: '#888', marginBottom: 8 }}>
            No one is treating <strong style={{ color: '#fff' }}>authorization latency</strong> as the core infrastructure problem.
          </p>
          <p style={{ fontSize: 13, color: '#555' }}>
            Everyone is building better sensors. Munin is the first system that makes the decision path fast enough to matter.
          </p>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '48px 24px', borderTop: '1px solid #111',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>
            Munin: named for the raven in Norse mythology who flies across the world
            and reports back what he sees. <em>Munin sees. Humans decide.</em>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#888' }}>GitHub</a>
            <a href={DOCS('MUNIN_DOCTRINE.md')} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#888' }}>Doctrine</a>
            <a href={DOCS('WHATS_NEXT.md')} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#888' }}>Roadmap</a>
          </div>
          <p style={{ fontSize: 13, color: '#444' }}>
            Built by{' '}
            <a href="https://github.com/jacobsprake" style={{ color: '#666' }}>Jacob Sprake</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
