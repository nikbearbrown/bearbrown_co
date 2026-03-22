import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Bear Brown LLC',
  description: 'Privacy policy for Bear Brown LLC and bearbrown.co',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Who We Are</h2>
            <p>
              This website (<strong>bearbrown.co</strong>) is operated by <strong>Bear Brown LLC</strong> (Nik Bear Brown, Sole Member),
              a Wyoming limited liability company providing AI consulting services.
            </p>
            <ul className="list-none pl-0 mt-4 space-y-1 text-base">
              <li><strong>Address:</strong> 30 N Gould St Ste N, Sheridan, WY 82801</li>
              <li><strong>Email:</strong>{' '}
                <a href="mailto:bear@bearbrown.co" className="text-primary hover:underline">bear@bearbrown.co</a>
              </li>
              <li><strong>EIN:</strong> 41-4226710</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p>We may collect information you voluntarily provide, including:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Name and email address submitted through the contact assistant or direct email</li>
              <li>Messages and inquiries you send via the site</li>
              <li>Information provided when engaging our AI consulting services</li>
            </ul>
            <p className="mt-4">
              We also collect standard analytics data (page views, browser type, referring pages) through Vercel
              Analytics to understand how the site is used. No personally identifiable information is collected
              through analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To respond to your inquiries and messages</li>
              <li>To provide AI consulting services you have engaged</li>
              <li>To improve the site and its content</li>
              <li>To understand site usage through aggregated analytics</li>
              <li>To send relevant updates about our services (only with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
              Information may be shared only:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>As required by law or to comply with legal process</li>
              <li>To protect the rights, safety, or property of Bear Brown LLC or others</li>
              <li>With service providers who assist in operating our website (subject to confidentiality obligations)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p>This site uses the following third-party services:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Vercel:</strong> Hosting and analytics</li>
              <li><strong>Supabase:</strong> Database for newsletter content</li>
              <li><strong>Spotify:</strong> Embedded music player</li>
              <li><strong>Substack:</strong> Newsletter publishing and distribution</li>
              <li><strong>Anthropic:</strong> AI-powered contact assistant</li>
            </ul>
            <p className="mt-4">
              Each of these services has its own privacy policy governing how they handle data.
              We encourage you to review their policies.
            </p>
          </section>

          <section className="mb-8" id="cookies">
            <h2 className="text-2xl font-semibold mb-4">6. Cookie Policy</h2>
            <p>
              This site uses minimal cookies. We believe in transparency about what data is stored in your browser.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3">Cookies we use:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Theme preference</strong> — Stores your dark/light mode choice so it persists across visits.
                This is a functional cookie and does not track you.
              </li>
              <li>
                <strong>Admin session</strong> — Used only for site administrators to access the admin dashboard.
                Not set for regular visitors.
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-6 mb-3">Cookies we do NOT use:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Advertising or remarketing cookies</li>
              <li>Cross-site tracking cookies</li>
              <li>Social media tracking pixels</li>
            </ul>
            <p className="mt-4">
              Third-party embeds (Spotify player, Substack) may set their own cookies when loaded.
              These are governed by the respective third party's cookie policy.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3">Managing cookies</h3>
            <p>
              You can control and delete cookies through your browser settings. Disabling cookies
              may affect your theme preference but will not prevent you from using the site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy,
              or as required by law. Analytics data is retained in aggregated, non-identifiable form.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent for future communications</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:bear@bearbrown.co" className="text-primary hover:underline">bear@bearbrown.co</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p>
              This website is not directed at children under the age of 13. We do not knowingly collect
              personal information from children. If you believe we have inadvertently collected such information,
              please contact us and we will promptly delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page with an
              updated date. Continued use of the site after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p>
              Questions about this policy? Contact Bear Brown LLC:
            </p>
            <ul className="list-none pl-0 mt-4 space-y-1 text-base">
              <li>
                <a href="mailto:bear@bearbrown.co" className="text-primary hover:underline">bear@bearbrown.co</a>
              </li>
              <li>30 N Gould St Ste N, Sheridan, WY 82801</li>
            </ul>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Link href="/" className="text-primary hover:underline">
              ← Home
            </Link>
            <Link href="/terms-of-service" className="text-primary hover:underline">
              Terms of Service →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
