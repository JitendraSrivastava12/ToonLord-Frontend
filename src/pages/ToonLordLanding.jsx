// ToonLordLanding.jsx
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ToonLordHero from '../components/ToonLordHero';
import MangaGrid from '../components/MangaGrid';
import CreatorCTA from '../components/CreatorCTA';
import { AppContext } from "../UserContext";

const ToonLordLanding = () => {
  const { currentTheme, user } = useContext(AppContext);

  return (
    <div className={`theme-${currentTheme} transition-colors duration-500 bg-[var(--bg-primary)] min-h-screen`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-1 sm:py-12 space-y-16">

        {/* HERO */}
        <ToonLordHero />

        {/* TRUST STATS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {['10,000+ creators', '2 million readers', '50,000+ comics', 'Daily updates'].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 text-center"
            >
              <p className="text-base sm:text-lg font-semibold text-[var(--text-main)]">
                {stat}
              </p>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Worldwide
              </p>
            </div>
          ))}
        </section>

        {/* TRENDING */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                Trending Series
              </h2>
              <p className="text-sm text-[var(--text-dim)] mt-1">
                Popular titles readers are enjoying right now
              </p>
            </div>
          </header>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2 sm:p-6">
            <MangaGrid
              category="trending"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6"
            />
          </div>
        </motion.section>

        {/* FEATURES */}
        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { title: 'Early access', desc: 'Read chapters before public release.' },
            { title: 'Ad-free experience', desc: 'Enjoy uninterrupted reading.' },
            { title: 'Support creators', desc: 'Your contributions go directly to artists.' },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
            >
              <h3 className="text-base font-semibold text-[var(--text-main)]">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--text-dim)] mt-2 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </section>

        {/* PREMIUM */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <header className="mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              Premium Series
            </h2>
            <p className="text-sm text-[var(--text-dim)] mt-1">
              Exclusive titles available to subscribers
            </p>
          </header>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2 sm:p-6">
            <MangaGrid
              category="premium"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6"
            />
          </div>
        </motion.section>

        {/* SUBSCRIPTION CTA */}
        {!user?.isVIP && (
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Upgrade to ToonLord VIP
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-dim)] mt-4 max-w-2xl mx-auto leading-relaxed">
              Get access to exclusive comics, early releases, and premium creator content.
            </p>
            <div className="mt-8 flex justify-center">
              <Link 
                to={user ? "/subscription" : "/loginlanding"}
                className="inline-block px-8 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition"
              >
                {user ? "View subscription plans" : "Login to upgrade"}
              </Link>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ToonLordLanding;
