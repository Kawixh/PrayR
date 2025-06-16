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

export type Weekday = {
  en: string;
  ar: string;
};

export type Month = {
  number: number;
  en: string;
  ar: string;
  days: number;
};

export type Designation = {
  abbreviated: string;
  expanded: string;
};

export type Hijri = {
  date: string;
  format: string;
  day: string;
  weekday: Weekday;
  month: Month;
  year: string;
  designation: Designation;
  holidays: any[]; // You might want to define a more specific type if you know the structure of holidays
  adjustedHolidays: any[]; // You might want to define a more specific type if you know the structure of adjustedHolidays
  method: string;
};

export type GregorianWeekday = {
  en: string;
};

export type GregorianMonth = {
  number: number;
  en: string;
};

export type Gregorian = {
  date: string;
  format: string;
  day: string;
  weekday: GregorianWeekday;
  month: GregorianMonth;
  year: string;
  designation: Designation;
  lunarSighting: boolean;
};

export type DateInfo = {
  readable: string;
  timestamp: string;
  hijri: Hijri;
  gregorian: Gregorian;
};

export type MethodParams = {
  Fajr: number;
  Isha: number;
};

export type MethodLocation = {
  latitude: number;
  longitude: number;
};

export type Method = {
  id: number;
  name: string;
  params: MethodParams;
  location: MethodLocation;
};

export type Offset = {
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

export type Meta = {
  latitude: number;
  longitude: number;
  timezone: string;
  method: Method;
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
  offset: Offset;
};

export type Data = {
  timings: PrayerTimings;
  date: DateInfo;
  meta: Meta;
};

export type ApiResponse = {
  code: number;
  status: string;
  data: Data;
};
