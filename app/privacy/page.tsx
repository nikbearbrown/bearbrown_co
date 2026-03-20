import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Bear Brown',
  description: 'Privacy policy for bearbrown.co',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-8">Privacy Policy</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: March 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              Welcome to bearbrown.co, the personal website of Nik Bear Brown. This privacy policy explains how we
              collect, use, and protect your information when you visit this site or use the contact assistant.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p>We may collect information you voluntarily provide, including:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Name and email address submitted through the contact assistant</li>
              <li>Messages and inquiries you send via the site</li>
            </ul>
            <p className="mt-4">
              We also collect standard analytics data (page views, browser type, referring pages) through Vercel
              Analytics to understand how the site is used. No personally identifiable information is collected
              through analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To respond to your inquiries and messages</li>
              <li>To improve the site and its content</li>
              <li>To understand site usage through aggregated analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sharing Your Information</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
              Information may be shared only as required by law or to protect rights and safety.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p>This site uses the following third-party services:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Vercel:</strong> Hosting and analytics</li>
              <li><strong>Spotify:</strong> Embedded music player</li>
              <li><strong>Anthropic:</strong> AI-powered contact assistant</li>
            </ul>
            <p className="mt-4">
              Each of these services has its own privacy policy governing how they handle data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p>
              This site uses minimal cookies for theme preference (dark/light mode). We do not use tracking
              cookies or advertising cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of any personal information we hold about you
              by contacting us at{' '}
              <a href="mailto:bear@bearbrown.co" className="text-primary hover:underline">bear@bearbrown.co</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted on this page with an
              updated date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p>
              Questions about this policy? Email{' '}
              <a href="mailto:bear@bearbrown.co" className="text-primary hover:underline">bear@bearbrown.co</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
