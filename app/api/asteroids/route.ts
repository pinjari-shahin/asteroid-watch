type NasaAsteroid = {
  id: string;
  name: string;
  nasa_jpl_url?: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: { kilometers: { estimated_diameter_min: number; estimated_diameter_max: number } };
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: { kilometers_per_second: string };
    miss_distance: { kilometers: string };
  }>;
};

export async function GET(request: Request) {
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

  const requestedDate = new URL(request.url).searchParams.get("date");
  if (requestedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return Response.json({ error: "Enter a valid close-approach date." }, { status: 400 });
  }
  const start = requestedDate ? new Date(`${requestedDate}T00:00:00Z`) : new Date();
  if (Number.isNaN(start.getTime()) || (requestedDate && start.toISOString().slice(0, 10) !== requestedDate)) {
    return Response.json({ error: "Enter a valid close-approach date." }, { status: 400 });
  }
  const end = new Date(start);
  if (!requestedDate) end.setUTCDate(end.getUTCDate() + 6);
  const date = (value: Date) => value.toISOString().slice(0, 10);
  const url = new URL("https://api.nasa.gov/neo/rest/v1/feed");
  url.searchParams.set("start_date", date(start));
  url.searchParams.set("end_date", date(end));
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      return Response.json({ error: "NASA asteroid data is temporarily unavailable. Please try again shortly." }, { status: 502 });
    }
    const payload = await response.json();
    const asteroids: NasaAsteroid[] = Object.values(payload.near_earth_objects ?? {}).flat() as NasaAsteroid[];
    const records = asteroids.flatMap((asteroid) => {
      const approach = asteroid.close_approach_data[0];
      if (!approach) return [];
      return [{
        id: asteroid.id,
        name: asteroid.name,
        diameterMinKm: asteroid.estimated_diameter.kilometers.estimated_diameter_min,
        diameterMaxKm: asteroid.estimated_diameter.kilometers.estimated_diameter_max,
        velocityKmS: Number(approach.relative_velocity.kilometers_per_second),
        missDistanceKm: Number(approach.miss_distance.kilometers),
        approachDate: approach.close_approach_date,
        hazardous: asteroid.is_potentially_hazardous_asteroid,
        nasaUrl: asteroid.nasa_jpl_url,
      }];
    });
    return Response.json(records, { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return Response.json({ error: "Could not connect to NASA asteroid data. Please try again shortly." }, { status: 502 });
  }
}
