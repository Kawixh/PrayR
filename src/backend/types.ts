export type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
};

export type AlAdhanWeekday = {
  en: string;
  ar: string;
};

export type AlAdhanHijriMonth = {
  number: number;
  en: string;
  ar: string;
  days: number;
};

export type AlAdhanDesignation = {
  abbreviated: string;
  expanded: string;
};

export type AlAdhanHijri = {
  date: string;
  format: string;
  day: string;
  weekday: AlAdhanWeekday;
  month: AlAdhanHijriMonth;
  year: string;
  designation: AlAdhanDesignation;
  holidays: unknown[];
  adjustedHolidays: string[];
  method: string;
};

export type AlAdhanGregorianWeekday = {
  en: string;
};

export type AlAdhanGregorianMonth = {
  number: number;
  en: string;
};

export type AlAdhanGregorian = {
  date: string;
  format: string;
  day: string;
  weekday: AlAdhanGregorianWeekday;
  month: AlAdhanGregorianMonth;
  year: string;
  designation: AlAdhanDesignation;
  lunarSighting: boolean;
};

export type AlAdhanDateInfo = {
  readable: string;
  timestamp: string;
  hijri: AlAdhanHijri;
  gregorian: AlAdhanGregorian;
};

export type AlAdhanMethodParams = {
  Fajr: number;
  Isha: number;
};

export type AlAdhanMethodLocation = {
  latitude: number;
  longitude: number;
};

export type AlAdhanMethod = {
  id: number;
  name: string;
  params: AlAdhanMethodParams;
  location: AlAdhanMethodLocation;
};

export type AlAdhanOffset = {
  Imsak: number;
  Fajr: number;
  Sunrise: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Sunset: number;
  Isha: number;
  Midnight: number;
};

export type AlAdhanMeta = {
  latitude: number;
  longitude: number;
  timezone: string;
  method: AlAdhanMethod;
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
  offset: AlAdhanOffset;
};

export type AlAdhanDayData = {
  timings: PrayerTimings;
  date: AlAdhanDateInfo;
  meta: AlAdhanMeta;
};

export type AlAdhanTimingsResponse = {
  code: number;
  status: string;
  data: AlAdhanDayData;
};

// Backward-compatible aliases for existing imports.
export type Weekday = AlAdhanWeekday;
export type Month = AlAdhanHijriMonth;
export type Designation = AlAdhanDesignation;
export type Hijri = AlAdhanHijri;
export type GregorianWeekday = AlAdhanGregorianWeekday;
export type GregorianMonth = AlAdhanGregorianMonth;
export type Gregorian = AlAdhanGregorian;
export type DateInfo = AlAdhanDateInfo;
export type MethodParams = AlAdhanMethodParams;
export type MethodLocation = AlAdhanMethodLocation;
export type Method = AlAdhanMethod;
export type Offset = AlAdhanOffset;
export type Meta = AlAdhanMeta;
export type Data = AlAdhanDayData;
export type ApiResponse = AlAdhanTimingsResponse;
