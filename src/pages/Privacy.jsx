const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 md:pt-12 leading-relaxed text-[var(--text-main)]">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="mb-4 text-sm font-medium uppercase tracking-wider text-green-600">Secure & Transparent</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Personal Data:</strong> Name, email address, and profile picture (via Google or direct upload).</li>
          <li><strong>Payment Data:</strong> Handled securely by Stripe. We do not store your credit card numbers.</li>
          <li><strong>Usage Data:</strong> Reading history, library bookmarks, and coins spent.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
        <p>We use your data to personalize your reading experience, process transactions for premium content, and send notifications about new chapters from authors you follow.</p>
      </section>

      <section className="mb-8 ">
        <h2 className="text-2xl font-semibold mb-4">3. Data Protection</h2>
        <p>ToonLord implements industry-standard encryption to protect your data. We never sell your personal information to third-party advertisers.</p>
      </section>

      <section className="mb-8 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4 text-red-600">User Rights</h2>
        <p>You have the right to request a copy of your data or its deletion at any time by contacting support@ToonLord.com.</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;