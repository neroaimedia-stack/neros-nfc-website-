import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — HERNEROS",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-black">{title}</h2>
      <div className="mt-2 flex flex-col gap-3 text-sm leading-relaxed text-black/70">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="text-xs font-semibold text-black/40 underline hover:text-black"
      >
        ← Back to home
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-black">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-xs text-black/40">Last updated August 22, 2026</p>

      <Section title="1. Acceptance of terms">
        <p>
          By accessing or using herneros.org, placing an order, or creating
          an account, you agree to these Terms &amp; Conditions and to our{" "}
          <Link href="/privacy" className="font-semibold text-black underline">
            Privacy Policy
          </Link>
          . If you don&apos;t agree, please don&apos;t use the site.
        </p>
      </Section>

      <Section title="2. Accounts">
        <p>
          Placing an order requires a HERNEROS account. You&apos;re
          responsible for keeping your login credentials confidential and
          for all activity that happens under your account. Provide accurate
          information — an order can&apos;t be fulfilled or shipped
          correctly on incorrect details.
        </p>
      </Section>

      <Section title="3. Products & orders">
        <p>
          We sell NFC/QR-enabled cards (Business Card, Review Card, Wifi
          Card, Order Card). Standard checkout on this site supports direct
          orders shipped within the Philippines only. If you&apos;re outside
          the Philippines, we only fulfill bulk orders, arranged by emailing
          us directly.
        </p>
        <p>
          Prices are displayed in your selected currency for convenience;
          orders are recorded and billed in US dollars.
        </p>
      </Section>

      <Section title="4. Payment & verification">
        <p>
          We don&apos;t use an automated payment gateway. After placing an
          order, you pay manually via bank transfer or e-wallet (currently
          GoTyme Bank / InstaPay) using the QR code shown at checkout, then
          submit the transaction reference number and, ideally, a screenshot
          of the payment. Your order is marked{" "}
          <span className="font-semibold text-black">pending</span> until we
          manually verify that payment against what you submitted. We
          reserve the right to cancel an order if payment can&apos;t be
          verified within a reasonable time.
        </p>
      </Section>

      <Section title="5. Cancellations">
        <p>
          While an order is still pending payment verification, you can
          submit a cancellation request from your cart&apos;s order
          dashboard; we&apos;ll review and confirm it. Once an order has
          moved past pending (paid, processing, or shipped), it generally
          can no longer be cancelled through the site — contact us directly
          and we&apos;ll do our best to help.
        </p>
      </Section>

      <Section title="6. Shipping">
        <p>
          Shipping fees and delivery timelines are communicated separately
          and are not included in the product price shown at checkout. Risk
          of loss passes to you once an order is handed off to the courier.
        </p>
      </Section>

      <Section title="7. Card activation & claim codes">
        <p>
          Physical cards ship with a unique activation code used to claim
          and link the card to your account. Keep this code and your account
          credentials secure — we&apos;re not responsible for a card claimed
          by someone else using a code that wasn&apos;t kept confidential.
        </p>
      </Section>

      <Section title="8. Your profile content">
        <p>
          If you publish a business profile through your card (bio, photos,
          links, contact details, etc.), it becomes publicly visible to
          anyone who scans or opens your card&apos;s link. You&apos;re solely
          responsible for what you publish, and you must not upload content
          that&apos;s unlawful, infringing, or harmful. We may remove content
          that violates these terms.
        </p>
      </Section>

      <Section title="9. Acceptable use">
        <p>
          Don&apos;t use HERNEROS for fraud, don&apos;t attempt to duplicate
          or resell activation codes you don&apos;t own, and don&apos;t
          attempt to disrupt or abuse the site or its infrastructure.
        </p>
      </Section>

      <Section title="10. Intellectual property">
        <p>
          The HERNEROS name, branding, and site content are our property.
          Content you add to your own profile remains yours — by publishing
          it through your card, you grant us a license to host and display
          it as part of providing the service to you.
        </p>
      </Section>

      <Section title="11. Disclaimers & limitation of liability">
        <p>
          The site and products are provided &quot;as is&quot; without
          warranties of any kind. To the extent permitted by law, HERNEROS
          isn&apos;t liable for indirect, incidental, or consequential
          damages, and our total liability for any order is limited to the
          amount you paid for that order.
        </p>
      </Section>

      <Section title="12. Governing law">
        <p>
          These terms are governed by the laws of the Republic of the
          Philippines.
        </p>
      </Section>

      <Section title="13. Changes to these terms">
        <p>
          We may update these terms from time to time. Material changes will
          be reflected by updating the date at the top of this page.
        </p>
      </Section>

      <Section title="14. Contact us">
        <p>
          Questions about these terms? Email us at{" "}
          <a
            href="mailto:herneros.ph@gmail.com"
            className="font-semibold text-black underline"
          >
            herneros.ph@gmail.com
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
