import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — HERNEROS",
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

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link
        href="/"
        className="text-xs font-semibold text-black/40 underline hover:text-black"
      >
        ← Back to home
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-black">Privacy Policy</h1>
      <p className="mt-2 text-xs text-black/40">Last updated August 22, 2026</p>

      <Section title="Overview">
        <p>
          This policy explains what information HERNEROS (&quot;we&quot;,
          &quot;us&quot;) collects when you use herneros.org, and how we use,
          store, and protect it. By using the site, you agree to the
          practices described here.
        </p>
      </Section>

      <Section title="Information we collect">
        <p>
          <span className="font-semibold text-black">Account information.</span>{" "}
          When you sign up, we collect the email address and password you
          provide. Passwords are handled by our authentication provider and
          are never stored or visible to us in plain text.
        </p>
        <p>
          <span className="font-semibold text-black">Order information.</span>{" "}
          When you check out, we collect your name, email, phone number,
          shipping address, the products and personalization details you
          enter (e.g. destination links for a Review or Order Card), and the
          payment reference number or screenshot you submit to confirm a
          bank/e-wallet transfer.
        </p>
        <p>
          <span className="font-semibold text-black">Business profile information.</span>{" "}
          If you set up a card, anything you choose to add to your public
          profile — name, photo, bio, social links, contact details, and
          similar — is stored so it can be shown to anyone who scans or
          visits your card&apos;s link. This is content you control and
          choose to publish.
        </p>
        <p>
          <span className="font-semibold text-black">Local cart data.</span>{" "}
          Items you add to your cart before checking out are stored in your
          browser&apos;s local storage, not on our servers, until you place
          an order.
        </p>
      </Section>

      <Section title="How we use your information">
        <p>
          We use the information above to create and manage your account,
          process and verify orders (including matching your submitted
          payment reference against the payment we receive), fulfill and
          ship your order, respond to support requests and cancellation
          requests, and maintain the security of the site.
        </p>
        <p>
          We do not use your information for advertising, and we do not run
          third-party analytics or ad-tracking scripts on this site.
        </p>
      </Section>

      <Section title="Payments">
        <p>
          HERNEROS does not process card payments directly and does not
          store any card numbers. Standard orders are paid manually via bank
          transfer or e-wallet (currently GoTyme Bank / InstaPay) using the
          QR code shown at checkout; we only collect the reference number
          and, optionally, a screenshot you submit to help us confirm that
          payment.
        </p>
      </Section>

      <Section title="Where your data is stored">
        <p>
          Our database, authentication, and file storage are hosted by
          Supabase, and the site itself is hosted on Vercel. Both providers
          process data on our behalf under their own security and privacy
          commitments. Access to your order and account data is restricted
          at the database level so that, other than our own team, only you
          can view your own orders and account details.
        </p>
      </Section>

      <Section title="Cookies & local storage">
        <p>
          We use your browser&apos;s local storage for two purposes only:
          keeping your cart contents between visits, and keeping you signed
          in. We don&apos;t use third-party advertising or tracking cookies.
        </p>
      </Section>

      <Section title="Sharing your information">
        <p>
          We never sell your personal information. We share it only where
          necessary: with our service providers (Supabase, Vercel) to
          operate the site, with a courier once your order ships, or where
          required by law.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can review or update your account details at any time from
          your account page. To request a copy of your data, a correction,
          or deletion of your account, email us at{" "}
          <a
            href="mailto:herneros.ph@gmail.com?subject=Privacy%20Request"
            className="font-semibold text-black underline"
          >
            herneros.ph@gmail.com
          </a>
          . We may need to retain certain order records for a reasonable
          period for accounting and legal purposes even after a deletion
          request.
        </p>
      </Section>

      <Section title="International orders">
        <p>
          Standard checkout on this site supports direct orders within the
          Philippines only. International orders are handled manually as
          bulk inquiries over email; the same principles in this policy
          apply to any information you share with us that way.
        </p>
      </Section>

      <Section title="Children's privacy">
        <p>
          HERNEROS is not directed at children, and we do not knowingly
          collect information from anyone under 18.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy from time to time. Material changes will
          be reflected by updating the date at the top of this page.
        </p>
      </Section>

      <Section title="Contact us">
        <p>
          Questions about this policy? Email us at{" "}
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
