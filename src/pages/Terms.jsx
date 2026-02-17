const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 md:pt-12 text-[var(--text-main)] leading-relaxed">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="mb-4 text-sm text-gray-500 font-medium uppercase tracking-wider">Last Updated: February 2026</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>By accessing ToonLord, you agree to be bound by these Terms. If you do not agree, please do not use the platform.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. ToonLord reserves the right to terminate accounts that violate our community standards.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Content Ownership & Copyright</h2>
        <p>Authors retain all ownership rights to their original stories. By posting on ToonLord, you grant us a non-exclusive license to host and display your work. <strong>Plagiarism is strictly prohibited</strong> and will result in a permanent ban.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. ToonCoins & Payments</h2>
        <p>ToonCoins are virtual points used to unlock premium chapters. Purchases are final and non-refundable unless required by law. ToonCoins have no cash value outside the platform.</p>
      </section>

      <section className="mb-8 border-t pt-8">
        <p className="text-sm text-gray-600 italic">
          Disclaimer: ToonLord is a platform for fiction. Any resemblance to actual persons, living or dead, is purely coincidental.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;