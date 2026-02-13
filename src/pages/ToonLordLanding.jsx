// ToonLordLanding.jsx
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import ToonLordHero from '../components/ToonLordHero';
import MangaGrid from '../components/MangaGrid';
import CreatorCTA from '../components/CreatorCTA';
import { AppContext } from "../UserContext";

const ToonLordLanding = () => {
  const { currentTheme } = useContext(AppContext);

  return (
    <div className={`theme-${currentTheme} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 space-y-20">

        {/* HERO */}
        <ToonLordHero />

        {/* TRUST STATS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {['10K+ Creators', '2M+ Readers', '50K+ Comics', 'Daily Updates'].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 backdrop-blur p-5 text-center"
            >
              <p className="text-lg sm:text-xl font-extrabold text-[var(--text-main)]">
                {stat}
              </p>
              <p className="text-xs text-[var(--text-dim)] mt-1">Worldwide</p>
            </div>
          ))}
        </section>

        {/* TRENDING */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic text-[var(--text-main)]">
              Trending{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]">
                Now
              </span>
            </h2>
            <button className="text-sm font-semibold text-[var(--text-dim)] hover:text-[var(--text-main)] transition">
              Explore →
            </button>
          </header>

          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 backdrop-blur-xl p-4 sm:p-6 shadow-xl">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]" />

            <MangaGrid
              category="trending"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              itemClassName="aspect-[3/4]"
            />
          </div>
        </motion.section>

        {/* PREMIUM FEATURES */}
        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { title: 'Early Access', desc: 'Read chapters before public release' },
            { title: 'Ad-Free', desc: 'No interruptions. Pure story.' },
            { title: 'Creator Support', desc: 'Your points go directly to artists' },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/20 backdrop-blur p-6 hover:translate-y-[-2px] transition"
            >
              <h3 className="text-lg font-semibold text-[var(--text-main)]">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--text-dim)] mt-2 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </section>

        {/* CREATOR CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <CreatorCTA />
        </motion.div>

        {/* PREMIUM */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <header className="mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic text-[var(--text-main)]">
              Premium{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]">
                Unlocks
              </span>
            </h2>
            <p className="text-sm text-[var(--text-dim)] mt-1">
              Exclusive high-quality series for true fans
            </p>
          </header>

          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 backdrop-blur-xl p-4 sm:p-6 shadow-xl">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]" />

            <MangaGrid
              category="premium"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
              itemClassName="aspect-[3/4]"
            />
          </div>
        </motion.section>

        {/* VIP CTA */}
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-glow)]/20 to-[var(--accent)]/20 p-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)]">
            Become a <span className="text-[var(--accent)]">ToonLord VIP</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-dim)] mt-3 max-w-xl mx-auto">
            Unlock exclusive comics, creator drops, and early releases.
          </p>
          <button className="mt-6 px-8 py-3 rounded-xl bg-[var(--accent)] text-[var(--text-main)] font-bold hover:scale-105 transition">
            Upgrade Now 👑
          </button>
        </section>

      </div>
    </div>
  );
};

export default ToonLordLanding;
