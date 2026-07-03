import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://tavryneai.vercel.app';

export const metadata: Metadata = {
  title: 'Terms of Service | Tavryne AI',
  description:
    'Terms of Service for Tavryne AI, the AI website and app builder. Read the terms governing your use of the platform, including account registration, acceptable use, and intellectual property.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: 'Terms of Service | Tavryne AI',
    description:
      'Terms of Service for Tavryne AI, the AI website and app builder. Read the terms governing your use of the AI-powered development platform.',
    url: `${SITE_URL}/terms`,
    type: 'website',
    siteName: 'Tavryne AI',
    locale: 'en_US',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Tavryne AI Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tavryneai',
    creator: '@tavryneai',
    title: 'Terms of Service | Tavryne AI',
    description:
      'Terms of Service for Tavryne AI, the AI website and app builder. Read the terms governing your use of the AI-powered development platform.',
    images: [`${SITE_URL}/opengraph-image`],
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

export default function TermsPage() {
  const lastUpdated = 'May 15, 2026';

  return (
    <>
      <JsonLd
        id="termspage-schema"
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${SITE_URL}/terms/#webpage`,
          name: 'Terms of Service | Tavryne AI',
          description:
            'Tavryne AI Terms of Service. Read the terms governing your use of our AI vibe coding platform.',
          url: `${SITE_URL}/terms`,
          isPartOf: { '@id': `${SITE_URL}/#website` },
          about: { '@id': `${SITE_URL}/#organization` },
          dateModified: '2026-05-15',
          inLanguage: 'en-US',
          publisher: { '@id': `${SITE_URL}/#organization` },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${SITE_URL}/terms` },
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
            Terms of Service
          </h1>
          <p className="text-body-sm text-muted-foreground mb-10">
            Last updated: {lastUpdated}
          </p>

          <div className="space-y-10 text-body-md text-muted-foreground leading-relaxed">
            {/* Introduction */}
            <section>
              <p>
                Welcome to Tavryne AI. These Terms of Service (&quot;Terms&quot;) govern your access to and use of
                the Tavryne AI platform, website, and related services (collectively, the &quot;Service&quot;).
                By creating an account, accessing, or using the Service, you agree to be bound by these
                Terms. If you do not agree, you may not access or use the Service.
              </p>
              <p className="mt-4">
                Tavryne AI is operated by Tavryne AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms form a
                legally binding agreement between you (&quot;you,&quot; &quot;your,&quot; or &quot;User&quot;) and Tavryne AI.
                If you are using the Service on behalf of an organization, you represent and warrant
                that you have the authority to bind that organization to these Terms.
              </p>
            </section>

            {/* 1. Account Registration */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                1. Account Registration &amp; Eligibility
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Eligibility:</strong> You must be at least 13 years of age (or 16 in the
                  European Economic Area) to use the Service. By creating an account, you represent
                  and warrant that you meet this requirement and that all information you provide is
                  accurate, current, and complete.
                </li>
                <li>
                  <strong>Account Registration:</strong> You must create an account to use the Service.
                  You are responsible for maintaining the confidentiality of your login credentials
                  and for all activities that occur under your account. You agree to notify us
                  immediately of any unauthorized use of your account.
                </li>
                <li>
                  <strong>Account Types:</strong> We offer free and paid subscription tiers. Features,
                  token limits, and usage quotas vary by tier and are described on our pricing page.
                  We reserve the right to modify tier offerings at any time with reasonable notice.
                </li>
                <li>
                  <strong>Accuracy of Information:</strong> You agree to provide accurate, current,
                  and complete information during the registration process and to update such
                  information to keep it accurate, current, and complete. Failure to do so constitutes
                  a breach of these Terms.
                </li>
                <li>
                  <strong>Multiple Accounts:</strong> You may not create multiple accounts to circumvent
                  token limits, trial restrictions, or other platform rules. We reserve the right to
                  merge or disable duplicate accounts.
                </li>
              </ul>
            </section>

            {/* 2. Use of Service */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                2. Use of the Service
              </h2>
              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                2.1 License
              </h3>
              <p className="mb-4">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive,
                non-transferable, revocable license to access and use the Service for your personal
                or internal business purposes. This license does not include any right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Sublicense, resell, or commercially exploit the Service;</li>
                <li>Copy, modify, or create derivative works of the Service (unless expressly permitted);</li>
                <li>Reverse engineer, decompile, or disassemble the Service;</li>
                <li>Circumvent or bypass any access controls, rate limits, or usage restrictions;</li>
                <li>Use the Service in a manner that exceeds authorized token quotas or rate limits.</li>
              </ul>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                2.2 Acceptable Use
              </h3>
              <p className="mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Generate malicious code, malware, viruses, or any software designed to harm
                    computer systems or networks;</li>
                <li>Generate content that violates any applicable law, regulation, or third-party right;</li>
                <li>Generate content that is illegal, harmful, threatening, abusive, harassing,
                    defamatory, or otherwise objectionable;</li>
                <li>Violate the intellectual property rights of any person or entity;</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any
                    person or entity;</li>
                <li>Interfere with or disrupt the integrity or performance of the Service;</li>
                <li>Attempt to gain unauthorized access to the Service or its related systems or networks;</li>
                <li>Use automated means (bots, scrapers, scripts) to access the Service without our
                    express written permission;</li>
                <li>Use the Service for any benchmarking or competitive analysis without our prior
                    written consent;</li>
                <li>Use the Service to train, fine-tune, or improve any third-party AI model without
                    our explicit written permission.</li>
              </ul>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                2.3 Token Usage &amp; Rate Limits
              </h3>
              <p>
                The Service operates on a token-based system. Free tier users receive a daily token
                allowance as described on our pricing page. Token usage is tracked in real-time.
                We reserve the right to impose rate limits, throttle requests, or suspend access if
                usage exceeds reasonable limits. Token allowances reset daily at UTC midnight.
                Unused tokens do not roll over. Token limits for paid tiers are specified in your
                subscription plan.
              </p>
            </section>

            {/* 3. Intellectual Property */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                3. Intellectual Property Rights
              </h2>
              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                3.1 Our IP
              </h3>
              <p className="mb-4">
                The Tavryne AI platform, including but not limited to its user interface, software
                architecture, logos, trademarks, trade dress, and underlying technology, is owned
                by Tavryne AI or its licensors and is protected by copyright, trademark, patent,
                and other intellectual property laws. Except as expressly granted in these Terms,
                no right, title, or interest in the Service is transferred to you.
              </p>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                3.2 Your Content
              </h3>
              <p className="mb-4">
                You retain all rights, title, and interest in and to the content you submit to the
                Service, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Prompts and natural language descriptions you provide;</li>
                <li>Code generated by the AI in response to your prompts;</li>
                <li>Files, images, screenshots, and other media you upload;</li>
                <li>Manual edits and modifications you make to generated content.</li>
              </ul>
              <p className="mb-4">
                We do not claim ownership over any content you generate using the Service. By
                submitting content to the Service, you grant us a worldwide, non-exclusive,
                royalty-free license to host, store, display, and process your content solely
                for the purpose of providing the Service to you.
              </p>
              <p className="mb-4">
                <strong>Important:</strong> We do not use your prompts, generated code, or other
                content to train or improve our AI models. Your content is processed exclusively
                to fulfill your generation requests and is not used for any other purpose.
              </p>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                3.3 Feedback
              </h3>
              <p>
                If you provide us with suggestions, bug reports, feature requests, or other feedback,
                we may use such feedback without any obligation to you. You grant us a perpetual,
                irrevocable, worldwide, royalty-free license to use, incorporate, and commercialize
                any feedback you provide for any purpose.
              </p>
            </section>

            {/* 4. Subscriptions & Billing */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                4. Subscriptions &amp; Billing
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Free Tier:</strong> The free tier is provided at no cost with limited
                  features and daily token caps. We reserve the right to modify or discontinue the
                  free tier at any time with reasonable notice.
                </li>
                <li>
                  <strong>Paid Subscriptions:</strong> Paid tiers are billed on a monthly or annual
                  basis as selected during checkout. Fees are non-refundable except as expressly
                  stated in these Terms or as required by applicable law.
                </li>
                <li>
                  <strong>Payment Processing:</strong> Payments are processed through our third-party
                  payment processor. Your payment information is handled by the processor in accordance
                  with its privacy and security policies.
                </li>
                <li>
                  <strong>Automatic Renewal:</strong> Subscriptions automatically renew at the end of
                  each billing period unless you cancel before the renewal date. You may cancel at any
                  time through your account settings.
                </li>
                <li>
                  <strong>Changes to Pricing:</strong> We reserve the right to change our pricing with
                  30 days&apos; notice. Price changes will not affect your current billing period but will
                  apply to subsequent renewal periods.
                </li>
                <li>
                  <strong>Taxes:</strong> You are responsible for all applicable taxes, duties, and
                  government charges associated with your subscription.
                </li>
              </ul>
            </section>

            {/* 5. Third-Party Services */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                5. Third-Party Services
              </h2>
              <p className="mb-4">
                The Service integrates with third-party services, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>AI providers: NVIDIA NIM, OpenCode Zen, and OpenRouter for code generation;</li>
                <li>Authentication: Firebase Authentication (Google, GitHub OAuth);</li>
                <li>Cloud infrastructure: Google Cloud Platform (Firestore), Vercel;</li>
                <li>Open-source libraries: esbuild-wasm, Monaco Editor.</li>
              </ul>
              <p className="mb-4">
                We are not responsible for the availability, accuracy, or performance of third-party
                services. Your use of third-party services is subject to their respective terms and
                privacy policies. We make no warranties regarding third-party services and disclaim
                all liability arising from your use of them.
              </p>
              <p>
                AI-generated code is provided on an &quot;as-is&quot; basis. You are solely responsible for
                reviewing, testing, and validating all generated code before using it in any
                production environment.
              </p>
            </section>

            {/* 6. Service Level */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                6. Service Level &amp; Availability
              </h2>
              <p className="mb-4">
                We strive to provide a reliable, high-performance service. However:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>No Uptime Guarantee:</strong> The Service is provided on an &quot;as available&quot;
                  basis. We do not guarantee uninterrupted or error-free operation.
                </li>
                <li>
                  <strong>Scheduled Maintenance:</strong> We may perform maintenance during which the
                  Service may be temporarily unavailable. We will use reasonable efforts to provide
                  advance notice of scheduled maintenance.
                </li>
                <li>
                  <strong>AI Provider Dependencies:</strong> The availability and quality of AI
                  generation depend on third-party AI providers. We automatically failover between
                  providers but cannot guarantee generation results.
                </li>
                <li>
                  <strong>Emergency Downtime:</strong> We may suspend access to the Service without
                  notice to address security emergencies, legal compliance, or critical technical issues.
                </li>
              </ul>
            </section>

            {/* 7. Termination */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                7. Termination
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>By You:</strong> You may terminate your account at any time through your
                  account settings. Termination is effective immediately. Your content will be deleted
                  within 30 days of termination.
                </li>
                <li>
                  <strong>By Us:</strong> We may suspend or terminate your access to the Service at
                  any time, with or without cause, with or without notice. Grounds for termination
                  include, but are not limited to: (a) violation of these Terms; (b) conduct that
                  we believe is harmful to the Service or other users; (c) extended inactivity; or
                  (d) as required by law.
                </li>
                <li>
                  <strong>Effect of Termination:</strong> Upon termination, your right to access and
                  use the Service immediately ceases. We may permanently delete your account and all
                  associated data. Sections 3, 5, 6, 8, 9, 10, 11, and 12 survive termination.
                </li>
                <li>
                  <strong>Data Export:</strong> Before termination, you may export your projects and
                  code. We are not obligated to provide data after termination.
                </li>
              </ul>
            </section>

            {/* 8. Disclaimer of Warranties */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                8. Disclaimer of Warranties
              </h2>
              <p className="mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTY OF ANY KIND,
                EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TAVRYNE AI
                DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT;</li>
                <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS;</li>
                <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR QUALITY OF AI-GENERATED CODE;</li>
                <li>WARRANTIES THAT AI-GENERATED CODE WILL MEET YOUR REQUIREMENTS OR BE FREE FROM DEFECTS.</li>
              </ul>
              <p className="mt-4">
                AI-GENERATED CODE SHOULD BE THOROUGHLY REVIEWED, TESTED, AND VALIDATED BEFORE USE IN ANY
                PRODUCTION ENVIRONMENT. YOU ASSUME ALL RISK ASSOCIATED WITH THE USE OF AI-GENERATED CODE.
              </p>
            </section>

            {/* 9. Limitation of Liability */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                9. Limitation of Liability
              </h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL TAVRYNE AI, ITS
                OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES;</li>
                <li>LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES;</li>
                <li>DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE;</li>
                <li>DAMAGES RESULTING FROM AI-GENERATED CODE, INCLUDING BUT NOT LIMITED TO CODE DEFECTS,
                    SECURITY VULNERABILITIES, OR INTELLECTUAL PROPERTY INFRINGEMENT;</li>
                <li>DAMAGES ARISING FROM THIRD-PARTY SERVICE INTERRUPTIONS OR FAILURES;</li>
                <li>DAMAGES EXCEEDING THE TOTAL AMOUNT PAID BY YOU TO TAVRYNE AI IN THE 12 MONTHS
                    PRECEDING THE CLAIM.</li>
              </ul>
              <p className="mt-4">
                THIS LIMITATION OF LIABILITY APPLIES WHETHER THE CLAIM IS BASED IN CONTRACT, TORT
                (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, EVEN IF TAVRYNE
                AI HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. SOME JURISDICTIONS DO NOT
                ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE
                LIMITATIONS MAY NOT APPLY TO YOU.
              </p>
            </section>

            {/* 10. Indemnification */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                10. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless Tavryne AI, its officers, directors,
                employees, and agents from and against any and all claims, damages, obligations, losses,
                liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from:
                (a) your use of the Service in violation of these Terms; (b) your violation of any
                applicable law or regulation; (c) your violation of any third-party right, including
                intellectual property or privacy rights; (d) any content you submit or generate using
                the Service; or (e) any dispute between you and another user of the Service. We reserve
                the right to assume the exclusive defense and control of any matter subject to
                indemnification by you, in which case you agree to cooperate with our defense.
              </p>
            </section>

            {/* 11. Dispute Resolution */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                11. Dispute Resolution
              </h2>
              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                11.1 Informal Resolution
              </h3>
              <p className="mb-4">
                Before filing any claim, you agree to attempt to resolve the dispute informally by
                contacting us through our GitHub repository. We will attempt to resolve the dispute
                within 30 days. If the dispute cannot be resolved informally, the provisions below apply.
              </p>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                11.2 Governing Law
              </h3>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the
                State of Delaware, United States, without regard to its conflict of law principles.
                The United Nations Convention on Contracts for the International Sale of Goods does
                not apply to these Terms.
              </p>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                11.3 Arbitration
              </h3>
              <p className="mb-4">
                Any dispute arising out of or relating to these Terms or the Service shall be resolved
                by binding arbitration administered by the American Arbitration Association under its
                Commercial Arbitration Rules. The arbitration shall be held in Wilmington, Delaware,
                or at another location mutually agreed upon by the parties. The award rendered by the
                arbitrator shall be final and binding, and judgment may be entered upon it in any court
                having jurisdiction.
              </p>

              <h3 className="text-headline-md font-heading font-medium text-foreground mb-2">
                11.4 Class Action Waiver
              </h3>
              <p>
                YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ON AN INDIVIDUAL
                BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. If a court or
                arbitrator determines that this class action waiver is unenforceable, the arbitration
                agreement in this Section 11 shall be deemed void.
              </p>
            </section>

            {/* 12. General Provisions */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                12. General Provisions
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between
                  you and Tavryne AI regarding your use of the Service and supersede all prior agreements
                  and understandings.
                </li>
                <li>
                  <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms
                  shall not be deemed a waiver of such right or provision.
                </li>
                <li>
                  <strong>Severability:</strong> If any provision of these Terms is held to be invalid
                  or unenforceable, the remaining provisions shall remain in full force and effect.
                </li>
                <li>
                  <strong>Assignment:</strong> You may not assign or transfer these Terms or your rights
                  or obligations hereunder without our prior written consent. We may assign these Terms
                  without restriction in connection with a merger, acquisition, or sale of assets.
                </li>
                <li>
                  <strong>Notices:</strong> We may provide notices to you through the Service interface,
                  email, or through our GitHub repository. You agree to receive notices electronically.
                </li>
                <li>
                  <strong>Export Controls:</strong> You agree to comply with all applicable export and
                  re-export control laws and regulations, including the U.S. Export Administration
                  Regulations and sanctions programs administered by the U.S. Office of Foreign Assets
                  Control.
                </li>
                <li>
                  <strong>Force Majeure:</strong> We shall not be liable for any failure or delay in
                  performance due to circumstances beyond our reasonable control, including acts of God,
                  natural disasters, war, terrorism, riots, embargoes, acts of civil or military
                  authorities, fire, floods, accidents, strikes, or shortages of transportation,
                  fuel, energy, labor, or materials.
                </li>
                <li>
                  <strong>Language:</strong> These Terms are written in English. Any translations are
                  provided for convenience only. In the event of a conflict, the English version prevails.
                </li>
              </ul>
            </section>

            {/* 13. Contact */}
            <section>
              <h2 className="text-headline-lg font-heading font-semibold text-foreground mb-4">
                13. Contact Information
              </h2>
              <p className="mb-4">
                For questions about these Terms, please contact us:
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
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
