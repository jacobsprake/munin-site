import type { Metadata } from 'next';
import Link from 'next/link';
import MuninMark from '../munin-mark';

export const metadata: Metadata = {
  title: 'Maturity — Munin Systems',
  description: 'A line-by-line declaration of what runs today, what is fixture-backed demo, what is funded roadmap, and what is post-Series-A vision. The line is published so it cannot be blurred.',
  robots: 'index, follow',
};

type Maturity = 'LIVE' | 'DEMO' | 'ROADMAP' | 'VISION';

const META: Record<Maturity, { color: string; long: string }> = {
  LIVE: {
    color: 'var(--ok)',
    long: 'Shipping today. A reviewer who clones the repository and runs the demo can verify the claim end-to-end.',
  },
  DEMO: {
    color: 'var(--imperial)',
    long: 'Cinematic on the site, fixture-backed in the repository. Communicates the design intent; the production engine path will look like this when the next chip is unlocked.',
  },
  ROADMAP: {
    color: 'var(--warn)',
    long: 'Scoped and budgeted. Built within the first 18 months of pilot engagement plus seed-stage funding. Gating dependencies are named.',
  },
  VISION: {
    color: 'var(--ink-3)',
    long: 'Post-Series-A. The satellite / federated / cross-jurisdiction layer. Documented in the repository so the trajectory is legible — not a near-term promise.',
  },
};

interface Row {
  feature: string;
  maturity: Maturity;
  detail: string;
  unlock?: string;
}

interface Section {
  name: string;
  intro?: string;
  rows: Row[];
}

