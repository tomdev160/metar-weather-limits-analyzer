const AIRPORT_COORDS: Record<string, { lat: number; lon: number }> = {
  EHAM: { lat: 52.31, lon: 4.76 },
  EHGG: { lat: 53.12, lon: 6.58 },
  EHLE: { lat: 52.46, lon: 5.52 },
  EHJK: { lat: 52.92, lon: 4.78 },
  EHWO: { lat: 51.45, lon: 5.40 },
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getSunriseSunset(date: Date, icao: string): { sunrise: Date; sunset: Date } {
  const coords = AIRPORT_COORDS[icao] ?? AIRPORT_COORDS['EHAM'];
  const { lat, lon } = coords;

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // Julian date
  const JD = julianDate(year, month, day);
  const n = JD - 2451545.0;

  // Mean longitude and mean anomaly
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = toRad((357.528 + 0.9856003 * n) % 360);

  // Ecliptic longitude
  const lambda = toRad(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));

  // Obliquity of ecliptic
  const epsilon = toRad(23.439 - 0.0000004 * n);

  // Right ascension
  const sinLambda = Math.sin(lambda);
  const RA = Math.atan2(Math.cos(epsilon) * sinLambda, Math.cos(lambda)) * (180 / Math.PI);

  // Declination
  const dec = Math.asin(Math.sin(epsilon) * sinLambda);

  // Equation of time (minutes)
  const LL = (L % 360 + 360) % 360;
  const RAnorm = ((RA % 360) + 360) % 360;
  const EqT = 4 * (LL - RAnorm);

  // Hour angle for sunrise/sunset
  const latRad = toRad(lat);
  const cosH =
    (Math.cos(toRad(90.833)) - Math.sin(latRad) * Math.sin(dec)) /
    (Math.cos(latRad) * Math.cos(dec));

  let sunriseUTC: Date;
  let sunsetUTC: Date;

  if (cosH < -1) {
    // Polar day
    sunriseUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    sunsetUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
  } else if (cosH > 1) {
    // Polar night
    sunriseUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    sunsetUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  } else {
    const H = Math.acos(cosH) * (180 / Math.PI);

    const sunriseMinutes = 720 - 4 * (lon + H) - EqT;
    const sunsetMinutes = 720 - 4 * (lon - H) - EqT;

    sunriseUTC = minutesToUTC(year, month - 1, day, sunriseMinutes);
    sunsetUTC = minutesToUTC(year, month - 1, day, sunsetMinutes);
  }

  return { sunrise: sunriseUTC, sunset: sunsetUTC };
}

function julianDate(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function minutesToUTC(year: number, month: number, day: number, minutes: number): Date {
  const totalMinutes = Math.round(minutes);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return new Date(Date.UTC(year, month, day, h, m, 0));
}

export function isUDP(datetime: Date, icao: string): boolean {
  const { sunrise, sunset } = getSunriseSunset(datetime, icao);
  const udpStart = new Date(sunrise.getTime() - 15 * 60 * 1000);
  const udpEnd = new Date(sunset.getTime() + 15 * 60 * 1000);
  return datetime >= udpStart && datetime <= udpEnd;
}
