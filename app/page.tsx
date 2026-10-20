"use client";

import dynamic from "next/dynamic";
import AsteroidDashboard from "./AsteroidDashboard";
import SiteHeader from "./SiteHeader";

const AsteroidScene = dynamic(() => import("./AsteroidScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">INITIALIZING DEEP SPACE...</div>,
});

export default function Home() {
  return (
    <main className="space-app">
      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> NEAR-EARTH OBJECT OBSERVATORY</p>
          <h1>Discover the<br />worlds <em>near us.</em></h1>
          <p className="hero-description">
            Explore asteroids approaching Earth. Search NASA data for estimated
            diameter, close-approach date, distance, velocity, and hazard status.
          </p>
          <div className="hero-actions">
            <a href="#explore" className="primary-button">Explore all asteroids ↗</a>
            <a href="/search" className="secondary-button">Search asteroids⌕</a>
          </div>
          <div className="hero-stats">
            <div><strong>LIVE</strong><span>NASA NEOWS DATA</span></div>
            <div><strong>7 DAYS</strong><span>UPCOMING APPROACHES</span></div>
            <div><strong>3D</strong><span>SPACE VISUALIZATION</span></div>
          </div>
        </div>

        <div className="scene-panel" aria-label="Interactive 3D Earth and asteroid visualization">
          <div className="scene-topline">
            <span><i /> LIVE DATA / 001</span>
            <span>EARTH · ASTEROID FIELD</span>
          </div>
          <div className="scene-canvas"><AsteroidScene /></div>
          <div className="scene-bottomline">
            <span>DRAG TO ROTATE</span><span>SCROLL TO ZOOM</span><span>3D VISUALIZATION</span>
          </div>
          <div className="scene-object-tag">
            <span className="tag-dot" />
            <div><strong>Near-Earth objects</strong><small>NASA NEOWS CATALOGUE</small></div>
          </div>
        </div>
      </section>

      <AsteroidDashboard variant="dashboard" />

      <section className="about-section" id="about">
        <div className="about-inner">
          <div className="about-copy">
            <p className="eyebrow"><span /> ABOUT ASTEROIDWATCH</p>
            <h2>Near-Earth object data from NASA.</h2>
            <p className="about-lede">AsteroidWatch presents asteroid close-approach data in a clear, searchable format.</p>
          </div>
          <div className="about-facts">
            <div><span>DATA SOURCE</span><strong>NASA NeoWs</strong></div>
            <div><span>INCLUDES</span><strong>Date · Size · Distance · Speed</strong></div>
          </div>
        </div>
        <div className="about-team">
          <p className="about-team-label">PROJECT TEAM</p>
          <ul aria-label="AsteroidWatch developers">
            <li>Shahin</li>
            <li>Vaahid</li>
            <li>Saniya</li>
            <li>Abrar</li>
            <li>Chakri</li>
          </ul>
        </div>
        <p className="about-footnote">Close-approach measurements describe the listed pass and do not indicate an impact prediction.</p>
      </section>

      <footer>
        <span>✳ ASTEROIDWATCH</span>
        <span>DATA: NASA NEOWS · VISUALIZATION: CONCEPT</span>
        <span>© 2026 AsteroidWatch. All rights reserved.</span>
      </footer>
    </main>
  );
}
