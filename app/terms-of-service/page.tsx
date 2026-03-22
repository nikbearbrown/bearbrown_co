import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Bear Brown LLC',
  description: 'Terms of Service for Bear Brown LLC and bearbrown.co',
}

export default function TermsOfServicePage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to <strong>bearbrown.co</strong>, operated by <strong>Bear Brown LLC</strong> (Nik Bear Brown, Sole Member),
              a Wyoming limited liability company. By accessing or using this website, you agree to be bound by these
              Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, please do not use this website.
            </p>
            <ul className="list-none pl-0 mt-4 space-y-1 text-base">
              <li><strong>Company:</strong> Bear Brown LLC</li>
              <li><strong>Address:</strong> 30 N Gould St Ste N, Sheridan, WY 82801</li>
              <li><strong>Email:</strong>{' '}
                <a href="mailto:bear@bearbrown.co" className="text-primary hover:underline">bear@bearbrown.co</a>
              </li>
              <li><strong>EIN:</strong> 41-4226710</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Services</h2>
            <p>
              Bear Brown LLC provides AI consulting services, educational content, and related resources.
              This website serves as an informational resource, newsletter archive, and tool directory.
              The content is provided for general informational purposes and does not constitute professional advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. AI Consulting Services</h2>
            <p>
              AI consulting engagements are governed by separate written agreements between Bear Brown LLC and the client.
              These Terms apply to use of this website only and do not supersede any consulting engagement agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p>
              All content on this website — including text, graphics, logos, images, audio, newsletter articles, and software —
              is the property of Bear Brown LLC or its content suppliers and is protected by United States and international
              copyright laws.
            </p>
            <p className="mt-4">
              Newsletter content originally published on Substack is displayed with attribution. Original publication
              rights and any applicable Creative Commons licenses are noted on individual articles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Use License</h2>
            <p>
              You are granted a limited, non-exclusive, non-transferable license to access and view the content
              on this website for personal, non-commercial informational purposes. This license does not include:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Modifying or copying the materials for redistribution</li>
              <li>Using the materials for any commercial purpose without written permission</li>
              <li>Attempting to decompile or reverse engineer any software on the website</li>
              <li>Removing any copyright or proprietary notations</li>
              <li>Scraping, crawling, or bulk downloading content beyond what robots.txt permits</li>
            </ul>
            <p className="mt-4">
              This license terminates automatically if you violate any of these restrictions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
            <p>When using this website, including any interactive features such as the contact assistant, you agree not to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Submit false or misleading information</li>
              <li>Attempt to gain unauthorized access to any part of the website or its systems</li>
              <li>Use the website to transmit harmful code, spam, or malicious content</li>
              <li>Interfere with or disrupt the website's infrastructure</li>
              <li>Use automated tools to access the website beyond normal browser usage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services and Links</h2>
            <p>
              This website integrates with and links to third-party services including Spotify, Substack, GitHub,
              YouTube, Vercel, Supabase, and Anthropic. Bear Brown LLC is not responsible for the content, privacy
              practices, or availability of these external services. Your use of third-party services is governed
              by their respective terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Newsletter Content</h2>
            <p>
              Newsletter articles displayed on this website are imported from Substack publications operated by
              Nik Bear Brown. These articles are provided for convenient reading and are attributed to their
              original Substack source. For the most current version of any article, refer to the original
              Substack publication linked on each article page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p>
              This website and all content are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              either express or implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, or non-infringement.
            </p>
            <p className="mt-4">
              Bear Brown LLC does not warrant that the website will be uninterrupted, error-free, or free of
              harmful components. AI-related content and tools are provided for informational purposes and
              should not be relied upon as the sole basis for business decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Bear Brown LLC shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly
              or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Your use or inability to use the website</li>
              <li>Any content obtained from the website</li>
              <li>Unauthorized access to or alteration of your transmissions or data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Bear Brown LLC, its sole member, and its affiliates from any
              claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of
              the website or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming,
              without regard to conflict of law principles. Any disputes arising under these Terms shall be subject
              to the exclusive jurisdiction of the state and federal courts located in Wyoming.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to These Terms</h2>
            <p>
              Bear Brown LLC may revise these Terms at any time by updating this page. Changes take effect immediately
              upon posting. Your continued use of the website after changes are posted constitutes acceptance of the
              revised Terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact</h2>
            <p>
              If you have any questions about these Terms, contact Bear Brown LLC:
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
            <Link href="/privacy" className="text-primary hover:underline">
              ← Privacy Policy
            </Link>
            <Link href="/" className="text-primary hover:underline">
              Home →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
