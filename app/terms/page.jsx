import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";

export const metadata = {
  title: "Terms of Service | Oras",
  description:
    "The terms that govern your use of the Oras AI visibility and GEO tracking platform.",
};

const LAST_UPDATED = "June 10, 2026";

export default function TermsOfService() {
  return (
    <main className="autosend-page">
      <SiteNavbar />

      <article className="oras-legal">
        <header className="oras-legal-head">
          <span className="oras-legal-eyebrow">LEGAL</span>
          <h1>Terms of Service</h1>
          <p className="oras-legal-meta">Last updated: {LAST_UPDATED}</p>
        </header>

        <section>
          <p>
            These Terms of Service ("Terms") govern your access to and use of the
            Oras website at tryoras.com and the AI visibility and GEO tracking
            platform (collectively, the "Service") provided by Oras Inc. ("Oras",
            "we", "us", or "our"). By accessing or using the Service, you agree to
            be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2>1. Eligibility and Accounts</h2>
          <p>
            You must be at least 16 years old and able to form a binding contract
            to use the Service. You are responsible for the activity that occurs
            under your account and for keeping your credentials secure. Notify us
            promptly of any unauthorized use.
          </p>
        </section>

        <section>
          <h2>2. The Service</h2>
          <p>
            Oras provides tools to track brand visibility across AI answer engines,
            analyze competitors, monitor citations, run GEO audits, and generate
            reports. AI-generated insights and scores are provided for
            informational purposes and may not be complete or accurate. You are
            responsible for how you use them.
          </p>
        </section>

        <section>
          <h2>3. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service in violation of any law or third-party rights.</li>
            <li>
              Attempt to disrupt, reverse engineer, or gain unauthorized access to
              the Service or its systems.
            </li>
            <li>
              Resell or provide access to the Service in a way not permitted by
              your plan.
            </li>
            <li>Upload malicious code or use the Service to harm others.</li>
          </ul>
        </section>

        <section>
          <h2>4. Subscriptions and Billing</h2>
          <p>
            Paid plans are billed in advance on a recurring basis through our
            payment processor, Stripe. Unless otherwise stated, subscriptions renew
            automatically until canceled. You may cancel at any time, and
            cancellation takes effect at the end of the current billing period.
            Except where required by law, payments are non-refundable.
          </p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            The Service, including its software, design, and content, is owned by
            Oras and protected by intellectual property laws. We grant you a
            limited, non-exclusive, non-transferable right to use the Service. You
            retain ownership of the brand data and content you submit, and you grant
            us a license to process it solely to provide the Service.
          </p>
        </section>

        <section>
          <h2>6. Third-Party Services</h2>
          <p>
            The Service integrates with third-party providers such as Supabase,
            Stripe, and AI and search APIs. Your use of those services may be subject
            to their own terms, and we are not responsible for their availability or
            practices.
          </p>
        </section>

        <section>
          <h2>7. Disclaimers</h2>
          <p>
            The Service is provided "as is" and "as available" without warranties of
            any kind, whether express or implied, including merchantability, fitness
            for a particular purpose, and non-infringement. We do not warrant that
            the Service will be uninterrupted, error-free, or that insights will be
            accurate.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Oras will not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or
            for any loss of profits or data, arising from your use of the Service.
            Our total liability for any claim will not exceed the amount you paid us
            in the twelve months preceding the claim.
          </p>
        </section>

        <section>
          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service if you violate
            these Terms or if necessary to protect the Service or other users. You
            may stop using the Service at any time. Provisions that by their nature
            should survive termination will survive.
          </p>
        </section>

        <section>
          <h2>10. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. We will post the updated
            version on this page and revise the "Last updated" date above. Continued
            use of the Service after changes take effect constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have questions about these Terms, contact us at{" "}
            <a href="mailto:support@tryoras.com">support@tryoras.com</a>.
          </p>
        </section>

        <footer className="oras-legal-foot">
          <Link href="/">← Back to home</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </footer>
      </article>
    </main>
  );
}