const SECTIONS: Section[] = [
  {
    name: 'Engine',
    intro: 'The eight-stage inference pipeline.',
    rows: [
      { feature: 'Shadow-link discovery (Layer 1)', maturity: 'LIVE',
        detail: 'Time-series correlation with lag detection. Validated on live UK Environment Agency river-gauge data, Carlisle catchment. 0.971 confidence on the eden_sands_centre → petteril_botcherby pair, 1 000-reading window.' },
      { feature: 'Eight-stage pipeline structure', maturity: 'LIVE',
        detail: 'Ingest → graph inference → sensor health → anomaly detection → incident build → cascade prediction → authorisation packets → governance audit. Stages exist; layer maturity varies.' },
      { feature: 'Storm Desmond cascade replay', maturity: 'LIVE',
        detail: 'End-to-end pipeline run on a known historical scenario in under five seconds on a laptop.' },
      { feature: 'Cascade prediction on synthetic graphs', maturity: 'DEMO',
        detail: 'Layers 2–7 are exercised on synthetic data sufficient to validate the architecture, insufficient to claim production readiness.' },
      { feature: 'Physics-informed neural ODE (Layer 2)', maturity: 'DEMO',
        detail: 'Architecture and integration scheme implemented; trained on synthetic cascades pending pilot telemetry.' },
      { feature: 'GNN message passing (Layer 3)', maturity: 'DEMO',
        detail: 'Cross-sector dependency graph propagation. Synthetic graphs only.', unlock: 'Operator telemetry from first pilot.' },
      { feature: 'Ensemble Kalman filter (Layer 4)', maturity: 'DEMO', detail: 'State estimation across noisy sensor fusion. Synthetic only.' },
      { feature: 'Differential privacy with Rényi accounting (Layer 7)', maturity: 'DEMO',
        detail: 'Privacy-preserving aggregation across operators. Mechanism implemented; budget calibration pending real cross-operator deployment.' },
      { feature: 'Cascade prediction on live operator telemetry', maturity: 'ROADMAP',
        detail: 'Layers 2–7 trained on real SCADA / sensor / ministry feeds.', unlock: 'First pilot, 90-day shadow-mode evaluation.' },
      { feature: 'Federated learning across operators', maturity: 'VISION',
        detail: 'Cross-operator model improvement without raw-data sharing. Requires multi-tenant deployment and inter-operator legal agreements.' },
    ],
  },
  {
    name: 'Cryptography',
    rows: [
      { feature: 'Ed25519 packet signing', maturity: 'LIVE', detail: 'Production cryptography from libsodium. Each authorisation packet is signed with the operator key.' },
      { feature: 'Hash-chained audit log', maturity: 'LIVE', detail: 'SHA-256 chain over every packet, recommendation, signature, and override. Tamper-evident from generation.' },
      { feature: 'Authorisation packet format v1', maturity: 'LIVE', detail: 'Eight-field deterministic structure (identifier, summary, evidence, predicted cascade, intervention, legal basis, signatories, integrity).' },
      { feature: 'M-of-N quorum policy (config + UX)', maturity: 'DEMO', detail: 'Quorum policy expressed in config; signing UX rendered. The animated multi-ministry approval is illustrative.' },
      { feature: 'M-of-N signature verification in engine path', maturity: 'ROADMAP',
        detail: 'Threshold-signature verification gating packet acceptance.', unlock: 'Pilot deliverable, end of months 0–6.' },
      { feature: 'ML-DSA (FIPS 204) dual-stack signing', maturity: 'ROADMAP',
        detail: 'Post-quantum signature scheme alongside Ed25519. Native CNSA 2.0 readiness ahead of any classical-signature deprecation deadline.', unlock: 'Months 6–12, after pilot deployment.' },
      { feature: 'Hardware-token or biometric quorum gates', maturity: 'ROADMAP',
        detail: 'Each signatory’s Ed25519 key gated on a hardware token (YubiKey class) or biometric unlock.', unlock: 'Pilot signing-ceremony rehearsal.' },
      { feature: 'TEE attestation (Intel TDX / AMD SEV-SNP)', maturity: 'ROADMAP',
        detail: 'Engine inference run inside a remotely-attested trusted execution environment. Currently a documented interface, not enforced.' },
      { feature: 'Zero-knowledge audit proofs', maturity: 'VISION', detail: 'Cross-jurisdiction audit verification without disclosing operator-internal data.' },
      { feature: 'Byzantine fault-tolerant consensus across operators', maturity: 'VISION', detail: 'Multi-operator agreement on cross-sector cascade state. Out of scope until federated deployment exists.' },
    ],
  },
  {
    name: 'Governance & decision flow',
    rows: [
      { feature: 'Per-packet legal-basis citation', maturity: 'LIVE', detail: 'Each packet carries a citation to the statute authorising the recommended action.' },
      { feature: 'Operator console (Next.js)', maturity: 'LIVE', detail: 'Read-only review surface. Renders packets, evidence, predicted cascade, and signing state.' },
      { feature: 'Multi-ministry signing animation', maturity: 'DEMO', detail: 'Visual quorum-collection sequence. Communicates the protocol; does not currently verify live signatures end-to-end.' },
      { feature: 'End-to-end signed-packet workflow with real ministry signers', maturity: 'ROADMAP',
        detail: 'A live packet generated in shadow-mode is signed by named operator personnel and entered into the audit chain.', unlock: 'Pilot signing-ceremony, month 3.' },
      { feature: 'Cross-jurisdictional packet routing (UK ↔ EU)', maturity: 'VISION', detail: 'Packets generated in one jurisdiction surfaced for advisory acknowledgement in another.' },
    ],
  },
  {
    name: 'Safety architecture',
    rows: [
      { feature: 'WRITE_ACCESS = false runtime guard', maturity: 'LIVE',
        detail: 'Runtime read-only guard with CI static analysis scanning every engine file for socket / HTTP writes to SCADA ports.' },
      { feature: 'Data-diode ingress architecture (logical)', maturity: 'LIVE', detail: 'Ingestion is strictly one-way at the software layer. Outbound socket attempts from the analysis enclave fail tests.' },
      { feature: 'STPA-Sec hazard analysis', maturity: 'LIVE', detail: '17 unsafe control actions identified and mitigated. Documented in the repository.' },
      { feature: 'GSN-style structured safety case', maturity: 'LIVE', detail: 'Claims → evidence mapping, residual-risk register, traceable to engine source.' },
      { feature: 'Independent SME safety review', maturity: 'ROADMAP',
        detail: 'External OT-safety practitioner reviews the safety case and STPA-Sec output.', unlock: 'Pre-pilot, month 1.' },
      { feature: 'Hardware data-diode at deployment edge', maturity: 'ROADMAP', detail: 'Physical unidirectional gateway between operator OT network and Munin enclave.' },
      { feature: 'IEC 62443-3-3 conformance certification', maturity: 'ROADMAP', detail: 'Independent-lab conformance assessment to OT security level SL2 / SL3.' },
    ],
  },
  {
    name: 'Deployment',
    rows: [
      { feature: 'Local laptop deployment', maturity: 'LIVE', detail: 'Engine + console run end-to-end on a developer machine. Demonstration runtime under 5 s.' },
      { feature: 'On-prem reference deployment runbook', maturity: 'ROADMAP', detail: 'Production-grade install on operator hardware with hardening notes.' },
      { feature: 'EU sovereign-cloud reference deployment', maturity: 'ROADMAP', detail: 'Reference deployment in an EU-jurisdiction sovereign-cloud region for operators without in-house OT estate.' },
      { feature: 'Air-gapped deployment', maturity: 'ROADMAP', detail: 'Deployment runbook for environments with no internet path. Engine signed-update channel via removable media.' },
      { feature: 'Federated multi-tenant deployment', maturity: 'VISION', detail: 'Multiple operators sharing a Munin instance with cryptographically isolated tenants.' },
    ],
  },
  {
    name: 'Telemetry & data',
    rows: [
      { feature: 'UK Environment Agency river-gauge ingestion', maturity: 'LIVE', detail: 'Live data via environment.data.gov.uk/flood-monitoring. The Layer-1 validation surface.' },
      { feature: 'Public hazard demonstration feed (USGS / NASA EONET / NOAA SWPC / EA floods)', maturity: 'LIVE',
        detail: 'The /M.0 LIVE TELEMETRY strip on the public site. Visual demonstration only — Munin\'s production engine does not consume these as primary data sources.' },
      { feature: 'Operator SCADA / OT telemetry ingestion', maturity: 'ROADMAP',
        detail: 'Production ingestion from operator process historians, RTUs, and sensor networks.', unlock: 'First pilot, network onboarding plan agreed at month 0.' },
      { feature: 'Ministry feed integration', maturity: 'ROADMAP', detail: 'Integration with regulator / civil-protection data feeds for decision context.' },
      { feature: 'Cross-operator anonymised pattern sharing', maturity: 'VISION', detail: 'Privacy-preserving cross-utility pattern transfer over differentially-private aggregates.' },
      { feature: 'Satellite verification layer', maturity: 'VISION', detail: 'Independent space-based corroboration of ground-sensor anomalies.' },
    ],
  },
];

