
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./dashboard.css";

type Asteroid = {
  id: string;
  name: string;
  diameterMinKm: number | null;
  diameterMaxKm: number | null;
  velocityKmS: number;
  missDistanceKm: number;
  approachDate: string | null;
  hazardous: boolean;
  nasaUrl?: string;
};

function getLocalDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export default function AsteroidDashboard({ variant }: { variant: "dashboard" | "search" }) {
  const isSearchPage = variant === "search";
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [searchResults, setSearchResults] = useState<Asteroid[]>([]);
  const [search, setSearch] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchDate(getLocalDateValue());

    async function loadAsteroids() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/asteroids");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load NASA asteroid data.");
        }

        if (!Array.isArray(data)) {
          throw new Error(data.error || "Unexpected NASA response.");
        }

        setAsteroids(data);
        setSearchResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAsteroids();
  }, []);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSearching(true);
      setHasSearched(true);
      setError("");
      const response = await fetch(`/api/asteroids?date=${encodeURIComponent(searchDate)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not search NASA asteroid data.");
      if (!Array.isArray(data)) throw new Error(data.error || "Unexpected NASA response.");
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  const filtered = useMemo(
    () =>
      searchResults.filter((asteroid) =>
        asteroid.name.toLowerCase().includes(search.toLowerCase())
      ),
    [searchResults, search]
  );

  const hazardousCount = asteroids.filter((a) => a.hazardous).length;

  const closest = [...asteroids].sort(
    (a, b) => a.missDistanceKm - b.missDistanceKm
  );

  const fastest = [...asteroids].sort(
    (a, b) => b.velocityKmS - a.velocityKmS
  );

  return (
    <>
    {!isSearchPage && <section className="upcoming-section" id="explore">
      <p className="dashboard-eyebrow">NASA NEOWS · NEXT 7 DAYS</p>
      <h2>Upcoming close approaches</h2>
      <p className="upcoming-intro">The names below are official asteroid designations. Each card shows its predicted closest pass to Earth.</p>
      {loading && <p role="status">Loading upcoming approaches…</p>}
      {error && <p className="dashboard-error" role="alert">{error}</p>}
      {!loading && !error && asteroids.slice(0, 6).map((asteroid) => (
        <article className="upcoming-card" key={asteroid.id}>
          <h3>{asteroid.name}</h3>
          <dl>
            <div><dt>Approach date</dt><dd>{asteroid.approachDate ?? "Unavailable"}</dd></div>
            <div><dt>Estimated diameter</dt><dd>{asteroid.diameterMinKm != null && asteroid.diameterMaxKm != null ? `${asteroid.diameterMinKm.toFixed(3)}–${asteroid.diameterMaxKm.toFixed(3)} km` : "Unavailable"}</dd></div>
            <div><dt>Distance at closest approach</dt><dd>{asteroid.missDistanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km</dd></div>
            <div><dt>Speed relative to Earth</dt><dd>{asteroid.velocityKmS.toFixed(2)} km/s</dd></div>
          </dl>
        </article>
      ))}
    </section>}

    {isSearchPage && <section className="asteroid-dashboard search-page-dashboard" id="objects">
      <div className="dashboard-heading">
        <p className="dashboard-eyebrow">NASA NEOWS · LIVE DATA</p>
        <h2>Search asteroid details</h2>
        <p>Search by asteroid name and close-approach date. Review NASA’s current close-approach data, measurements, and hazard classification.</p>
      </div>

      {loading && <p role="status">Loading NASA asteroid data…</p>}
      {error && <p className="dashboard-error" role="alert">{error}</p>}

      {!loading && (
        <>
          {isSearchPage && <>
          <div className="asteroid-stats">
            <article className="asteroid-stat">
              <span>Asteroids tracked</span>
              <strong>{asteroids.length}</strong>
            </article>

            <article className="asteroid-stat">
              <span>Potentially hazardous</span>
              <strong>{hazardousCount}</strong>
            </article>

            <article className="asteroid-stat">
              <span>Nearest approach distance</span>
              <strong>
                {closest[0]
                  ? `${Math.round(closest[0].missDistanceKm).toLocaleString()} km`
                  : "—"}
              </strong>
            </article>

            <article className="asteroid-stat">
              <span>Highest approach speed</span>
              <strong>
                {fastest[0]
                  ? `${fastest[0].velocityKmS.toFixed(2)} km/s`
                  : "—"}
              </strong>
            </article>
          </div>
          </>}

          {isSearchPage && <form className="asteroid-search-form" onSubmit={submitSearch}>
            <div className="dashboard-search">
              <label htmlFor="asteroid-search">Asteroid name</label>
              <input
              id="asteroid-search"
              type="search"
              placeholder="Enter an asteroid name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="dashboard-search date-search">
              <label htmlFor="approach-date">Close-approach date</label>
              <input id="approach-date" type="date" value={searchDate} onChange={(event) => setSearchDate(event.target.value)} required />
            </div>
            <button className="search-submit" type="submit" disabled={searching}>{searching ? "Searching…" : "Search NASA data"}</button>
          </form>}

          {isSearchPage && <p className="search-result-count" aria-live="polite">
            {search.trim()
              ? `${filtered.length} ${filtered.length === 1 ? "asteroid" : "asteroids"} found for “${search.trim()}”`
              : hasSearched
                ? `${filtered.length} asteroids found for ${searchDate}`
                : `${filtered.length} asteroids in the next 7 days`}
          </p>}
          {error && <p className="dashboard-error" role="alert">{error}</p>}
          {!searching && hasSearched && searchResults.length === 0 && !error && <p>No close approaches found for {searchDate}.</p>}

          {isSearchPage && search.trim() && filtered.length > 0 && (
            <div className="search-results" aria-label="Asteroid search results">
              {filtered.slice(0, 6).map((asteroid) => (
                <a className="search-result" href={asteroid.nasaUrl || "#"} target={asteroid.nasaUrl ? "_blank" : undefined} rel={asteroid.nasaUrl ? "noreferrer" : undefined} key={asteroid.id}>
                  <strong>{asteroid.name}</strong>
                  <span>{asteroid.approachDate ?? "Date unavailable"}</span>
                  <span>{asteroid.diameterMinKm != null && asteroid.diameterMaxKm != null ? `${asteroid.diameterMinKm.toFixed(3)}–${asteroid.diameterMaxKm.toFixed(3)} km diameter` : "Diameter unavailable"}</span>
                  <span>{asteroid.missDistanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km from Earth</span>
                  <span>{asteroid.velocityKmS.toFixed(2)} km/s</span>
                  <span className="search-result-arrow">↗</span>
                </a>
              ))}
            </div>
          )}

          {isSearchPage && <div className="asteroid-chart-grid">
            <article className="asteroid-panel">
              <h3>Asteroids with the nearest passes</h3>
              <p>Distance from Earth at closest approach, in kilometres. A smaller value means a closer pass, not an impact.</p>

              {closest.slice(0, 5).map((asteroid) => (
                <div className="asteroid-bar-row" key={asteroid.id}>
                  <span title={asteroid.name}>{asteroid.name}</span>
                  <div className="asteroid-bar-track">
                    <div
                      className="asteroid-bar"
                      style={{
                        width: `${
                          closest[4]?.missDistanceKm
                            ? Math.max(
                                3,
                                Math.min(
                                  100,
                                  (asteroid.missDistanceKm /
                                    closest[4].missDistanceKm) *
                                    100
                                )
                              )
                            : 3
                        }%`,
                      }}
                    />
                  </div>
                  <strong>
                    {asteroid.missDistanceKm.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
              ))}
            </article>

            <article className="asteroid-panel">
              <h3>Asteroids with the highest approach speeds</h3>
              <p>Speed relative to Earth at closest approach, in kilometres per second (km/s).</p>

              {fastest.slice(0, 5).map((asteroid) => (
                <div className="asteroid-bar-row" key={asteroid.id}>
                  <span title={asteroid.name}>{asteroid.name}</span>
                  <div className="asteroid-bar-track">
                    <div
                      className="asteroid-bar asteroid-speed-bar"
                      style={{
                        width: `${
                          fastest[0]?.velocityKmS
                            ? (asteroid.velocityKmS /
                                fastest[0].velocityKmS) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <strong>{asteroid.velocityKmS.toFixed(2)}</strong>
                </div>
              ))}
            </article>
          </div>}

          <div className="asteroid-panel asteroid-table-panel">
            <h3>{isSearchPage ? "Search results" : "All upcoming asteroid records"}</h3>

            {filtered.length === 0 ? (
              <p>{isSearchPage ? "No asteroids match this name and close-approach date." : "No upcoming asteroids are available."}</p>
            ) : (
              <div className="asteroid-table-scroll">
                <table className="asteroid-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Diameter (km)</th>
                      <th>Speed (km/s)</th>
                      <th>Distance (km)</th>
                      <th>Approach date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((asteroid) => (
                      <tr key={asteroid.id}>
                        <td>
                          {asteroid.nasaUrl ? (
                            <a
                              href={asteroid.nasaUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {asteroid.name}
                            </a>
                          ) : (
                            asteroid.name
                          )}
                        </td>
                        <td>
                          {asteroid.diameterMinKm != null &&
                          asteroid.diameterMaxKm != null
                            ? `${asteroid.diameterMinKm.toFixed(3)}–${asteroid.diameterMaxKm.toFixed(3)}`
                            : "Unavailable"}
                        </td>
                        <td>{asteroid.velocityKmS.toFixed(2)}</td>
                        <td>
                          {asteroid.missDistanceKm.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                <td>{asteroid.approachDate ?? "Unavailable"}</td>
                        <td>
                          <span
                            className={
                              asteroid.hazardous
                                ? "asteroid-status asteroid-status-warning"
                                : "asteroid-status"
                            }
                          >
                            {asteroid.hazardous
                              ? "Potentially hazardous"
                              : "Not classified hazardous"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isSearchPage && <p className="asteroid-disclaimer">
            Potentially hazardous is NASA's classification, not a prediction
            of an impact. Distance and velocity refer to the listed close
            approach.
          </p>}
        </>
      )}
    </section>}
    {isSearchPage && <div className="back-dashboard-wrap"><a href="/" className="primary-button">← Back to dashboard</a></div>}
    </>
  );
}
