import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AsteroidWatch | NASA Asteroid Explorer",
  description: "Explore and search NASA near-Earth asteroid data, including estimated diameter, approach date, Earth distance, and velocity.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