function Chip({ m }: { m: Maturity }) {
  return (
    <span
      className="mono"
      style={{
        display: 'inline-block',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.14em',
        padding: '3px 9px',
        border: `1px solid ${META[m].color}`,
        color: META[m].color,
        whiteSpace: 'nowrap',
        minWidth: 70,
        textAlign: 'center',
      }}
    >
      {m}
    </span>
  );
}

function counts(): Record<Maturity, number> {
  const c: Record<Maturity, number> = { LIVE: 0, DEMO: 0, ROADMAP: 0, VISION: 0 };
  for (const s of SECTIONS) for (const r of s.rows) c[r.maturity]++;
  return c;
}

export default function MaturityPage() {
  const c = counts();
  const total = c.LIVE + c.DEMO + c.ROADMAP + c.VISION;

  return (
    <main>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(236, 234, 228, 0.92)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--rule)',
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto', padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)' }}>
            <MuninMark size={26} />
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              Munin Systems
            </span>
          </Link>
          <Link href="/" className="nav-link">← Back to site</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '96px 32px 32px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="frag" style={{ marginBottom: 24 }}>/L.2 · MATURITY DECLARATION</div>
          <h1 className="display-md" style={{ marginBottom: 24, maxWidth: 980 }}>
            What&apos;s real. What&apos;s demo. <span className="serif-italic" style={{ color: 'var(--ink-2)' }}>What&apos;s funded.</span> What&apos;s after Series&nbsp;A.
          </h1>
          <p className="lede" style={{ maxWidth: 760, marginBottom: 32 }}>
            Every claim on the public site, every component in the repository, and every paragraph in the doctrine
            is mapped here to one of four chips. Investors do not punish honest gaps — they punish founders who blur
            them. The line is published so it cannot be blurred.
          </p>

          {/* Counts strip */}
          <div className="grid-4-collapse" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--ink)',
            marginTop: 32,
          }}>
            {(['LIVE', 'DEMO', 'ROADMAP', 'VISION'] as Maturity[]).map((m, i) => (
              <div key={m} style={{
                padding: '24px 20px',
                borderRight: i < 3 ? '1px solid var(--rule)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Chip m={m} />
                  <span className="mono" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>
                    {c[m]} <span style={{ color: 'var(--ink-3)' }}>/ {total}</span>
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                  {META[m].long}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      {SECTIONS.map((sec, sIdx) => (
        <section key={sec.name} style={{
          padding: '64px 32px',
          borderTop: '1px solid var(--rule)',
        }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 36 }}>
              <div className="frag" style={{ marginBottom: 8 }}>/{String(sIdx + 1).padStart(2, '0')}</div>
              <h2 className="display-md" style={{ fontSize: 'clamp(24px, 2.6vw, 34px)', fontWeight: 500, marginBottom: sec.intro ? 8 : 0 }}>
                {sec.name}
              </h2>
              {sec.intro && (
                <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 760 }}>{sec.intro}</p>
              )}
            </div>

            <div>
              {sec.rows.map((r, i) => (
                <div key={r.feature} style={{
                  display: 'grid',
                  gridTemplateColumns: '88px minmax(220px, 1.1fr) 2fr 1fr',
                  gap: 24,
                  padding: '20px 0',
                  borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule-soft)',
                  borderBottom: i === sec.rows.length - 1 ? '1px solid var(--ink)' : 'none',
                  alignItems: 'start',
                }} className="maturity-row">
                  <div style={{ paddingTop: 2 }}>
                    <Chip m={r.maturity} />
                  </div>
                  <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.45 }}>
                    {r.feature}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                    {r.detail}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.04em', lineHeight: 1.55 }}>
                    {r.unlock ? <><span style={{ color: 'var(--signal)' }}>UNLOCKS &nbsp;</span>{r.unlock}</> : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Closing block */}
      <section style={{
        background: 'var(--ink)', color: 'var(--paper)',
        padding: '96px 32px', borderTop: '1px solid var(--ink)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="eyebrow" style={{ color: '#A8A6A0', marginBottom: 24 }}>
            How to read this page
          </div>
          <h2 className="display-md" style={{ color: 'var(--paper)', maxWidth: 940, marginBottom: 24 }}>
            <span className="serif-italic" style={{ color: '#C26A78' }}>{c.LIVE}</span> chips are the company today. <br />
            <span className="serif-italic" style={{ color: '#C26A78' }}>{c.ROADMAP}</span> chips are what your money buys.
          </h2>
          <p style={{ fontSize: 16, color: '#BFBCB3', maxWidth: 760, lineHeight: 1.65, marginBottom: 32 }}>
            <strong style={{ color: 'var(--paper)' }}>{c.LIVE} LIVE</strong> + <strong style={{ color: 'var(--paper)' }}>{c.DEMO} DEMO</strong>{' '}
            is the MVP a partner can verify by cloning the repository today.{' '}
            <strong style={{ color: 'var(--paper)' }}>{c.ROADMAP} ROADMAP</strong>{' '}
            is the funded build inside the first 18 months of pilot plus seed.{' '}
            <strong style={{ color: 'var(--paper)' }}>{c.VISION} VISION</strong>{' '}
            is the company at Series&nbsp;A and beyond — documented to make the trajectory legible, not to be evaluated as near-term promise.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/" style={{
              padding: '14px 32px', background: 'var(--paper)', color: 'var(--ink)',
              fontWeight: 500, fontSize: 15, display: 'inline-block',
            }}>
              ← Back to the site
            </Link>
            <a href="mailto:jacob@muninsystems.com?subject=Munin%20—%20Pilot%20Briefing" style={{
              padding: '14px 32px', background: 'transparent', color: 'var(--paper)',
              fontWeight: 500, fontSize: 15, border: '1px solid var(--ink-rule)', display: 'inline-block',
            }}>
              Request a pilot briefing
            </a>
          </div>
        </div>
      </section>

      <footer style={{ padding: '32px', borderTop: '1px solid var(--rule)', textAlign: 'center', background: 'var(--paper)' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
          © 2026 MUNIN SYSTEMS · MILAN · IT · MATURITY DECLARATION VERSION 2026-04-28
        </span>
      </footer>
    </main>
  );
}
