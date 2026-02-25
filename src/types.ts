export interface CloudLayer {
  type: 'FEW' | 'SCT' | 'BKN' | 'OVC';
  height: number; // feet
}

export interface ParsedMETAR {
  icao: string;
  datetime: Date;
  visibility: number; // meters
  clouds: CloudLayer[];
  raw: string;
}

export interface WeatherLimit {
  id: string;
  name: string;
  minVisibility: number; // meters
  cloudRule: 'strict' | 'few-ok';
  maxCloudHeight: number; // feet
  timePeriod: 'udp' | 'outside-udp' | '24/7';
}

export interface LimitViolation {
  metar: ParsedMETAR;
  limit: WeatherLimit;
  violated: boolean;
  reason?: string;
}

export interface MonthlyStats {
  month: number;
  year: number;
  total: number;
  violations: number;
  percentage: number;
}

export interface DailyStats {
  date: string;
  udpTotal: number;
  udpViolations: number;
  nonUdpTotal: number;
  nonUdpViolations: number;
}
