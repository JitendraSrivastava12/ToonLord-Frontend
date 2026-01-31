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
    <div className={`theme-${currentTheme} transition-all duration-700 space-y-12 px-4 sm:px-8 md:px-16 lg:px-24 pb-32 py-28`}>

      {/* HERO SECTION */}
      <ToonLordHero />

      {/* TRUST STATS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {['10K+ Creators', '2M+ Readers', '50K+ Comics', 'Daily Updates'].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-secondary)]/30 backdrop-blur border border-[var(--border)] rounded-2xl p-4">
            <p className="text-xl font-black text-[var(--text-main)]">{stat}</p>
            <p className="text-xs text-[var(--text-dim)]">Worldwide</p>
          </div>
        ))}
      </section>

      {/* TRENDING SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="container mx-auto"
      >
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic text-[var(--text-main)]">
            Trending{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]">
              Now
            </span>
          </h2>
          <button className="text-sm font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] transition">
            Explore →
          </button>
        </div>

        <div className="relative bg-[var(--bg-secondary)]/30 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)] transition-all duration-500" />
          
          {/* MangaGrid responsive for mobile */}
          <MangaGrid
            category="trending"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            itemClassName="h-60 sm:h-72 md:h-80"
          />
        </div>
      </motion.section>

      {/* PREMIUM FEATURES STRIP */}
      <section className="grid sm:grid-cols-3 gap-6">
        {[
          { title: 'Early Access', desc: 'Read chapters before public release' },
          { title: 'Ad-Free', desc: 'No interruptions. Pure story.' },
          { title: 'Creator Support', desc: 'Your points go directly to artists' },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-[var(--bg-secondary)]/20 backdrop-blur border border-[var(--border)] rounded-2xl p-6 hover:scale-[1.02] transition"
          >
            <h3 className="font-bold text-lg text-[var(--text-main)]">{f.title}</h3>
            <p className="text-sm text-[var(--text-dim)] mt-2">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CREATOR CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <CreatorCTA />
      </motion.div>

      {/* PREMIUM SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="container mx-auto"
      >
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic text-[var(--text-main)]">
            Premium{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)]">
              Unlocks
            </span>
          </h2>
          <p className="text-[var(--text-dim)] text-sm">
            Exclusive high-quality series for true fans
          </p>
        </div>

        <div className="relative bg-[var(--bg-secondary)]/30 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-glow)] transition-all duration-500" />

          <MangaGrid
            category="premium"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            itemClassName="h-60 sm:h-72 md:h-80"
          />
        </div>
      </motion.section>

      {/* VIP CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-glow)]/20 to-[var(--accent)]/20 border border-[var(--border)] p-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[var(--text-main)]">
          Become a <span className="text-[var(--accent)]">ToonLord VIP</span>
        </h2>
        <p className="text-[var(--text-dim)] mt-2 max-w-xl mx-auto">
          Unlock exclusive comics, creator drops, and early releases.
        </p>
        <button className="mt-6 px-8 py-3 rounded-xl bg-[var(--accent)] text-[var(--text-main)] font-bold hover:scale-105 transition">
          Upgrade Now 👑
        </button>
      </section>

    </div>
  );
};

export default ToonLordLanding;
