const s = {
  page: { maxWidth: 720, margin: '0 auto', padding: '0 24px' } as const,
  hero: { paddingTop: 80, paddingBottom: 48 } as const,
  h1: { fontSize: 48, fontWeight: 700, color: '#fff', marginBottom: 24, letterSpacing: '-0.02em' } as const,
  subtitle: { fontSize: 20, color: '#a3a3a3', lineHeight: 1.6, marginBottom: 32 } as const,
  body: { fontSize: 18, color: '#d4d4d4', lineHeight: 1.7, marginBottom: 40 } as const,
  buttons: { display: 'flex', gap: 16, marginBottom: 64 } as const,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '12px 24px', background: '#fff', color: '#000', fontWeight: 600, borderRadius: 8, fontSize: 16, border: 'none', cursor: 'pointer' } as const,
  btnSecondary: { display: 'inline-flex', alignItems: 'center', padding: '12px 24px', background: 'transparent', color: '#d4d4d4', fontWeight: 600, borderRadius: 8, fontSize: 16, border: '1px solid #333', cursor: 'pointer' } as const,
  section: { paddingBottom: 48 } as const,
  h2: { fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 24 } as const,
  text: { fontSize: 16, color: '#a3a3a3', lineHeight: 1.7, marginBottom: 16 } as const,
  card: { border: '1px solid #222', borderRadius: 8, padding: 24, marginBottom: 16 } as const,
  cardTitle: { fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 } as const,
  cardText: { fontSize: 15, color: '#a3a3a3', lineHeight: 1.6 } as const,
  code: { background: '#111', border: '1px solid #222', borderRadius: 8, padding: 24, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.8 } as const,
  green: { color: '#4ade80' } as const,
  yellow: { color: '#facc15' } as const,
  dim: { color: '#666' } as const,
  white: { color: '#fff', fontWeight: 700 } as const,
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 } as const,
  docCard: { border: '1px solid #222', borderRadius: 8, padding: 16, display: 'block' } as const,
  docTitle: { fontWeight: 600, color: '#fff', marginBottom: 4 } as const,
  docDesc: { fontSize: 14, color: '#666' } as const,
  footer: { padding: '48px 0', borderTop: '1px solid #222', marginTop: 32 } as const,
  footerText: { fontSize: 14, color: '#666' } as const,
}

