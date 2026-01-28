import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import ToonLordHero from '../components/ToonLordHero';
import MangaGrid from '../components/MangaGrid';
import CreatorCTA from '../components/CreatorCTA';
import { AppContext } from "../UserContext"; // Import your Master Context

const ToonLordLanding = () => {
  // 1. Swap useOutletContext for useContext
  const { isRedMode } = useContext(AppContext);
  
  // 2. The accent now syncs perfectly across tabs via the context
  const accent = isRedMode ? 'from-red-500 to-pink-500' : 'from-green-400 to-emerald-500';

  return (
    <div className="space-y-24 px-4 sm:px-8 md:px-16 lg:px-24 pb-32 bg-gradient-to-b from-black via-zinc-900 to-black">

      {/* HERO */}
      <ToonLordHero />

      {/* TRUST STATS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {['10K+ Creators', '2M+ Readers', '50K+ Comics', 'Daily Updates'].map((stat, i) => (
          <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <p className="text-xl font-black">{stat}</p>
            <p className="text-xs text-gray-400">Worldwide</p>
          </div>
        ))}
      </section>

      {/* TRENDING */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="container mx-auto"
      >
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic">
            Trending{' '}
            <span className={`bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
              Now
            </span>
          </h2>
          <button className="text-sm font-bold text-gray-400 hover:text-white transition">
            Explore →
          </button>
        </div>

        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className={`absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r ${accent} transition-all duration-500`} />
          <MangaGrid category="trending" />
        </div>
      </motion.section>

      {/* PREMIUM FEATURES STRIP */}
      <section className="grid sm:grid-cols-3 gap-6">
        {[
          { title: 'Early Access', desc: 'Read chapters before public release' },
          { title: 'Ad-Free', desc: 'No interruptions. Pure story.' },
          { title: 'Creator Support', desc: 'Your points go directly to artists' },
        ].map((f, i) => (
          <div key={i} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition">
            <h3 className="font-bold text-lg">{f.title}</h3>
            <p className="text-sm text-gray-400 mt-2">{f.desc}</p>
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

      {/* PREMIUM */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="container mx-auto"
      >
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic">
            Premium{' '}
            <span className={`bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
              Unlocks
            </span>
          </h2>
          <p className="text-gray-400 text-sm">
            Exclusive high-quality series for true fans
          </p>
        </div>

        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className={`absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r ${accent} transition-all duration-500`} />
          <MangaGrid category="premium" />
        </div>
      </motion.section>

      {/* VIP CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500/20 via-pink-500/20 to-purple-500/20 border border-white/10 p-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black">
          Become a <span className="text-yellow-400">ToonLord VIP</span>
        </h2>
        <p className="text-gray-300 mt-2 max-w-xl mx-auto">
          Unlock exclusive comics, creator drops, and early releases.
        </p>
        <button className="mt-6 px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:scale-105 transition">
          Upgrade Now 👑
        </button>
      </section>

    </div>
  );
};

export default ToonLordLanding;