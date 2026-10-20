import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="AsteroidWatch dashboard">
        <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
          <defs>
            <linearGradient id="brand-core" x1="8" y1="7" x2="31" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A8E3FF" />
              <stop offset="1" stopColor="#3986D5" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="38" height="38" rx="12" fill="#09172A" stroke="#294C70" />
          <ellipse cx="20" cy="20" rx="14" ry="7" transform="rotate(-38 20 20)" fill="none" stroke="#58B9FF" strokeWidth="1.4" />
          <circle cx="20" cy="20" r="5.2" fill="url(#brand-core)" />
          <circle cx="30.2" cy="11.2" r="2.3" fill="#F2D7A2" />
          <circle cx="11" cy="29" r="1" fill="#D9EDFF" />
        </svg>
        <span>ASTEROID<span className="brand-blue">WATCH</span>
          <small>NEAR-EARTH OBJECT OBSERVATORY</small>
        </span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#explore">Explore</Link>
        <Link href="/search">Search asteroids</Link>
        <Link href="/#about">About</Link>
      </nav>
      <span className="live-label"><i /> NASA NEOWS</span>
    </header>
  );
}
