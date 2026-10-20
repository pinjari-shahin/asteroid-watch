import type { Metadata } from "next";
import AsteroidDashboard from "../AsteroidDashboard";
import SiteHeader from "../SiteHeader";

export const metadata: Metadata = {
  title: "Search Asteroids | AsteroidWatch",
  description: "Search NASA near-Earth asteroid data by name and close-approach date.",
};

export default function SearchPage() {
  return (
    <main className="space-app">
      <SiteHeader />
      <AsteroidDashboard variant="search" />
      <footer>
        <span>✳ ASTEROIDWATCH</span>
        <span>DATA: NASA NEOWS</span>
        <span>© 2026 AsteroidWatch. All rights reserved.</span>
      </footer>
    </main>
  );
}
