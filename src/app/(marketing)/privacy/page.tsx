import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tavryne AI',
  description:
    'Tavryne AI Privacy Policy. Learn how we collect, use, store, and protect your personal data when you use our AI vibe coding platform. GDPR and CCPA compliant.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy | Tavryne AI',
    description:
      'Comprehensive privacy policy detailing how Tavryne AI collects, uses, stores, and protects your personal data. Includes information about GDPR and CCPA rights.',
    url: `${SITE_URL}/privacy`,
    type: 'website',
    siteName: 'Tavryne AI',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/ogimage.png`,
        width: 1024,
        height: 541,
        alt: 'Tavryne AI Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tavryneai',
    creator: '@tavryneai',
    title: 'Privacy Policy | Tavryne AI',
    description:
      'Comprehensive privacy policy detailing how Tavryne AI collects, uses, stores, and protects your personal data.',
    images: [`${SITE_URL}/ogimage.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'May 15, 2026';

  return (
    <>
      <JsonLd
        id="privacypage-schema"
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${SITE_URL}/privacy/#webpage`,
          name: 'Privacy Policy | Tavryne AI',
          description:
            'Tavryne AI Privacy Policy. Learn how we collect, use, store, and protect your personal data.',
          url: `${SITE_URL}/privacy`,
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@id': `${SITE_URL}/#organization` },
          dateModified: '2026-05-15',
          inLanguage: 'en-US',
          publisher: { '@id': `${SITE_URL}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE_URL}/privacy` },
            ],
          },
        }}
      />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Link
            href="/"
            className="text-sm text-primary hover:text-primary/80 transition-colors mb-8 inline-flex items-center gap-1"
          >
            <span aria-hidden="true">&larr;</span> Back to Tavryne AI
          </Link>

          <h1 className="text-headline-xl font-heading font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-body-sm text-muted-foreground mb-10">
            Last updated: {lastUpdated}
          </p>

          <div className="space-y-10 text-body-md text-muted-foreground leading-relaxed">
            {/* Introduction */}
            <section>
              <p>
                Tavryne AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                use our browser-based AI coding platform. Please read this policy carefully. By using Tavryne AI,
                you consent to the data practices described in this policy.
              </p>
              <p className="mt-4">
                If you do not agree with the terms of this Privacy Policy, please do not access or use the platform.
                We reserve the right to update this policy at any time. We will notify you of material changes by
                posting the updated policy on this page with a revised &quot;Last updated&quot; date.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                1. Information We Collect
              </h2>
              <p className="mb-4">
                We collect several categories of information to provide, improve, and secure our platform:
              </p>
              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                1.1 Information You Provide Directly
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <strong>Account Information:</strong> When you register, we collect your email address,
                  display name, and profile photo (if you choose to provide one). If you sign up using
                  Google or GitHub OAuth, we receive the profile information associated with that account.
                </li>
                <li>
                  <strong>User Content:</strong> All prompts, code, text, files, images, and other content
                  you submit to the platform for AI generation or storage. This includes code you write in
                  the Monaco editor, screenshots you upload, and voice recordings you submit through our
                  voice input feature.
                </li>
                <li>
                  <strong>Project Metadata:</strong> Project names, descriptions, file structures, checkpoints,
                  and sharing settings you configure within the platform.
                </li>
                <li>
                  <strong>Communications:</strong> Any correspondence you send to us, including support
                  inquiries, bug reports, and feature requests submitted through our GitHub repository
                  or other channels.
                </li>
              </ul>
              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                1.2 Information Collected Automatically
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>
                  <strong>Usage Data:</strong> Token consumption, API request timestamps, features used,
                  page views, session duration, and interaction patterns within the platform.
                </li>
                <li>
                  <strong>Device &amp; Browser Information:</strong> IP address, browser type and version,
                  operating system, device type, screen resolution, and language preferences.
                </li>
                <li>
                  <strong>Performance Data:</strong> Load times, error rates, and diagnostics related to
                  the in-browser bundler (esbuild-wasm), Monaco editor, and preview pane.
                </li>
                <li>
                  <strong>Cookies &amp; Similar Technologies:</strong> We use essential cookies for
                  authentication and session management. Analytics cookies are used only with your consent.
                  See Section 8 for details.
                </li>
              </ul>
              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                1.3 Information from Third Parties
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Authentication Providers:</strong> If you sign up using Google or GitHub, we
                  receive your email address and profile information from those providers.
                </li>
                <li>
                  <strong>AI Providers:</strong> When you submit a prompt, it is routed through NVIDIA NIM,
                  OpenCode Zen, and/or OpenRouter for code generation. These providers receive your prompt
                  and return generated content. Each provider processes data according to their own privacy
                  policies. We do not share personally identifiable information beyond your prompt content
                  with these providers.
                </li>
              </ul>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                2. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>To Provide the Service:</strong> Process your AI code generation requests,
                  maintain your account, display your projects, and enable sharing functionality.
                </li>
                <li>
                  <strong>To Improve the Platform:</strong> Analyze usage patterns to enhance AI routing
                  decisions, improve code generation quality, optimize performance, and develop new features.
                </li>
                <li>
                  <strong>To Communicate with You:</strong> Send service updates, security alerts, and
                  administrative messages. We may also send product announcements and tips, which you
                  can opt out of at any time.
                </li>
                <li>
                  <strong>To Ensure Security:</strong> Monitor for unauthorized access, detect abuse and
                  fraud, enforce our Terms of Service, and protect the integrity of the platform.
                </li>
                <li>
                  <strong>To Comply with Legal Obligations:</strong> Respond to lawful requests from
                  regulators, courts, and law enforcement, and maintain records as required by applicable
                  law.
                </li>
                <li>
                  <strong>For Aggregated Analytics:</strong> Generate anonymized, aggregated statistics
                  about platform usage, token consumption trends, and feature adoption. These aggregates
                  cannot be used to identify you personally.
                </li>
              </ul>
            </section>

            {/* 3. Legal Basis for Processing (GDPR) */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                3. Legal Basis for Processing (GDPR)
              </h2>
              <p className="mb-4">
                If you are located in the European Economic Area (EEA), Switzerland, or the United Kingdom,
                our processing of your personal data is based on the following legal grounds under the
                General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Contractual Necessity (Article 6(1)(b)):</strong> Processing is necessary to
                  perform our contract with you — to provide the Tavryne AI platform and its features.
                  This includes account management, code generation, and project storage.
                </li>
                <li>
                  <strong>Legitimate Interests (Article 6(1)(f)):</strong> Processing for security monitoring,
                  fraud prevention, platform improvement, and aggregated analytics. We balance our interests
                  against your rights and freedoms and have implemented safeguards to minimize privacy impact.
                </li>
                <li>
                  <strong>Consent (Article 6(1)(a)):</strong> Where required by law, we obtain your consent
                  for analytics cookies and marketing communications. You may withdraw consent at any time
                  without affecting your ability to use the platform.
                </li>
                <li>
                  <strong>Legal Obligation (Article 6(1)(c)):</strong> Processing necessary to comply with
                  applicable legal requirements, such as data retention obligations and lawful government
                  requests.
                </li>
              </ul>
            </section>

            {/* 4. Data Sharing & Disclosure */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                4. Data Sharing &amp; Disclosure
              </h2>
              <p className="mb-4">
                We do not sell your personal information. We may share your data in the following
                circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>AI Providers:</strong> As described in Section 1.3, your prompts are sent to
                  NVIDIA NIM, OpenCode Zen, and OpenRouter for code generation. These providers act as
                  data processors under our instructions. They are prohibited from using your data for
                  their own purposes, including model training.
                </li>
                <li>
                  <strong>Cloud Infrastructure Providers:</strong> We use Google Cloud Platform (Firebase,
                  Firestore), Vercel, and esbuild-wasm (loaded from unpkg CDN). These sub-processors
                  have signed data processing agreements (DPAs) with us.
                </li>
                <li>
                  <strong>Open Source Dependencies:</strong> The in-browser bundler (esbuild-wasm) and
                  code editor (Monaco Editor) are open-source tools loaded from CDNs. They do not transmit
                  your code to external servers.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> We may disclose information if required to do so by
                  law, subpoena, or other legal process, or if we believe in good faith that disclosure
                  is necessary to protect our rights, your safety, or the safety of others.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger, acquisition, reorganization,
                  or sale of assets, your information may be transferred as part of the transaction. We
                  will notify you of any such change and the applicable privacy terms.
                </li>
                <li>
                  <strong>Aggregated Data:</strong> We may share anonymized, aggregated data that cannot
                  reasonably identify you with partners, researchers, or the public for analytics and
                  research purposes.
                </li>
              </ul>
            </section>

            {/* 5. Data Storage & Security */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                5. Data Storage &amp; Security
              </h2>
              <p className="mb-4">
                We implement industry-standard technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Encryption in Transit:</strong> All communications with our servers are encrypted
                  using TLS 1.3. API requests require Firebase JWT authentication tokens.
                </li>
                <li>
                  <strong>Encryption at Rest:</strong> Your data is stored on Google Cloud Platform
                  infrastructure with AES-256 encryption at rest. Firebase Firestore documents are
                  encrypted using Google-managed encryption keys.
                </li>
                <li>
                  <strong>Access Controls:</strong> Infrastructure access is restricted to authorized
                  personnel with multi-factor authentication. Access is logged and audited regularly.
                </li>
                <li>
                  <strong>Data Isolation:</strong> Each user&apos;s projects and data are isolated using
                  Firebase security rules. Sharing is opt-in and per-session.
                </li>
                <li>
                  <strong>Secure Development:</strong> Our code undergoes mandatory peer review,
                  dependency scanning, and security testing before deployment.
                </li>
                <li>
                  <strong>Incident Response:</strong> We maintain an incident response plan to promptly
                  address any security breaches. We will notify affected users as required by applicable
                  law.
                </li>
              </ul>
            </section>

            {/* 6. Data Retention */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                6. Data Retention
              </h2>
              <p className="mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes
                described in this Privacy Policy:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account Information:</strong> Retained for the duration of your account
                  and for a reasonable period thereafter to comply with legal obligations, resolve
                  disputes, and enforce agreements.
                </li>
                <li>
                  <strong>User Content (Prompts &amp; Generated Code):</strong> Retained as long as
                  your account is active. When you delete a project, the associated content is
                  permanently deleted from our systems within 30 days.
                </li>
                <li>
                  <strong>Usage Data:</strong> Retained in aggregated form indefinitely for analytics
                  purposes. Raw usage logs are retained for 90 days and then anonymized or deleted.
                </li>
                <li>
                  <strong>Token Usage Records:</strong> Retained for billing and rate-limiting purposes
                  for the duration of your account and for up to 12 months thereafter.
                </li>
                <li>
                  <strong>Full Account Deletion:</strong> You may request complete deletion of your
                  account and all associated data at any time by contacting us. We will process your
                  request within 30 days.
                </li>
              </ul>
            </section>

            {/* 7. Your Rights */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                7. Your Rights
              </h2>
              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                7.1 GDPR Rights (EEA, Switzerland, UK)
              </h3>
              <p className="mb-4">
                If you are located in the EEA, Switzerland, or the UK, you have the following rights
                under the GDPR:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Right of Access (Article 15):</strong> Request confirmation of whether we
                  process your personal data and, if so, access to that data and information about
                  how it is processed.
                </li>
                <li>
                  <strong>Right to Rectification (Article 16):</strong> Request correction of inaccurate
                  or incomplete personal data we hold about you.
                </li>
                <li>
                  <strong>Right to Erasure (Article 17):</strong> Request deletion of your personal
                  data when it is no longer necessary for the purposes for which it was collected,
                  or when you withdraw consent on which processing is based.
                </li>
                <li>
                  <strong>Right to Restrict Processing (Article 18):</strong> Request restriction of
                  processing in certain circumstances, such as when you contest the accuracy of your data.
                </li>
                <li>
                  <strong>Right to Data Portability (Article 20):</strong> Request a copy of your
                  personal data in a structured, commonly used, machine-readable format, and the right
                  to transmit that data to another controller.
                </li>
                <li>
                  <strong>Right to Object (Article 21):</strong> Object to processing based on legitimate
                  interests, including profiling for direct marketing purposes.
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where
                  processing is based on consent. Withdrawal does not affect the lawfulness of
                  processing before withdrawal.
                </li>
                <li>
                  <strong>Right to Lodge a Complaint:</strong> Lodge a complaint with your local data
                  protection authority if you believe our processing of your personal data violates
                  applicable law.
                </li>
              </ul>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                7.2 CCPA Rights (California Residents)
              </h3>
              <p className="mb-4">
                If you are a California resident, the California Consumer Privacy Act (CCPA) grants
                you the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Right to Know:</strong> Request disclosure of the categories and specific
                  pieces of personal information we have collected about you, the categories of sources,
                  the business purpose for collection, and the categories of third parties with whom
                  we share your information.
                </li>
                <li>
                  <strong>Right to Delete:</strong> Request deletion of personal information we have
                  collected about you, subject to certain exceptions.
                </li>
                <li>
                  <strong>Right to Opt Out of Sale:</strong> We do not sell your personal information.
                  You have the right to direct us not to sell your personal information at any time.
                </li>
                <li>
                  <strong>Right to Non-Discrimination:</strong> We will not discriminate against you
                  for exercising any of your CCPA rights, including by denying you access to the
                  platform or providing a different level of service.
                </li>
              </ul>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                7.3 How to Exercise Your Rights
              </h3>
              <p>
                To exercise any of the rights described above, please contact us through our
                GitHub repository. We will respond to your request within 30 days. We may need to
                verify your identity before processing your request. Verification may require you
                to provide information matching that in our records.
              </p>
            </section>

            {/* 8. Cookies & Tracking */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                8. Cookies &amp; Tracking Technologies
              </h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to operate and improve our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Essential Cookies:</strong> Required for authentication, session management,
                  and security. These cannot be disabled. Examples include Firebase Auth session tokens
                  and CSRF protection cookies.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Store your theme selection (light/dark mode),
                  color theme preference, and editor settings. These enhance your experience but are
                  not strictly necessary.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Used only with your consent to understand how
                  you interact with the platform and identify areas for improvement.
                </li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. Disabling essential cookies
                may prevent you from using the platform. We do not use third-party advertising
                cookies or tracking pixels.
              </p>
            </section>

            {/* 9. International Data Transfers */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                9. International Data Transfers
              </h2>
              <p className="mb-4">
                Tavryne AI operates globally. Your personal data may be transferred to and processed
                in countries other than your country of residence, including the United States, where
                our cloud infrastructure providers (Google Cloud, Vercel) are located.
              </p>
              <p className="mb-4">
                When we transfer your data from the EEA, Switzerland, or the UK to countries that
                have not been deemed adequate by the European Commission, we rely on appropriate
                safeguards, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Standard Contractual Clauses (SCCs) approved by the European Commission, which
                  we have executed with our sub-processors.
                </li>
                <li>
                  Data Processing Agreements (DPAs) that incorporate the relevant data protection
                  obligations and ensure an equivalent level of protection.
                </li>
              </ul>
              <p className="mt-4">
                By using Tavryne AI, you acknowledge that your information may be transferred to
                and processed in the United States and other jurisdictions as described above.
              </p>
            </section>

            {/* 10. Children's Privacy */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                10. Children&apos;s Privacy
              </h2>
              <p>
                Tavryne AI is not directed to individuals under the age of 13 (or 16 in the EEA).
                We do not knowingly collect personal information from children. If we become aware
                that a child has provided us with personal data, we will take steps to delete that
                information promptly. If you believe we have collected data from a child, please
                contact us immediately.
              </p>
            </section>

            {/* 11. Third-Party Services */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                11. Third-Party Services
              </h2>
              <p className="mb-4">
                Tavryne AI integrates with the following third-party services. Each service operates
                under its own privacy policy:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Firebase (Authentication &amp; Firestore):</strong> Privacy Policy at
                  https://firebase.google.com/support/privacy
                </li>
                <li>
                  <strong>NVIDIA NIM:</strong> Privacy Policy at
                  https://www.nvidia.com/en-us/privacy-policy
                </li>
                <li>
                  <strong>OpenCode Zen:</strong> Privacy Policy at
                  https://opencode.ai/privacy
                </li>
                <li>
                  <strong>OpenRouter:</strong> Privacy Policy at
                  https://openrouter.ai/privacy
                </li>
                <li>
                  <strong>Vercel (Deployment):</strong> Privacy Policy at
                  https://vercel.com/legal/privacy-policy
                </li>
                <li>
                  <strong>GitHub (OAuth &amp; Support):</strong> Privacy Policy at
                  https://docs.github.com/en/site-policy/privacy-policies
                </li>
              </ul>
              <p className="mt-4">
                This Privacy Policy does not apply to third-party services. We encourage you to review
                the privacy policies of each third party before using their integrations.
              </p>
            </section>

            {/* 12. Changes to This Policy */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices,
                legal requirements, or operational needs. We will notify you of material changes by
                posting the updated policy on this page with a revised &quot;Last updated&quot; date.
                For significant changes, we may also provide a notification through the platform or
                via email. Your continued use of Tavryne AI after the effective date of the updated
                policy constitutes your acceptance of the changes.
              </p>
            </section>

            {/* 13. Contact Information */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                13. Contact Information
              </h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                our data practices, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>GitHub:</strong>{' '}
                  <a
                    href="https://github.com/tavryneai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    github.com/tavryneai
                  </a>
                </li>
                <li>
                  <strong>Twitter / X:</strong>{' '}
                  <a
                    href="https://twitter.com/tavryneai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    @tavryneai
                  </a>
                </li>
              </ul>
              <p className="mt-4">
                <strong>Data Protection Officer:</strong> For GDPR-related inquiries, you may contact
                our Data Protection Officer through the channels above. We will respond to all legitimate
                requests within 30 days.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
