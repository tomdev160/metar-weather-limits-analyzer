import { ParsedMETAR, WeatherLimit, LimitViolation } from '../types';
import { isUDP } from './udpCalculation';

export function checkLimit(metar: ParsedMETAR, limit: WeatherLimit): LimitViolation {
  const withinUDP = isUDP(metar.datetime, metar.icao);

  // Check if this METAR is relevant for the limit's time period
  if (limit.timePeriod === 'udp' && !withinUDP) {
    return { metar, limit, violated: false };
  }
  if (limit.timePeriod === 'outside-udp' && withinUDP) {
    return { metar, limit, violated: false };
  }

  // Visibility check
  if (metar.visibility < limit.minVisibility) {
    return {
      metar,
      limit,
      violated: true,
      reason: `Visibility ${metar.visibility}m < ${limit.minVisibility}m`,
    };
  }

  // Cloud check
  const significantClouds = metar.clouds.filter(
    (c) =>
      (limit.cloudRule === 'strict'
        ? c.type === 'BKN' || c.type === 'OVC' || c.type === 'SCT'
        : c.type === 'BKN' || c.type === 'OVC') &&
      c.height < limit.maxCloudHeight
  );

  if (significantClouds.length > 0) {
    return {
      metar,
      limit,
      violated: true,
      reason: `Cloud layer ${significantClouds[0].type}${String(significantClouds[0].height / 100).padStart(3, '0')} at ${significantClouds[0].height}ft < ${limit.maxCloudHeight}ft`,
    };
  }

  return { metar, limit, violated: false };
}

export function calculateStats(
  metars: ParsedMETAR[],
  limit: WeatherLimit,
  airport: string
) {
  const filtered = metars.filter((m) => m.icao === airport);

  // Monthly stats
  const monthlyMap = new Map<string, { total: number; violations: number; month: number; year: number }>();

  for (const metar of filtered) {
    const violation = checkLimit(metar, limit);
    const year = metar.datetime.getUTCFullYear();
    const month = metar.datetime.getUTCMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;

    // Only count if this METAR is relevant for the time period
    const withinUDP = isUDP(metar.datetime, metar.icao);
    const relevant =
      limit.timePeriod === '24/7' ||
      (limit.timePeriod === 'udp' && withinUDP) ||
      (limit.timePeriod === 'outside-udp' && !withinUDP);

    if (!relevant) continue;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { total: 0, violations: 0, month, year });
    }
    const entry = monthlyMap.get(key)!;
    entry.total++;
    if (violation.violated) entry.violations++;
  }

  const monthly = Array.from(monthlyMap.values())
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((e) => ({
      ...e,
      percentage: e.total > 0 ? (e.violations / e.total) * 100 : 0,
    }));

  return monthly;
}

export function getDailyStats(metars: ParsedMETAR[], limit: WeatherLimit, airport: string) {
  const filtered = metars.filter((m) => m.icao === airport);
  const dailyMap = new Map<
    string,
    { udpTotal: number; udpViolations: number; nonUdpTotal: number; nonUdpViolations: number }
  >();

  for (const metar of filtered) {
    const year = metar.datetime.getUTCFullYear();
    const month = metar.datetime.getUTCMonth() + 1;
    const day = metar.datetime.getUTCDate();
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (!dailyMap.has(key)) {
      dailyMap.set(key, { udpTotal: 0, udpViolations: 0, nonUdpTotal: 0, nonUdpViolations: 0 });
    }
    const entry = dailyMap.get(key)!;
    const withinUDP = isUDP(metar.datetime, metar.icao);
    const violation = checkLimit(metar, limit);

    if (withinUDP) {
      if (limit.timePeriod !== 'outside-udp') {
        entry.udpTotal++;
        if (violation.violated) entry.udpViolations++;
      }
    } else {
      if (limit.timePeriod !== 'udp') {
        entry.nonUdpTotal++;
        if (violation.violated) entry.nonUdpViolations++;
      }
    }
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({ date, ...stats }));
}