export default function Home() {
  return (
    <main>
      <div style={s.page}>
        {/* Hero */}
        <section style={s.hero}>
          <h1 style={s.h1}>Munin</h1>
          <p style={s.subtitle}>
            Sovereign infrastructure orchestration. Discovers cross-sector dependencies
            that no existing system can see. Compresses crisis authorization from hours to minutes.
          </p>
          <p style={s.body}>
            When a power substation fails, water pumps lose power 30 seconds later.
            Treatment plants go offline in 2 minutes. Hospitals in 15. But the
            authorization to respond takes 2-6 hours. <strong style={{ color: '#fff' }}>The cascade
            consumes entire sectors before anyone is allowed to act.</strong>
          </p>
          <div style={s.buttons}>
            <a href="https://github.com/jacobsprake/munin" style={s.btnPrimary}>
              View Repository
            </a>
            <a href="https://github.com/jacobsprake/munin/blob/main/docs/MUNIN_DOCTRINE.md" style={s.btnSecondary}>
              Read the Doctrine
            </a>
          </div>
        </section>

        {/* What Munin Does */}
        <section style={s.section}>
          <h2 style={s.h2}>What Munin does</h2>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Discovers shadow links</h3>
            <p style={s.cardText}>
              Infers cross-sector infrastructure dependencies from time-series correlation
              with lag detection. Finds relationships that exist in physics but not in any database.
            </p>
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Pre-computes the decision</h3>
            <p style={s.cardText}>
              Simulates every conceivable cascade scenario, matches playbooks, packages evidence
              and regulatory basis into cryptographic authorization packets.
            </p>
          </div>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Makes authorization defensible</h3>
            <p style={s.cardText}>
              PQC dual-stack signatures (Ed25519 + ML-DSA), M-of-N multi-ministry signing,
              Merkle-chained audit trail. Packets remain unforgeable for 30-50 years.
            </p>
          </div>
        </section>

        {/* Real Data */}
        <section style={s.section}>
          <h2 style={s.h2}>Real data, real results</h2>
          <div style={s.code}>
            <p style={s.dim}># Real Environment Agency river gauge data</p>
            <p style={s.dim}># Source: environment.data.gov.uk/flood-monitoring</p>
            <br/>
            <p style={s.green}>$ ./scripts/munin demo real-data</p>
            <p style={s.text}>  Loaded eden_sands_centre: 1000 readings</p>
            <p style={s.text}>  Loaded petteril_botcherby: 1000 readings</p>
            <br/>
            <p style={s.white}>  eden_sands_centre -&gt; petteril_botcherby</p>
            <p style={s.yellow}>    Confidence: 0.971</p>
            <p style={s.yellow}>    Lag: 300s (5 minutes)</p>
            <p style={s.yellow}>    Stability: 0.640</p>
            <br/>
            <p style={s.dim}>  No synthetic data. No simulation. Real sensor readings.</p>
          </div>
          <p style={{ ...s.dim, fontSize: 14, marginTop: 16 }}>
            Munin discovered the known hydrological relationship between the River Eden
            and River Petteril. The 5-minute lag matches the physical travel time of
            rainfall through the Carlisle catchment.
          </p>
        </section>

        {/* Run it */}
        <section style={s.section}>
          <h2 style={s.h2}>Run it yourself</h2>
          <div style={s.code}>
            <p style={s.green}>$ git clone https://github.com/jacobsprake/munin.git</p>
            <p style={s.green}>$ cd munin && npm ci && pip install pandas numpy pyyaml</p>
            <p style={s.green}>$ ./scripts/munin demo carlisle</p>
            <br/>
            <p style={s.text}>  38 scenarios simulated. 38 packets generated. 0.3 seconds.</p>
          </div>
        </section>

        {/* Key Docs */}
        <section style={s.section}>
          <h2 style={s.h2}>Key documents</h2>
          <div style={s.grid}>
            {[
              { title: 'The Doctrine', desc: 'Vision and contrarian thesis', href: 'https://github.com/jacobsprake/munin/blob/main/docs/MUNIN_DOCTRINE.md' },
              { title: 'Safety Case', desc: 'GSN claims linked to evidence', href: 'https://github.com/jacobsprake/munin/blob/main/docs/SAFETY_CASE.md' },
              { title: 'Limitations', desc: 'Honest gaps and attack plans', href: 'https://github.com/jacobsprake/munin/blob/main/docs/LIMITATIONS.md' },
              { title: "What's Next", desc: 'Concrete 3-6 month plan', href: 'https://github.com/jacobsprake/munin/blob/main/docs/WHATS_NEXT.md' },
              { title: 'Demo Walkthrough', desc: 'Step-by-step CLI usage', href: 'https://github.com/jacobsprake/munin/blob/main/docs/DEMO_WALKTHROUGH.md' },
              { title: 'Founder Notes', desc: 'How I got here', href: 'https://github.com/jacobsprake/munin/blob/main/docs/FOUNDER_NOTES.md' },
            ].map((doc) => (
              <a key={doc.title} href={doc.href} style={s.docCard}>
                <div style={s.docTitle}>{doc.title}</div>
                <div style={s.docDesc}>{doc.desc}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={s.footer}>
          <p style={s.footerText}>
            Munin: named for the raven in Norse mythology who flies across the world
            and reports back what he sees. Munin sees. Humans decide.
          </p>
          <p style={{ ...s.footerText, color: '#444', marginTop: 16 }}>
            Built by{' '}
            <a href="https://github.com/jacobsprake" style={{ color: '#666' }}>Jacob Sprake</a>
          </p>
        </footer>
      </div>
    </main>
  )
}
