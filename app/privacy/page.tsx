import type { Metadata } from 'next';
import Link from 'next/link';
import MuninMark from '../munin-mark';

export const metadata: Metadata = {
  title: 'Privacy Notice — Munin Systems',
  description: 'How Munin Systems handles personal data on muninsystems.com.',
  robots: 'index, follow',
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: 'Who we are',
    body: (
      <>
        Munin Systems is operated by Jacob Sprake, sole trader, based in Milan, Italy.
        Contact: <a href="mailto:jacob@muninsystems.com" style={{ borderBottom: '1px solid var(--ink)' }}>jacob@muninsystems.com</a>.
        Munin Systems Ltd is in the process of being incorporated; until then, the controller is Jacob Sprake personally.
      </>
    ),
  },
  {
    heading: 'What this notice covers',
    body: (
      <>
        This notice covers the processing of personal data on the public website at <strong>muninsystems.com</strong>.
        It does not cover the Munin platform itself, which runs on operator infrastructure and is governed by separate
        per-deployment data-protection agreements.
      </>
    ),
  },
  {
    heading: 'Data we collect',
    body: (
      <>
        <strong>Site analytics.</strong> We use Vercel Analytics to count page views and aggregate traffic patterns.
        Vercel Analytics is privacy-first by design — it does not use cookies, does not track individual visitors
        across sessions, and does not collect IP addresses, user-agent strings, or any other identifiers that could
        be linked to a person. See <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ borderBottom: '1px solid var(--ink)' }}>Vercel&apos;s analytics privacy policy</a>.
        <br /><br />
        <strong>Live telemetry feed.</strong> The /M.0 LIVE TELEMETRY section pulls public open-data feeds from
        USGS, NASA EONET, the UK Environment Agency, and NOAA SWPC. No personal data flows through these requests;
        they are public hazard datasets.
        <br /><br />
        <strong>Email correspondence.</strong> When you email <a href="mailto:jacob@muninsystems.com" style={{ borderBottom: '1px solid var(--ink)' }}>jacob@muninsystems.com</a> we
        receive your email address, name (if you sign), and the contents of your message. We retain this for as long
        as the conversation is active, plus a reasonable archival period for legitimate business interest.
      </>
    ),
  },
  {
    heading: 'Cookies',
    body: (
      <>
        We do not set tracking cookies. Vercel may set strictly necessary functional cookies for hosting and security
        (for example, to mitigate denial-of-service attacks). These are not used for advertising, profiling, or
        cross-site tracking and are exempt from consent requirements under the ePrivacy Directive.
      </>
    ),
  },
  {
    heading: 'Legal basis (UK GDPR / EU GDPR)',
    body: (
      <>
        Site analytics are processed under <strong>legitimate interests</strong> (Article 6(1)(f)) — specifically,
        understanding aggregate site usage to improve the public-facing material. No personal data is processed in
        the strict sense, since the analytics service does not link events to identifiable persons.
        <br /><br />
        Email correspondence is processed under <strong>contract / pre-contract</strong> (Article 6(1)(b)) when you
        contact us about a pilot or partnership, or <strong>legitimate interests</strong> for general inquiries.
      </>
    ),
  },
  {
    heading: 'Sharing',
    body: (
      <>
        We do not sell, rent, or share personal data with third parties for advertising or marketing.
        We use the following processors strictly to operate the website:
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Vercel — hosting, edge delivery, analytics (US, with EU/UK Standard Contractual Clauses)</li>
          <li>Squarespace — domain registration only (US)</li>
          <li>Email provider for jacob@muninsystems.com (forwarding to a personal mailbox during this transitional period)</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'International transfers',
    body: (
      <>
        Vercel and Squarespace are US-based. Where personal data leaves the UK or EEA, transfers are governed by the
        UK&apos;s International Data Transfer Addendum and the EU Standard Contractual Clauses respectively. Munin
        Systems&apos; <em>product</em> is sovereign-by-design and runs on operator infrastructure — the foreign-cloud
        dependencies on this site are limited to public marketing content.
      </>
    ),
  },
  {
    heading: 'Your rights',
    body: (
      <>
        Under UK GDPR and EU GDPR you have the right to access, rectify, delete, restrict, port, and object to the
        processing of your personal data, and to withdraw consent where processing is based on consent. Email{' '}
        <a href="mailto:jacob@muninsystems.com" style={{ borderBottom: '1px solid var(--ink)' }}>jacob@muninsystems.com</a> with the subject line{' '}
        <em>Data Subject Request</em> and we will respond within 30 days.
        <br /><br />
        You may also lodge a complaint with the UK Information Commissioner&apos;s Office (<a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ borderBottom: '1px solid var(--ink)' }}>ico.org.uk</a>) or
        your national EU supervisory authority (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ borderBottom: '1px solid var(--ink)' }}>Garante per la Protezione dei Dati Personali</a> for Italy).
      </>
    ),
  },
  {
    heading: 'Security',
    body: (
      <>
        TLS 1.2+ is enforced across the site. The website source is open and auditable at{' '}
        <a href="https://github.com/jacobsprake/munin-site" target="_blank" rel="noopener noreferrer" style={{ borderBottom: '1px solid var(--ink)' }}>github.com/jacobsprake/munin-site</a>.
        Vulnerability reports: see <a href="/.well-known/security.txt" style={{ borderBottom: '1px solid var(--ink)' }}>/.well-known/security.txt</a>.
      </>
    ),
  },
  {
    heading: 'Changes',
    body: (
      <>
        We will update this notice as Munin Systems incorporates and expands. The current version date is shown below;
        the public history of every change to this page lives in the GitHub repository.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main>
      {/* Lightweight nav */}
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

      <section style={{ padding: '96px 32px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="frag" style={{ marginBottom: 24 }}>/L.1 · LEGAL</div>
          <h1 className="display-md" style={{ marginBottom: 18 }}>Privacy notice.</h1>
          <p className="lede" style={{ maxWidth: 640, marginBottom: 12 }}>
            Short version: this site does not track you, does not set advertising cookies, and does not share your
            data. The longer version follows.
          </p>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
            VERSION 2026-04-26 · GOVERNS muninsystems.com
          </div>
        </div>
      </section>

      <section style={{ padding: '0 32px 96px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {SECTIONS.map((s, i) => (
            <article key={s.heading} style={{
              padding: '28px 0',
              borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--rule-soft)',
              borderBottom: i === SECTIONS.length - 1 ? '1px solid var(--ink)' : 'none',
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginBottom: 12 }}>{s.heading}</h2>
              <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{s.body}</div>
            </article>
          ))}
        </div>
      </section>

      <footer style={{ padding: '32px', borderTop: '1px solid var(--rule)', textAlign: 'center' }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.08em' }}>
          © 2026 MUNIN SYSTEMS · MILAN · IT
        </span>
      </footer>
    </main>
  );
}
