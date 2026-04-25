import React, { memo,  useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { motion, AnimatePresence} from "framer-motion";
import "../CSS/Home.css";

/* ─── Marquee items ─── */
const MARQUEE = [
  "🌿 Fresh Daily Deals",
  "⚡ Up To 70% Off",
  "🚚 Free Shipping Over $50",
  "🌱 100% Organic",
  "✨ New Arrivals Weekly",
  "🎁 Refer & Save",
];

/* ─── Hero ─── */
const HeroBanner = memo(() => {
  const floatAnimation = {
    y: [0, -14, 0],
    rotate: [0, 1.5, -1.5, 0],
  };

  const floatTransition = {
    duration: 5.5,
    repeat: Infinity,
    ease: "easeInOut",
  };

  const badgeAnimation = {
    y: [0, -8, 0],
  };

  const getBadgeTransition = (delay) => ({
    duration: 3.5 + delay,
    repeat: Infinity,
    ease: "easeInOut",
    delay,
  });

  return (
      <div className="hero-banner">
        <div className="hero-bg-mesh" />
        <div className="hero-grain" />

        <div className="hero-inner">
          <div>
            <motion.div
                className="hero-eyebrow"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
              <i className="fa-solid fa-bolt" /> New Season Picks
            </motion.div>

            <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Shop <span className="grad">fresh</span>
              <br />
              & save big
            </motion.h1>

            <motion.p
                className="hero-sub"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.36 }}
            >
              Thousands of organic products, unbeatable deals, delivered fast. Your freshest grocery experience starts here.
            </motion.p>

            <motion.div
                className="hero-cta-row"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
              <a href="/products" className="hero-btn-p">
                <i className="fa-solid fa-basket-shopping" /> Shop Now
              </a>

              <a href="/shops" className="hero-btn-s">
                Explore Shops <i className="fa-solid fa-arrow-right" />
              </a>
            </motion.div>

            <motion.div
                className="hero-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.72 }}
            >
              {[
                ["12K+", "Products"],
                ["840+", "Shops"],
                ["99%", "Satisfaction"],
              ].map(([n, l], i) => (
                  <React.Fragment key={l}>
                    {i > 0 && <div className="hero-div" />}
                    <div>
                      <div className="hero-stat-num">{n}</div>
                      <div className="hero-stat-label">{l}</div>
                    </div>
                  </React.Fragment>
              ))}
            </motion.div>
          </div>

          <div className="hero-visual">
            <motion.div
                className="hero-card-stack"
                animate={floatAnimation}
                transition={floatTransition}
            >
              <div className="hcs-back" />
              <div className="hcs-mid" />
              <div className="hcs-front">
                <div className="hcs-emoji">🥑</div>
                <div className="hcs-name">
                  Organic Avocado
                  <br />
                  Bundle
                </div>
                <div className="hcs-price">$4.99</div>
                <div className="hcs-tag">Best Seller</div>
              </div>
            </motion.div>

            <motion.div
                className="hero-badge hb1"
                animate={badgeAnimation}
                transition={getBadgeTransition(0)}
            >
              🔥 70% Off Today
            </motion.div>

            <motion.div
                className="hero-badge hb2"
                animate={badgeAnimation}
                transition={getBadgeTransition(0.8)}
            >
              ⭐ 4.9 Rating
            </motion.div>
          </div>
        </div>
      </div>
  );
});

/* ─── Marquee ─── */
const MarqueeStrip = memo(() => {
  const doubled = [...MARQUEE, ...MARQUEE];
  return (
      <div className="marquee-wrap">
        <div className="marquee-track">
          {doubled.map((t, i) => (
              <div key={i} className="marquee-item">{t}<div className="m-sep" /></div>
          ))}
        </div>
      </div>
  );
});
MarqueeStrip.displayName = "MarqueeStrip";

/* ─── Home ─── */
const Home = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
      <>
        <div className="home-page">
          <Header />
          <HeroBanner />
          <MarqueeStrip />
          <Footer />
        </div>
        <AnimatePresence>
          {showTop && (
              <motion.button className="scr-top"
                             onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                             initial={{ opacity: 0, scale: 0.55, y: 14 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.55, y: 14 }}
                             transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                ↑
              </motion.button>
          )}
        </AnimatePresence>
      </>
  );
};

export default Home;