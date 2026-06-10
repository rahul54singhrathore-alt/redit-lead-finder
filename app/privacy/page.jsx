import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";

export const metadata = {
  title: "Privacy Policy | Oras",
  description:
    "How Oras collects, uses, and protects your data across AI visibility tracking, GEO audits, and account services.",
};

const LAST_UPDATED = "June 10, 2026";

export default function PrivacyPolicy() {
  return (
    <main className="autosend-page">
      <SiteNavbar />

      <article className="oras-legal">
        <header className="oras-legal-head">
          <span className="oras-legal-eyebrow">LEGAL</span>
          <h1>Privacy Policy</h1>
          <p className="oras-legal-meta">Last updated: {LAST_UPDATED}</p>
        </header>

        <section>
          <p>
            Oras Inc. ("Oras", "we", "us", or "our") operates the website at
            tryoras.com and the AI visibility and GEO tracking platform
            (collectively, the "Service"). This Privacy Policy explains what
            information we collect, how we use it, and the choices you have. By
            using the Service you agree to the practices described here.
          </p>
        </section>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul>
            <li>
              <strong>Account information.</strong> When you sign up, we collect
              your name, email address, and authentication identifiers. If you
              sign in with a third-party provider such as Google, we receive your
              basic profile information (name, email, and avatar) as permitted by
              that provider.
            </li>
            <li>
              <strong>Brand and project data.</strong> The brand names, domains,
              competitors, prompts, and keywords you choose to track within the
              Service.
            </li>
            <li>
              <strong>Billing information.</strong> When you subscribe to a paid
              plan, payments are processed by Stripe. We do not store your full
              card details; we retain only subscription status and limited
              billing metadata.
            </li>
            <li>
              <strong>Usage data.</strong> Log data, device and browser
              information, and interactions with the Service, used to operate,
              secure, and improve the product.
            </li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve the Service.</li>
            <li>
              To run AI visibility scans, GEO audits, citation tracking, and to
              generate reports you request.
            </li>
            <li>To process payments and manage your subscription.</li>
            <li>
              To communicate with you about your account, security, and product
              updates.
            </li>
            <li>To detect, prevent, and address fraud, abuse, and security issues.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Share Information</h2>
          <p>
            We do not sell your personal information. We share information only
            with service providers that help us operate the Service, under
            contractual confidentiality obligations:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> for authentication and database hosting.
            </li>
            <li>
              <strong>Stripe</strong> for payment processing.
            </li>
            <li>
              <strong>AI and data providers</strong> (such as model and search
              APIs) used to generate visibility scores and recommendations.
            </li>
          </ul>
          <p>
            We may also disclose information if required by law or to protect the
            rights, safety, and security of Oras and its users.
          </p>
        </section>

        <section>
          <h2>4. Google User Data</h2>
          <p>
            If you connect a Google account, our use of information received from
            Google APIs adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We use Google profile data
            solely to authenticate you and provide the Service, and we do not
            transfer or use it for advertising.
          </p>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as
            needed to provide the Service. You may request deletion of your
            account and associated data at any time, after which we will delete or
            anonymize it except where retention is required by law.
          </p>
        </section>

        <section>
          <h2>6. Security</h2>
          <p>
            We use industry-standard safeguards, including encryption in transit
            and access controls, to protect your information. No method of
            transmission or storage is completely secure, but we work to protect
            your data and continuously improve our practices.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access,
            correct, export, or delete your personal information, and to object to
            or restrict certain processing. To exercise these rights, contact us
            using the details below.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            The Service is not directed to children under 16, and we do not
            knowingly collect personal information from them.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the
            updated version on this page and revise the "Last updated" date above.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:support@tryoras.com">support@tryoras.com</a>.
          </p>
        </section>

        <footer className="oras-legal-foot">
          <Link href="/">← Back to home</Link>
          <Link href="/terms">Terms of Service</Link>
        </footer>
      </article>
    </main>
  );
}
