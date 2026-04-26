'use client';

import { useState, useEffect, useRef } from 'react';
import GlobalSignal from './global-signal';
import MuninMark from './munin-mark';

/* ═══════════════════════════════════════════════════════
   Munin Systems — editorial / sovereign / Palantir-inspired
   ═══════════════════════════════════════════════════════ */

const GITHUB = 'https://github.com/jacobsprake/munin';
const DOCS = (name: string) => `${GITHUB}/blob/main/docs/${name}`;
const CONTACT = 'mailto:jacob@muninsystems.com?subject=Munin%20—%20Briefing%20Request';

/* ─── Intersection Observer ─── */
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

/* ─── Animated counter (used in stats strip) ─── */
function Counter({ end, suffix = '', prefix = '', duration = 1800 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
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

/* ─── Shadow-link graph (paper-tone restyle) ─── */
function ShadowLinkGraph() {
  const { ref, visible } = useInView(0.3);
  const nodes = [
    { id: 'SUB_A', x: 80, y: 60, label: 'Substation A', sector: 'POWER' },
    { id: 'PUMP_7', x: 280, y: 40, label: 'Pump Station 7', sector: 'WATER' },
    { id: 'TOWER_3', x: 460, y: 70, label: 'Cell Tower 3', sector: 'TELECOM' },
    { id: 'HOSP_1', x: 180, y: 160, label: 'Hospital A', sector: 'HEALTH' },
    { id: 'TREAT_2', x: 380, y: 170, label: 'Treatment Plant', sector: 'WATER' },
  ];
  const links = [
    { from: 0, to: 1, lag: '30s', shadow: true },
    { from: 0, to: 3, lag: '15min', shadow: false },
    { from: 1, to: 4, lag: '2min', shadow: true },
    { from: 2, to: 3, lag: '0s', shadow: false },
    { from: 0, to: 2, lag: '45s', shadow: true },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <svg viewBox="0 0 540 220" style={{ width: '100%', height: 'auto' }}>
        {links.map((l, i) => {
          const a = nodes[l.from], b = nodes[l.to];
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          return (
            <g key={i}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={l.shadow ? '#6B1E2C' : '#16181A'}
                strokeWidth={l.shadow ? 1.4 : 0.8}
                strokeDasharray={l.shadow ? '4 3' : 'none'}
                opacity={visible ? (l.shadow ? 1 : 0.45) : 0}
                style={{ transition: `opacity 0.6s ease ${0.3 + i * 0.12}s` }}
              />
              {l.shadow && (
                <text x={mx} y={my - 6} textAnchor="middle" fontSize={9} fill="#6B1E2C"
                  fontFamily="JetBrains Mono, monospace"
                  opacity={visible ? 1 : 0} style={{ transition: `opacity 0.5s ease ${0.6 + i * 0.12}s` }}>
                  {l.lag}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n, i) => (
          <g key={n.id} opacity={visible ? 1 : 0} style={{ transition: `opacity 0.4s ease ${i * 0.08}s` }}>
            <circle cx={n.x} cy={n.y} r={visible ? 14 : 8} fill="#ECEAE4" stroke="#16181A" strokeWidth={1.2}
              style={{ transition: 'r 0.6s ease' }} />
            <circle cx={n.x} cy={n.y} r={3} fill="#16181A" />
            <text x={n.x} y={n.y + 28} textAnchor="middle" fontSize={10} fill="#16181A">
              {n.label}
            </text>
            <text x={n.x} y={n.y + 40} textAnchor="middle" fontSize={8.5} fill="#7C7E83"
              fontFamily="JetBrains Mono, monospace" letterSpacing="0.06em">
              {n.sector}
            </text>
          </g>
        ))}
      </svg>
      <div style={{
        marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--rule)',
        display: 'flex', gap: 24, fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
        color: 'var(--ink-2)', letterSpacing: '0.04em',
      }}>
        <span><span style={{ display: 'inline-block', width: 18, borderTop: '1.4px dashed #6B1E2C', verticalAlign: 'middle', marginRight: 6 }} />SHADOW LINK (DISCOVERED)</span>
        <span><span style={{ display: 'inline-block', width: 18, borderTop: '0.8px solid #16181A', verticalAlign: 'middle', marginRight: 6 }} />KNOWN DEPENDENCY</span>
      </div>
    </div>
  );
}

/* ─── Cascade timeline (paper restyle) ─── */
function CascadeTimeline() {
  const { ref, visible } = useInView(0.2);
  const events = [
    { t: '0:00', label: 'Substation A trips', sector: 'POWER' },
    { t: '0:30', label: 'Pump Station 7 loses power', sector: 'WATER' },
    { t: '2:00', label: 'Treatment plant pressure drops', sector: 'WATER' },
    { t: '5:00', label: 'Cell Tower 3 on backup battery', sector: 'TELECOM' },
    { t: '15:00', label: 'Hospital A water pressure critical', sector: 'HEALTH' },
    { t: '45:00', label: 'Cell tower battery depleted', sector: 'TELECOM' },
  ];

  return (
    <div ref={ref} style={{ position: 'relative', paddingLeft: 24 }}>
      <div style={{
        position: 'absolute', left: 11, top: 8, bottom: 8, width: 1,
        background: visible ? 'var(--ink)' : 'var(--rule)',
        transition: 'background 1s ease',
      }} />
      {events.map((ev, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18,
          opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-8px)',
          transition: `all 0.5s ease ${0.15 + i * 0.1}s`,
        }}>
          <div style={{
            width: 7, height: 7, background: 'var(--ink)',
            marginTop: 6, flexShrink: 0, position: 'relative', left: -19,
          }} />
          <div style={{ marginLeft: -12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>
                T+{ev.t}
              </span>
              <span className="mono" style={{
                fontSize: 9.5, color: 'var(--ink-2)', letterSpacing: '0.1em',
              }}>
                {ev.sector}
              </span>
            </div>
            <span style={{ fontSize: 14, color: 'var(--ink)' }}>{ev.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Multi-sig flow ─── */
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
    { name: 'Environment Agency', code: 'EA' },
    { name: 'Energy Authority', code: 'OFGEM' },
    { name: 'Civil Protection', code: 'COBR' },
  ];

  return (
    <div ref={ref}>
      <div className="mono" style={{
        fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.1em',
        marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid var(--rule)',
      }}>
        QUORUM POLICY · 2 OF 3 MINISTRIES REQUIRED
      </div>

      <div className="grid-3-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {ministries.map((m, i) => {
          const signed = step > i;
          return (
            <div key={i} style={{
              padding: '20px 16px',
              border: `1px solid ${signed ? 'var(--ink)' : 'var(--rule)'}`,
              background: signed ? 'var(--paper-2)' : 'transparent',
              transition: 'all 0.4s ease',
            }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.1em', marginBottom: 8 }}>
                /{String(i + 1).padStart(2, '0')} · {m.code}
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 12, fontWeight: 500 }}>{m.name}</div>
              <div className="mono" style={{
                fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                color: signed ? 'var(--ok)' : 'var(--ink-3)',
                transition: 'color 0.3s ease',
              }}>
                {signed ? '✓ SIGNED · Ed25519' : '·· PENDING'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="box">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>
            SIGNATURES · {Math.min(step, 3)} OF 3
          </span>
          <span className="mono" style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
            color: step >= 2 ? 'var(--ok)' : 'var(--warn)',
          }}>
            {step >= 2 ? 'QUORUM MET' : 'COLLECTING…'}
          </span>
        </div>
        <div style={{ height: 2, background: 'var(--rule-soft)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: step >= 2 ? 'var(--ok)' : 'var(--warn)',
            width: `${(Math.min(step, 3) / 3) * 100}%`,
            transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
        {step >= 4 && (
          <div className="mono" style={{
            marginTop: 14, padding: '10px 12px',
            border: '1px solid var(--ok)', color: 'var(--ok)',
            fontSize: 11, letterSpacing: '0.06em', textAlign: 'center',
          }}>
            PACKET AUTHORISED · ED25519 · HASH-CHAINED · AUDIT-LOGGED
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Terminal (dark inversion) ─── */
function TerminalDemo() {
  const { ref, visible } = useInView(0.3);
  const [lineIdx, setLineIdx] = useState(0);
  const lines = [
    { text: '$ ./scripts/munin demo real-data', color: '#ECEAE4', delay: 400 },
    { text: '', color: '', delay: 200 },
    { text: '  Loading real Environment Agency river gauge data…', color: '#A8A6A0', delay: 600 },
    { text: '  source: environment.data.gov.uk/flood-monitoring', color: '#7C7E83', delay: 400 },
    { text: '', color: '', delay: 200 },
    { text: '  ✓ Loaded eden_sands_centre · 1000 readings', color: '#ECEAE4', delay: 500 },
    { text: '  ✓ Loaded petteril_botcherby · 1000 readings', color: '#ECEAE4', delay: 500 },
    { text: '', color: '', delay: 200 },
    { text: '  ── SHADOW LINK DISCOVERED ──', color: '#C26A78', delay: 600 },
    { text: '  eden_sands_centre → petteril_botcherby', color: '#ECEAE4', delay: 400 },
    { text: '    confidence  0.971', color: '#D9C58A', delay: 300 },
    { text: '    lag         300s (5 minutes)', color: '#D9C58A', delay: 300 },
    { text: '    stability   0.640', color: '#D9C58A', delay: 300 },
    { text: '', color: '', delay: 200 },
    { text: '  No synthetic data. No simulation.', color: '#A8A6A0', delay: 500 },
    { text: '  Known hydrological relationship confirmed.', color: '#7AB48A', delay: 0 },
  ];

  useEffect(() => {
    if (!visible || lineIdx >= lines.length) return;
    const timer = setTimeout(() => setLineIdx(i => i + 1), lines[lineIdx].delay);
    return () => clearTimeout(timer);
  }, [visible, lineIdx, lines.length]);

  return (
    <div ref={ref} style={{
      background: 'var(--ink-bg-2)', border: '1px solid var(--ink-rule)',
      overflow: 'hidden',
    }}>
      <div className="mono" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--ink-rule)', background: 'var(--ink-bg)',
        fontSize: 11, color: '#7C7E83', letterSpacing: '0.08em',
      }}>
        <span>MUNIN · REAL-DATA DEMO</span>
        <span>EA/FLOOD-MONITORING · 2026-01</span>
      </div>
      <div style={{ padding: '20px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.85, minHeight: 360 }}>
        {lines.slice(0, lineIdx).map((l, i) => (
          <div key={i} style={{ color: l.color, minHeight: l.text ? undefined : 8 }}>
            {l.text || ' '}
          </div>
        ))}
        {lineIdx < lines.length && (
          <span style={{ display: 'inline-block', width: 8, height: 14, background: '#ECEAE4', animation: 'pulse-cursor 0.9s infinite' }} />
        )}
      </div>
    </div>
  );
}

/* ─── Section primitives ─── */
function Section({ id, dark, children, frag }: { id: string; dark?: boolean; children: React.ReactNode; frag?: string }) {
  return (
    <section id={id} className={dark ? 'section-dark' : ''} style={{
      padding: '96px 32px',
      borderTop: dark ? '1px solid var(--ink-rule)' : '1px solid var(--rule)',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {frag && (
          <div className="frag" style={{ marginBottom: 24 }}>/{frag}</div>
        )}
        {children}
      </div>
    </section>
  );
}

function SpecHeader({ title, eyebrow, builtOn, scope, status }: {
  title: string; eyebrow: string;
  builtOn: string[]; scope: string; status: string;
}) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>{eyebrow}</div>
      <h2 className="display-md" style={{ maxWidth: 920, marginBottom: 36 }}>{title}</h2>
      <div className="spec-grid">
        <div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>BUILT ON</span>
          {builtOn.map(b => (
            <span key={b} className="mono" style={{ fontSize: 12, color: 'var(--ink)', letterSpacing: '0.02em' }}>→ {b}</span>
          ))}
        </div>
        <div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>SCOPE</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>{scope}</span>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>STATUS</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>{status}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Nav ─── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(236, 234, 228, 0.92)' : 'rgba(236, 234, 228, 0.6)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: scrolled ? '1px solid var(--rule)' : '1px solid transparent',
      transition: 'all 0.2s ease',
    }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)' }}>
          <MuninMark size={26} />
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            Munin Systems
          </span>
        </a>
        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[
            { label: 'Problem', href: '#problem' },
            { label: 'Platform', href: '#platform' },
            { label: 'Packet', href: '#packet' },
            { label: 'Demo', href: '#demo' },
            { label: 'Safety', href: '#safety' },
            { label: 'Why now', href: '#why-now' },
          ].map(s => (
            <a key={s.label} href={s.href} className="nav-link">{s.label}</a>
          ))}
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="nav-link">GitHub ↗</a>
          <a href={CONTACT} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
            Request briefing
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <main>
      <Nav />

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 120, paddingBottom: 0, padding: '160px 32px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Top spec line */}
          <div className="spec-grid" style={{ marginBottom: 64, borderTop: 'none', paddingTop: 0 }}>
            <div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>CATEGORY</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>CRITICAL-INCIDENT AUTHORISATION INFRA</span>
            </div>
            <div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>POSTURE</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>ADVISORY-MODE · HUMAN-IN-LOOP</span>
            </div>
            <div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>DEPLOYMENT</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>SOVEREIGN · ON-PREM</span>
            </div>
            <div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>JURISDICTION</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>EU · UK · NATO</span>
            </div>
          </div>

          {/* Display split — Palantir-style "Warp×Speed" treatment */}
          <h1 className="display-xl animate-fade-in-up" style={{ marginBottom: 0 }}>
            Decision
          </h1>
          <h1 className="display-xl animate-fade-in-up delay-100" style={{
            display: 'flex', alignItems: 'center', gap: 'clamp(16px, 3vw, 48px)',
            marginBottom: 0,
          }}>
            <span style={{ color: 'var(--signal)' }}>Latency.</span>
            <span aria-hidden style={{ flex: '0 0 auto', display: 'inline-block', height: '1px', background: 'var(--ink)', width: 'clamp(40px, 8vw, 120px)' }} />
            <span className="serif-italic hide-on-mobile" style={{
              fontSize: 'clamp(20px, 2.4vw, 32px)', color: 'var(--ink-2)',
              fontWeight: 400, letterSpacing: 0,
              lineHeight: 1.2, maxWidth: 320, alignSelf: 'flex-end', paddingBottom: 18,
            }}>
              the bottleneck no one is naming.
            </span>
          </h1>

          <div className="animate-fade-in-up delay-200" style={{
            marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
            paddingTop: 28, borderTop: '1px solid var(--rule)',
          }}>
            <div>
              <p className="lede" style={{ maxWidth: 520 }}>
                We do not sell better awareness. We sell <em className="serif-italic" style={{ color: 'var(--ink)' }}>faster lawful action</em> under regulatory constraints —
                cryptographically-signed multi-party authorisation packets that compress crisis decisions from
                two-to-six hours to under thirty minutes, with the audit trail CER, NIS2 and AI Act Article 14
                require by default.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                <a href={CONTACT} className="btn-primary">Request a briefing</a>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-ghost">View repository ↗</a>
              </div>
            </div>
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--ink)' }}>
              <MuninMark size={220} variant="instrument" />
            </div>
          </div>

          {/* Scroll hint */}
          <div style={{ marginTop: 96, textAlign: 'center', paddingBottom: 56 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.18em', display: 'block', marginBottom: 8 }}>
              SCROLL TO READ
            </span>
            <span aria-hidden style={{ display: 'inline-block', animation: 'scroll-hint 1.6s ease-in-out infinite' }}>↓</span>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ padding: '0 32px 96px', borderTop: '1px solid var(--rule)' }}>
        <div className="grid-4-collapse" style={{
          maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        }}>
          {[
            { v: <><Counter end={85} suffix="%" /></>, label: 'Faster authorisation', sub: '2-6 hours → 20-30 minutes' },
            { v: <Counter end={38} />, label: 'Scenarios end-to-end', sub: 'Validated under 5 seconds' },
            { v: '0.971', label: 'Real-data confidence', sub: 'EA Carlisle catchment' },
            { v: 'Ed25519', label: 'Production signing', sub: 'PQC dual-stack roadmap' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '32px 28px',
              borderRight: i < 3 ? '1px solid var(--rule)' : 'none',
              borderBottom: '1px solid var(--rule)',
              borderTop: '1px solid var(--rule)',
            }}>
              <div className="display-md" style={{ fontWeight: 500, marginBottom: 12 }}>{s.v}</div>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE GLOBAL SIGNAL ── */}
      <GlobalSignal />

      {/* ── WEDGE / CONTRARIAN POSITIONING ── */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          border: '1px solid var(--ink)',
        }} className="grid-2-collapse">
          <div style={{ padding: '40px 36px', borderRight: '1px solid var(--rule)' }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 14 }}>
              WHAT EVERYONE ELSE BUILDS
            </div>
            <p className="display-md" style={{ fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 400, color: 'var(--ink-2)' }}>
              Better <em className="serif-italic">awareness</em>.
              <br />
              Dashboards. Data fusion. Contextualisation.
            </p>
          </div>
          <div style={{ padding: '40px 36px', background: 'var(--paper-2)' }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--signal)', letterSpacing: '0.14em', marginBottom: 14 }}>
              WHAT MUNIN BUILDS
            </div>
            <p className="display-md" style={{ fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 500, color: 'var(--ink)' }}>
              Faster lawful <em className="serif-italic" style={{ color: 'var(--signal)' }}>action</em>.
              <br />
              Signable, auditable, oversight-centred decisions.
            </p>
          </div>
        </div>
      </section>

      {/* ── OPERATOR WORKFLOW · FIVE VERBS ── */}
      <section style={{ padding: '96px 32px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="frag" style={{ marginBottom: 24 }}>/M.W · OPERATOR WORKFLOW</div>
          <h2 className="display-md" style={{ maxWidth: 920, marginBottom: 56 }}>
            Five verbs, in order.
            <br />
            <span style={{ color: 'var(--ink-2)' }}>From signal to signed action to evidence pack.</span>
          </h2>

          <div className="grid-5-collapse" style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            borderTop: '1px solid var(--rule)',
          }}>
            {[
              { n: '01', verb: 'See',        desc: 'Cross-sector telemetry surfaces an anomaly. Shadow-link discovery makes the dependency legible.' },
              { n: '02', verb: 'Understand', desc: 'The cascade engine forecasts which sectors fail next, in what order, on what timescale.' },
              { n: '03', verb: 'Review',     desc: 'A pre-formed authorisation packet arrives with evidence, predicted impact, and legal basis.' },
              { n: '04', verb: 'Sign',       desc: 'Named ministries authorise via biometric M-of-N quorum. No single entity can unilaterally act.' },
              { n: '05', verb: 'Prove',      desc: 'Every recommendation, signature, and override hashes into a tamper-evident audit chain.' },
            ].map((s, i) => (
              <div key={s.n} style={{
                padding: '32px 24px',
                borderRight: i < 4 ? '1px solid var(--rule)' : 'none',
                borderBottom: '1px solid var(--rule)',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
                  /{s.n}
                </span>
                <span style={{
                  fontSize: 'clamp(28px, 3vw, 40px)',
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  color: 'var(--ink)',
                  lineHeight: 1,
                }}>
                  {s.verb}.
                </span>
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM (M.1) ── */}
      <Section id="problem" frag="M.1">
        <SpecHeader
          eyebrow="The authorisation latency problem"
          title="Cascades move in minutes. Cross-agency authorisation moves in hours. The gap is where civilians die."
          builtOn={['Detection', 'Coordination', 'Authority']}
          scope="EU + UK critical infrastructure"
          status="Documented in every major post-incident review since 2005"
        />

        <div className="grid-2-collapse" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--signal)', letterSpacing: '0.12em', marginBottom: 18 }}>
              TRADITIONAL COORDINATION · 2-6 HOURS
            </div>
            {[
              ['Incident detection', '~10 min'],
              ['Cross-agency phone calls', '45 min'],
              ['Legal review', '60 min'],
              ['Multi-ministry approval', '120 min'],
              ['Command execution', '10 min'],
            ].map(([k, v], i) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '14px 0', borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule-soft)',
              }}>
                <span style={{ fontSize: 14, color: 'var(--ink)' }}>{k}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>TOTAL</span>
              <span className="mono" style={{ fontSize: 18, color: 'var(--signal)', fontWeight: 500 }}>2-6 HOURS</span>
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ok)', letterSpacing: '0.12em', marginBottom: 18 }}>
              WITH MUNIN · 20-30 MINUTES
            </div>
            {[
              ['Incident detection (same)', '~10 min'],
              ['Playbook retrieval', '< 1 s'],
              ['Authorisation packet generated', '< 1 s'],
              ['3× biometric multi-sig', '15 min'],
              ['Command execution (same)', '10 min'],
            ].map(([k, v], i) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '14px 0', borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule-soft)',
              }}>
                <span style={{ fontSize: 14, color: 'var(--ink)' }}>{k}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>TOTAL</span>
              <span className="mono" style={{ fontSize: 18, color: 'var(--ok)', fontWeight: 500 }}>20-30 MIN</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── EVIDENCE / HISTORICAL CASCADES (M.2) ── */}
      <Section id="evidence" frag="M.2">
        <div className="eyebrow" style={{ marginBottom: 18 }}>The evidence · seven decades of the same failure mode</div>
        <h2 className="display-md" style={{ maxWidth: 940, marginBottom: 56 }}>
          The technology to detect the problem existed.
          <br />
          <span style={{ color: 'var(--ink-2)' }}>The authority to act did not arrive in time.</span>
        </h2>

        <div className="grid-2-collapse" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            { name: 'Iberian Peninsula Blackout', year: '2025', delay: '90s collapse · 16h recover',
              detail: '47 million people lost power when Spain and Portugal\'s grids collapsed in under 90 seconds. The ENTSO-E Expert Panel\'s final report (March 2026) attributed the collapse to "institutional rather than technical" failures — "governance fragmentation [that] impeded coordinated crisis response."',
              source: 'ENTSO-E Expert Panel, 20 March 2026' },
            { name: 'Hurricane Helene', year: '2024', delay: 'Comms collapse',
              detail: 'Hurricane Helene destroyed North Carolina\'s public-safety communications network in a single afternoon. The state\'s after-action review cites interoperability failures and unclear cross-agency roles as the primary delay drivers.',
              source: 'NC DPS After-Action Review, 2025' },
            { name: 'Hurricane Katrina', year: '2005', delay: '37 days',
              detail: 'FEMA, state, and Red Cross operated in parallel without coordination. Meals took 37 days to reach some areas. The Select Bipartisan Committee found "the single most important failure was coordination."',
              source: 'Select Bipartisan Committee Report, 2006' },
            { name: 'Fukushima Daiichi', year: '2011', delay: '7+ hours',
              detail: 'Reactor venting was delayed seven hours while operators, TEPCO management, and the Prime Minister\'s office argued over authorisation. Evacuation was uncoordinated across jurisdictions.',
              source: 'NAIIC Report to the Japanese Diet, 2012' },
            { name: 'UK Summer Floods', year: '2007', delay: '3-5 hours',
              detail: 'Cross-government coordination took 3-5 hours per decision. The Pitt Review recommended "a single framework for multi-agency response" — which still does not exist.',
              source: 'The Pitt Review, Cabinet Office, 2008' },
            { name: 'Storm Desmond · Carlisle', year: '2015', delay: '2-6 hours',
              detail: 'Power substation flooded → water pumps failed → treatment offline → hospitals on emergency supply. Each agency responded independently. Cross-sector cascade was not predicted.',
              source: 'Environment Agency Post-Incident Review, 2016' },
          ].map((d, i) => (
            <article key={d.name} style={{
              padding: '32px 28px',
              borderTop: '1px solid var(--rule)',
              borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
              borderBottom: i >= 4 ? '1px solid var(--rule)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>
                  {d.name} <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 6 }}>{d.year}</span>
                </h3>
                <span className="mono" style={{ fontSize: 11, color: 'var(--signal)', letterSpacing: '0.06em' }}>
                  {d.delay}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 14 }}>{d.detail}</p>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{d.source}</div>
            </article>
          ))}
        </div>
      </Section>

      {/* ── PLATFORM / SHADOW LINKS (M.3) ── */}
      <Section id="platform" frag="M.3">
        <SpecHeader
          eyebrow="The platform · shadow-link discovery"
          title="Cross-sector dependencies exist in physics, not in any database."
          builtOn={['Time-series correlation', 'Lag detection', 'Sensor health']}
          scope="Power · Water · Telecom · Health"
          status="Layer 1 validated on live UK Environment Agency data"
        />

        <div className="grid-2-collapse" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <p className="lede" style={{ marginBottom: 24 }}>
              A power substation and a water pump station three kilometres away are causally linked in physics.
              No database records the dependency. Munin infers it from temporal co-movement and lag — and writes it down.
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 32 }}>
              Once shadow links are surfaced, Munin runs cascade simulations across the implied graph and pairs each
              predicted failure with a pre-validated playbook and the legal basis for action.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
              {[
                { k: 'Temporal correlation', v: 'Statistical co-movement between sensor feeds across sectors' },
                { k: 'Lag detection', v: 'Physical delay between cause and effect (e.g. 30 s power → water)' },
                { k: 'Evidence windows', v: 'Sliding confidence intervals with stability and health scoring' },
              ].map((f, i) => (
                <div key={f.k} style={{
                  padding: '18px 0',
                  borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule-soft)',
                  borderBottom: i === 2 ? '1px solid var(--ink)' : 'none',
                }}>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, marginBottom: 4 }}>{f.k}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="box" style={{ padding: 32 }}>
            <ShadowLinkGraph />
          </div>
        </div>
      </Section>

      {/* ── CASCADE PREDICTION (M.4) ── */}
      <Section id="cascade" frag="M.4">
        <div className="eyebrow" style={{ marginBottom: 18 }}>Cascade prediction</div>
        <h2 className="display-md" style={{ maxWidth: 920, marginBottom: 56 }}>
          See the failure propagate before it happens.
        </h2>

        <div className="grid-2-collapse" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.12em', marginBottom: 24 }}>
              T+0 → T+45MIN · STORM DESMOND · CARLISLE
            </div>
            <CascadeTimeline />
          </div>
          <div>
            <div className="box-strong" style={{ padding: 28, marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--signal)', letterSpacing: '0.12em', marginBottom: 12 }}>
                MUNIN RECOMMENDATION
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 12 }}>
                Activate backup power to Pump Station 7
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 18 }}>
                Prevents downstream cascade to treatment plant and hospital.
                Estimated impact reduction: 4 sectors → 1 sector.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Flood Risk Act §12.3', 'EA Standing Order 7'].map(r => (
                  <span key={r} className="mono" style={{
                    fontSize: 11, padding: '4px 10px',
                    border: '1px solid var(--rule)', color: 'var(--ink-2)',
                    letterSpacing: '0.04em',
                  }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="mono" style={{
              padding: '14px 18px',
              border: '1px solid var(--ok)', color: 'var(--ok)',
              fontSize: 11, letterSpacing: '0.06em', textAlign: 'center',
            }}>
              PLAYBOOK PRE-VALIDATED · EVIDENCE PACKAGED · READY FOR SIGN-OFF
            </div>
          </div>
        </div>
      </Section>

      {/* ── MULTI-SIG (M.5) ── */}
      <Section id="authorization" frag="M.5">
        <SpecHeader
          eyebrow="Byzantine multi-ministry approval"
          title="No single entity can unilaterally authorise a dangerous action."
          builtOn={['Ed25519', 'M-of-N quorum', 'Hash-chained audit']}
          scope="Cross-jurisdictional sign-off"
          status="Production cryptography · ML-DSA roadmap"
        />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <MultiSigFlow />
        </div>
      </Section>

      {/* ── INSIDE THE PACKET (M.5b) ── */}
      <Section id="packet" frag="M.5b">
        <div className="eyebrow" style={{ marginBottom: 18 }}>Inside the authorisation packet</div>
        <h2 className="display-md" style={{ maxWidth: 940, marginBottom: 24 }}>
          One document. <span className="serif-italic" style={{ color: 'var(--ink-2)' }}>Eight fields.</span> Tamper-evident from generation.
        </h2>
        <p className="lede" style={{ maxWidth: 760, marginBottom: 56 }}>
          Munin&apos;s output is not a dashboard. It is a single signable document — a packet that travels with its evidence,
          its predicted cascade, the legal basis for the action, and a quorum of named signatories. Every field is
          deterministic. Every byte is hashed.
        </p>

        <div className="grid-2-collapse" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 56, alignItems: 'start' }}>
          {/* Packet document */}
          <div className="box" style={{ padding: 0, background: 'var(--paper-2)' }}>
            {/* Packet header */}
            <div style={{
              padding: '14px 22px',
              borderBottom: '1px solid var(--ink)',
              background: 'var(--paper)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink)', letterSpacing: '0.1em' }}>
                AUTHORISATION PACKET
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.08em' }}>
                FORMAT v1 · ED25519 · ADVISORY MODE
              </span>
            </div>

            {/* Packet body */}
            {[
              { n: '01', label: 'IDENTIFIER',
                body: <span className="mono" style={{ fontSize: 12, color: 'var(--ink)' }}>MUNIN-PKT-2026-04-26-001</span> },
              { n: '02', label: 'INCIDENT SUMMARY',
                body: <>Storm Desmond cascade trigger · Carlisle catchment.<br />Substation A flooded; downstream cross-sector cascade projected.</> },
              { n: '03', label: 'EVIDENCE BASIS',
                body: (
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                    source · environment.data.gov.uk/flood-monitoring<br />
                    gauge  · eden_sands_centre  · 1000 readings<br />
                    confidence 0.971 · lag 300s · stability 0.640
                  </div>
                ) },
              { n: '04', label: 'PREDICTED CASCADE',
                body: (
                  <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.85 }}>
                    <span className="mono" style={{ color: 'var(--signal)' }}>T+0:30</span> · Pump Station 7 — power loss<br />
                    <span className="mono" style={{ color: 'var(--signal)' }}>T+2:00</span> · Treatment Plant — pressure drop<br />
                    <span className="mono" style={{ color: 'var(--signal)' }}>T+5:00</span> · Cell Tower 3 — backup battery<br />
                    <span className="mono" style={{ color: 'var(--signal)' }}>T+15:00</span> · Hospital A — water pressure critical
                  </div>
                ) },
              { n: '05', label: 'RECOMMENDED INTERVENTION',
                body: <>Activate backup power supply at Pump Station 7. Estimated impact reduction: 4 sectors → 1 sector.</> },
              { n: '06', label: 'LEGAL BASIS',
                body: (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Flood Risk Act §12.3', 'EA Standing Order 7'].map(r => (
                      <span key={r} className="mono" style={{
                        fontSize: 11, padding: '3px 9px',
                        border: '1px solid var(--rule)', color: 'var(--ink-2)',
                      }}>{r}</span>
                    ))}
                  </div>
                ) },
              { n: '07', label: 'SIGNATORIES · QUORUM 2 OF 3',
                body: (
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink)', lineHeight: 1.85 }}>
                    <span style={{ color: 'var(--ok)' }}>✓</span>  EA     · S. Patel    · 13:42:18 UTC · ed25519:7c3a…f019<br />
                    <span style={{ color: 'var(--ok)' }}>✓</span>  OFGEM  · J. Müller   · 13:43:47 UTC · ed25519:9b41…a8e2<br />
                    <span style={{ color: 'var(--ink-3)' }}>·</span>  COBR   · pending (advisory)
                  </div>
                ) },
              { n: '08', label: 'INTEGRITY · HASH-CHAINED',
                body: (
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                    prev  sha256:a72f…c83a<br />
                    curr  sha256:3b9e…d447
                  </div>
                ) },
            ].map((row, i) => (
              <div key={row.n} style={{
                display: 'grid',
                gridTemplateColumns: '52px 1fr',
                padding: '18px 22px',
                borderBottom: i < 7 ? '1px solid var(--rule-soft)' : 'none',
                gap: 16,
              }}>
                <div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--signal)', fontWeight: 500, letterSpacing: '0.06em' }}>
                    /{row.n}
                  </span>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 6 }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>{row.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Annotations */}
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--rule)' }}>
              ANNOTATIONS · WHY EACH FIELD MATTERS
            </div>
            {[
              { n: '01', text: 'Stable cross-agency reference. Cited in audit, post-incident review, and regulator filings.' },
              { n: '02', text: 'Plain-language summary derived from the cascade engine. Designed to be readable by a non-technical signatory under time pressure.' },
              { n: '03', text: 'Source data references with reproducible provenance, time windows, and confidence scores. Anyone can re-run the inference.' },
              { n: '04', text: 'The downstream impact path Munin\'s engine forecasts if no action is taken, with sector-by-sector timing.' },
              { n: '05', text: 'A pre-validated playbook tied to the predicted cascade. Specific operational steps, not vague guidance.' },
              { n: '06', text: 'Citation to the specific statute that authorises the action. This is what makes the eventual signature lawful.' },
              { n: '07', text: 'Named signatories with biometric Ed25519 signatures and timestamped quorum policy. Article 14 by construction.' },
              { n: '08', text: 'Hash-chained audit anchor. The packet is tamper-evident from the moment it is generated.' },
            ].map(a => (
              <div key={a.n} style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr',
                padding: '14px 0',
                borderBottom: '1px solid var(--rule-soft)',
                gap: 12,
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--signal)', fontWeight: 500, letterSpacing: '0.06em' }}>
                  /{a.n}
                </span>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{a.text}</p>
              </div>
            ))}

            <div style={{
              marginTop: 24, padding: '14px 18px',
              border: '1px solid var(--ink)', background: 'var(--paper)',
              fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.55,
            }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--signal)', letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>
                THE WHOLE POINT
              </span>
              The packet is the product. Everything upstream — the engine, the graph, the playbooks — exists to assemble it.
              Everything downstream — operator review, ministry signing, audit trail — operates on it.
            </div>
          </div>
        </div>
      </Section>

      {/* ── DEMO (M.6) ── */}
      <Section id="demo" frag="M.6" dark>
        <div className="eyebrow" style={{ marginBottom: 18, color: '#A8A6A0' }}>Live demo · real Environment Agency data</div>
        <h2 className="display-md" style={{ maxWidth: 920, marginBottom: 36, color: '#ECEAE4' }}>
          Real data. Real results.
        </h2>
        <p className="lede" style={{ maxWidth: 720, marginBottom: 48, color: '#BFBCB3' }}>
          Running on actual Environment Agency river-gauge data from the Carlisle catchment. No synthetic data.
          No simulation. Munin discovered the known hydrological relationship between the River Eden and River Petteril
          — the 5-minute lag matches physical rainfall travel time.
        </p>
        <TerminalDemo />
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <a href={DOCS('DEMO_WALKTHROUGH.md')} target="_blank" rel="noopener noreferrer" className="btn-ghost"
            style={{ borderColor: 'var(--ink-rule)', color: '#ECEAE4' }}>
            Full walkthrough ↗
          </a>
        </div>
      </Section>

      {/* ── SAFETY (M.7) ── */}
      <Section id="safety" frag="M.7">
        <SpecHeader
          eyebrow="Safety-first architecture"
          title="Read-only v1. Humans always decide."
          builtOn={['WRITE_ACCESS=false', 'Data-diode ingress', 'STPA hazard analysis']}
          scope="Advisory mode only — no SCADA writes"
          status="EU AI Act Article 14 compliant from first principles"
        />
        <div className="grid-2-collapse" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            { title: 'WRITE_ACCESS = false', desc: 'Runtime read-only guard. CI static analysis scans every engine file for socket / HTTP writes to SCADA ports.', tag: 'Enforced' },
            { title: 'Data-diode architecture', desc: 'Ingestion is strictly one-way. Any attempt to open an outbound socket from the analysis enclave fails tests.', tag: 'Tested' },
            { title: 'Structured safety case', desc: 'GSN-style claims → evidence mapping. STPA hazard analysis with 17 unsafe control actions identified and mitigated.', tag: 'Documented' },
            { title: 'NIST 800-82 + IEC 62443', desc: 'Architecture mapped to OT security standards. Zones, conduits, security levels and foundational requirements traced to code.', tag: 'Compliant' },
          ].map((c, i) => (
            <div key={c.title} style={{
              padding: '32px 28px',
              borderTop: '1px solid var(--rule)',
              borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
              borderBottom: i >= 2 ? '1px solid var(--rule)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{c.title}</h3>
                <span className="mono" style={{
                  fontSize: 10, color: 'var(--ok)', letterSpacing: '0.1em',
                  border: '1px solid var(--ok)', padding: '2px 8px',
                }}>
                  {c.tag.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 56, padding: 36,
          border: '1px solid var(--ink)', background: 'var(--paper-2)',
        }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-2)', letterSpacing: '0.14em', marginBottom: 12 }}>
            EU AI ACT · ARTICLE 14 · LEGAL REQUIREMENT FROM 2 AUGUST 2026
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink)', maxWidth: 880 }}>
            Munin&apos;s advisory-mode architecture — humans authorise, never systems — is not a marketing reassurance.
            Under the EU AI Act, human-in-the-loop is a <em className="serif-italic">legal requirement</em> for high-risk
            AI systems. Autonomous-execution platforms must retrofit oversight scaffolding or exit the high-risk category.
            Munin is architecturally compliant from first principles.
          </p>
        </div>
      </Section>

      {/* ── ENGINEERING (M.8) ── */}
      <Section id="engineering" frag="M.8">
        <div className="eyebrow" style={{ marginBottom: 18 }}>Engineering · empty repo to validated platform</div>
        <h2 className="display-md" style={{ maxWidth: 920, marginBottom: 56 }}>
          Built solo. <span className="serif-italic" style={{ color: 'var(--ink-2)' }}>Fourteen weeks.</span> Every commit public.
        </h2>

        <div className="grid-4-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[
            { v: <><Counter end={14} /> wk</>, label: 'Empty repo → validated', sub: 'From 9 January 2026' },
            { v: <><Counter end={77} />K</>, label: 'Lines of code', sub: 'Python + TypeScript' },
            { v: <Counter end={393} />, label: 'Passing tests', sub: '144 Py · 249 JS' },
            { v: <><Counter end={8} />·<Counter end={7} /></>, label: 'Stages · layers', sub: 'Ingest → audit' },
            { v: '< 5s', label: 'End-to-end on a laptop', sub: 'Storm Desmond replay' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '28px 24px',
              borderTop: '1px solid var(--rule)',
              borderBottom: '1px solid var(--rule)',
              borderRight: i < 4 ? '1px solid var(--rule)' : 'none',
            }}>
              <div className="display-md" style={{ fontWeight: 500, marginBottom: 10 }}>{s.v}</div>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <p className="lede" style={{ marginTop: 48, maxWidth: 880 }}>
          Eight-stage pipeline — ingest → graph inference → sensor health → anomaly detection → incident build →
          cascade prediction → authorisation packets → governance audit. Seven-layer intelligence stack including
          physics-informed neural ODE (RK4), GNN message passing, ensemble Kalman filter, differential privacy with
          Rényi accounting. Layer 1 validated on live UK Environment Agency data; layers 2-7 on synthetic data
          pending pilot telemetry.
        </p>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-ghost">View repository ↗</a>
          <a href={DOCS('MUNIN_DOCTRINE.md')} target="_blank" rel="noopener noreferrer" className="btn-ghost">Read the doctrine ↗</a>
        </div>

        <div style={{
          marginTop: 56, padding: '24px 28px',
          borderLeft: '2px solid var(--signal)', background: 'var(--paper-2)',
        }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--signal)', letterSpacing: '0.14em', marginBottom: 8 }}>
            PILOT STATUS · HONEST LINE
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65 }}>
            No named customer yet. First wedge: <strong style={{ color: 'var(--ink)' }}>one sector pair</strong>{' '}
            (power + water, or flood + grid), one designated entity, 90-day shadow-mode evaluation.
            Exit deliverable is a <strong style={{ color: 'var(--ink)' }}>compliance &amp; response evidence pack</strong>{' '}
            mapped directly to CER, NIS2 Article 23 and AI Act Article 14 obligations — not a platform transformation.
            Open to introductions —{' '}
            <a href={CONTACT} style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)' }}>jacob@muninsystems.com</a>.
          </p>
        </div>
      </Section>

      {/* ── WHY NOW (M.9) ── */}
      <Section id="why-now" frag="M.9">
        <div className="eyebrow" style={{ marginBottom: 18 }}>Why now · five forces converging</div>
        <h2 className="display-md" style={{ maxWidth: 940, marginBottom: 56 }}>
          The regulatory window opens in weeks, <span style={{ color: 'var(--ink-2)' }}>not years.</span>
        </h2>

        <div className="grid-3-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { title: 'Iberian blackout', date: '28 April 2025',
              desc: '47 million people dark. ENTSO-E\'s final expert panel: the cascade "unfolded faster than human operators could respond" due to "governance fragmentation." Munin\'s thesis delivered verbatim by 49 regulators.' },
            { title: 'EU CER directive — designation deadline', date: '17 July 2026',
              desc: 'All 27 member states must designate critical entities. ~3,000 entities into scope. Cross-sector risk assessment becomes a legal requirement. Resilience obligations apply 10 months post-designation.' },
            { title: 'NIS2 — board-level personal liability', date: 'Article 20 · in force',
              desc: 'Article 20 makes management bodies personally accountable for cybersecurity risk-management measures. Article 23 forces 24-hour and 72-hour incident reporting. Fines to €10M or 2% of global turnover. Personal liability is what actually drives procurement timing — not the fines.' },
            { title: 'EU AI Act · Article 14', date: '2 August 2026',
              desc: 'Human-in-the-loop is now a legal requirement for high-risk AI systems. Munin\'s "humans still decide" architecture is the compliance posture the regulation mandates.' },
            { title: 'European sovereignty momentum', date: 'Nov 2025 →',
              desc: 'Franco-German sovereignty summit. €180M Commission sovereign cloud tender. ~90% of European digital infrastructure foreign-controlled. European-origin critical-infrastructure software has unprecedented political tailwind.' },
            { title: 'Post-quantum transition', date: 'FIPS 204 · CNSA 2.0',
              desc: 'NIST FIPS 204 finalised August 2024. CNSA 2.0 mandates pure PQC by 2035. Munin is PQC-native by design.' },
          ].map((f, i) => (
            <article key={f.title} style={{
              padding: '32px 28px',
              borderTop: '1px solid var(--rule)',
              borderRight: (i % 3) < 2 ? '1px solid var(--rule)' : 'none',
              borderBottom: i >= 3 ? '1px solid var(--rule)' : 'none',
            }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--signal)', letterSpacing: '0.12em', marginBottom: 10 }}>
                {f.date.toUpperCase()}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.65 }}>{f.desc}</p>
            </article>
          ))}
        </div>

        <div style={{
          marginTop: 64,
          padding: 40,
          border: '1px solid var(--ink)',
          background: 'var(--paper-2)',
          textAlign: 'center',
        }}>
          <p className="display-md" style={{ fontSize: 'clamp(20px, 2.4vw, 30px)', maxWidth: 880, margin: '0 auto', fontWeight: 400 }}>
            Authorisation, not awareness.
            <br />
            <span className="serif-italic" style={{ color: 'var(--signal)' }}>Munin makes the decision path fast enough — and lawful enough — to matter.</span>
          </p>
        </div>
      </Section>

      {/* ── DOCS (M.10) ── */}
      <Section id="docs" frag="M.10">
        <div className="eyebrow" style={{ marginBottom: 18 }}>Documentation · open to inspection</div>
        <h2 className="display-md" style={{ maxWidth: 920, marginBottom: 48 }}>Deep technical depth.</h2>

        <div className="grid-3-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
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
          ].map((d, i) => {
            const col = i % 3;
            return (
              <a key={d.title} href={DOCS(d.href)} target="_blank" rel="noopener noreferrer" style={{
                padding: '24px 24px',
                borderTop: '1px solid var(--rule)',
                borderRight: col < 2 ? '1px solid var(--rule)' : 'none',
                borderBottom: i >= 6 ? '1px solid var(--rule)' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: 16, transition: 'background 0.18s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{d.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{d.desc}</div>
                </div>
                <span className="mono" style={{ fontSize: 16, color: 'var(--ink-3)' }}>↗</span>
              </a>
            );
          })}
        </div>
      </Section>

      {/* ── FOUNDER (M.11) ── */}
      <Section id="founder" frag="M.11">
        <div className="grid-2-collapse" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 64 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 18 }}>Founder</div>
            <h3 className="display-md" style={{ fontSize: 'clamp(28px, 3vw, 38px)', marginBottom: 8 }}>Jacob Sprake</h3>
            <p className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.06em', marginBottom: 24 }}>
              FOUNDER · MUNIN SYSTEMS · MILAN
            </p>
            <div style={{ color: 'var(--ink)' }}>
              <MuninMark size={160} variant="instrument" />
            </div>
          </div>
          <div>
            <p className="lede" style={{ marginBottom: 24 }}>
              Built Munin solo from an empty repo in fourteen weeks — engine, cryptography, safety case, documentation.
              Every commit public.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
              {[
                'Founder · City of London Youth Natural Environment Board',
                'Head of Marketing · StudyStream (YC) — alongside Munin',
                'Field research: Iceland, Norway',
              ].map((item, i) => (
                <li key={item} style={{
                  fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6,
                  padding: '14px 0',
                  borderTop: '1px solid var(--rule-soft)',
                  borderBottom: i === 2 ? '1px solid var(--rule-soft)' : 'none',
                }}>
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={CONTACT} className="btn-primary">Get in touch</a>
              <a href="https://github.com/jacobsprake" target="_blank" rel="noopener noreferrer" className="btn-ghost">GitHub profile ↗</a>
              <a href={DOCS('FOUNDER_NOTES.md')} target="_blank" rel="noopener noreferrer" className="btn-ghost">Founder notes ↗</a>
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA STRIP ── */}
      <section style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '96px 32px',
        borderTop: '1px solid var(--ink)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="eyebrow" style={{ color: '#A8A6A0', marginBottom: 24 }}>
            Seeking deployment partners · water · energy · civil protection
          </div>
          <h2 className="display-lg" style={{ color: 'var(--paper)', maxWidth: 940, marginBottom: 32 }}>
            Munin deploys on <em className="serif-italic" style={{ color: '#C26A78' }}>your</em> infrastructure.
            <br />
            Your data never leaves your jurisdiction.
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={CONTACT} style={{
              padding: '14px 32px', background: 'var(--paper)', color: 'var(--ink)',
              fontWeight: 500, fontSize: 15, display: 'inline-block',
            }}>
              Request a pilot briefing
            </a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" style={{
              padding: '14px 32px', background: 'transparent', color: 'var(--paper)',
              fontWeight: 500, fontSize: 15, border: '1px solid var(--ink-rule)', display: 'inline-block',
            }}>
              View repository ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '48px 32px',
        borderTop: '1px solid var(--rule)',
        background: 'var(--paper)',
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48,
        }} className="grid-4-collapse">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'var(--ink)' }}>
              <MuninMark size={24} />
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>Munin Systems</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 320 }}>
              Named for the raven in Norse mythology who flies across the world and reports back what he sees.
              <br />
              <em className="serif-italic" style={{ color: 'var(--ink)' }}>Munin sees. Humans decide.</em>
            </p>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 14 }}>PLATFORM</div>
            <a href="#problem" className="nav-link" style={{ display: 'block', marginBottom: 8 }}>The problem</a>
            <a href="#platform" className="nav-link" style={{ display: 'block', marginBottom: 8 }}>The platform</a>
            <a href="#demo" className="nav-link" style={{ display: 'block', marginBottom: 8 }}>Live demo</a>
            <a href="#safety" className="nav-link" style={{ display: 'block' }}>Safety architecture</a>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 14 }}>RESOURCES</div>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'block', marginBottom: 8 }}>GitHub ↗</a>
            <a href={DOCS('MUNIN_DOCTRINE.md')} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'block', marginBottom: 8 }}>Doctrine</a>
            <a href={DOCS('WHATS_NEXT.md')} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'block', marginBottom: 8 }}>Roadmap</a>
            <a href={`${GITHUB}/blob/main/SECURITY.md`} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'block', marginBottom: 8 }}>Security</a>
            <a href="/privacy" className="nav-link" style={{ display: 'block' }}>Privacy notice</a>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginBottom: 14 }}>CONTACT</div>
            <a href={CONTACT} className="nav-link" style={{ display: 'block', marginBottom: 8 }}>jacob@muninsystems.com</a>
            <span className="nav-link" style={{ display: 'block', marginBottom: 8 }}>Milan, IT</span>
            <a href="https://github.com/jacobsprake" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'block' }}>github.com/jacobsprake</a>
          </div>
        </div>
        <div style={{
          maxWidth: 1180, margin: '40px auto 0', paddingTop: 24,
          borderTop: '1px solid var(--rule)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
            © 2026 MUNIN SYSTEMS · ALL RIGHTS RESERVED
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
            GENESIS RELEASE · BUILT IN MILAN
          </span>
        </div>
      </footer>
    </main>
  );
}
