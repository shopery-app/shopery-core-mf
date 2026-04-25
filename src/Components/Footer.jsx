import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };

  return (
      <>
        <style>{`
        :root {
          --footer-bg: #111110;
          --footer-surface: #1A1A18;
          --footer-border: rgba(255,255,255,0.08);
          --footer-text: rgba(255,255,255,0.55);
          --footer-text-hover: rgba(255,255,255,0.9);
          --footer-accent: #22C55E;
          --footer-font: 'Instrument Sans', sans-serif;
          --footer-serif: 'DM Serif Display', serif;
        }

        .footer {
          background: var(--footer-bg);
          font-family: var(--footer-font);
          position: relative;
          overflow: hidden;
        }

        /* Subtle gradient top border */
        .footer::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #22C55E55, #22C55E88, #22C55E55, transparent);
        }

        /* Decorative orb */
        .footer::after {
          content: '';
          position: absolute; bottom: -80px; right: -80px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .footer-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 32px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.5fr;
          gap: 40px;
          position: relative;
        }

        /* Brand column */
        .footer-brand {}
        .footer-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 14px;
        }
        .footer-logo-box {
          width: 34px; height: 34px;
          background: #FAFAF8;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #111110; font-size: 14px;
        }
        .footer-logo-text {
          font-family: var(--footer-serif);
          font-size: 18px; color: #FAFAF8;
        }
        .footer-tagline {
          font-size: 12.5px;
          color: var(--footer-text);
          line-height: 1.6;
          margin-bottom: 18px;
          max-width: 200px;
        }
        .footer-contact-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: var(--footer-text);
          margin-bottom: 8px;
        }
        .footer-contact-icon {
          width: 24px; height: 24px;
          background: var(--footer-surface);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: var(--footer-accent); font-size: 10px;
          flex-shrink: 0;
        }

        /* Link columns */
        .footer-col h4 {
          font-size: 12px; font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 16px;
        }
        .footer-col ul {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 10px;
        }
        .footer-col ul li a {
          font-size: 13px;
          color: var(--footer-text);
          text-decoration: none;
          transition: color 0.15s ease;
          display: flex; align-items: center; gap: 6px;
        }
        .footer-col ul li a:hover { color: var(--footer-text-hover); }
        .footer-col ul li a::before {
          content: '';
          width: 0; height: 1px;
          background: var(--footer-accent);
          transition: width 0.2s ease;
          display: inline-block;
        }
        .footer-col ul li a:hover::before { width: 10px; }

        /* Newsletter column */
        .footer-newsletter h4 {
          font-size: 12px; font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 8px;
        }
        .footer-newsletter p {
          font-size: 12.5px;
          color: var(--footer-text);
          margin: 0 0 14px;
          line-height: 1.5;
        }
        .newsletter-form {
          display: flex;
          background: var(--footer-surface);
          border: 1px solid var(--footer-border);
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .newsletter-form:focus-within {
          border-color: rgba(34,197,94,0.4);
        }
        .newsletter-input {
          flex: 1; padding: 10px 12px;
          background: transparent; border: none; outline: none;
          font-size: 12.5px; color: #FAFAF8;
          font-family: var(--footer-font);
        }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.3); }
        .newsletter-btn {
          padding: 8px 14px;
          background: var(--footer-accent);
          border: none; cursor: pointer;
          color: #fff; font-size: 11px; font-weight: 700;
          font-family: var(--footer-font);
          letter-spacing: 0.04em;
          transition: background 0.15s ease;
          white-space: nowrap;
        }
        .newsletter-btn:hover { background: #16A34A; }
        .newsletter-btn.success { background: #15803D; }

        /* Bottom bar */
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 24px;
          border-top: 1px solid var(--footer-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .footer-copy {
          font-size: 12px; color: var(--footer-text);
        }
        .footer-socials {
          display: flex; align-items: center; gap: 8px;
        }
        .social-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: var(--footer-surface);
          border: 1px solid var(--footer-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--footer-text); font-size: 12px;
          cursor: pointer; text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }
        .social-btn:hover {
          background: #2A2A28; color: #FAFAF8;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand { grid-column: 1 / -1; }
          .footer-newsletter { grid-column: 1 / -1; }
          .newsletter-form { max-width: 360px; }
        }

        @media (max-width: 560px) {
          .footer-main {
            grid-template-columns: 1fr;
            padding: 36px 20px 28px;
            gap: 28px;
          }
          .footer-bottom {
            flex-direction: column-reverse;
            gap: 12px;
            text-align: center;
            padding: 16px 20px;
          }
          .newsletter-form { max-width: 100%; }
        }
      `}</style>

        <footer className="footer">
          <div className="footer-main">
            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-box"><i className="fa-solid fa-leaf" /></div>
                <span className="footer-logo-text">Shopery</span>
              </Link>
              <p className="footer-tagline">Fresh groceries & amazing deals delivered to your door.</p>
              <div className="footer-contact-item">
                <div className="footer-contact-icon"><i className="fa-solid fa-phone" /></div>
                +391 (0)35 2568 4593
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon"><i className="fa-solid fa-envelope" /></div>
                contact@shopery.com
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/products">Our Products</Link></li>
                <li><Link to="/shops">Find Stores</Link></li>
                <li><Link to="/blogs">Blog</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help & Contact</Link></li>
                <li><Link to="/returns">Returns</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-newsletter">
              <h4>Stay Updated</h4>
              <p>Get the latest deals and new collections straight to your inbox.</p>
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                    type="email"
                    className="newsletter-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <button type="submit" className={`newsletter-btn ${subscribed ? "success" : ""}`}>
                  {subscribed ? "✓ Done" : "Subscribe"}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Shopery. All rights reserved.</p>
            <div className="footer-socials">
              {[
                { icon: "fa-brands fa-facebook-f", href: "#" },
                { icon: "fa-brands fa-x-twitter", href: "#" },
                { icon: "fa-brands fa-instagram", href: "#" },
                { icon: "fa-brands fa-telegram", href: "#" },
              ].map(({ icon, href }) => (
                  <a key={icon} href={href} className="social-btn">
                    <i className={icon} />
                  </a>
              ))}
            </div>
          </div>
        </footer>
      </>
  );
};

export default Footer;