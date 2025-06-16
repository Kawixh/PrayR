import { getAdhanTime } from "@/backend/get-adhan-time";
import { PrayerTimeCard } from "./_components/prayer-time-card";
import { InstallPrompt } from "./_utils/install-prompt";

export default async function Page() {
  const adhanTime = await getAdhanTime("London", "GB");

  return (
    <div className="flex flex-col container max-w-full md:max-w-2xl lg:max-w-4xl mx-auto h-screen gap-10">
      <InstallPrompt />

      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Adhan Time</h1>
        <PrayerTimeCard timings={adhanTime} />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <p className="text-lg font-semibold">Fajr</p>
            <p className="text-xl">{adhanTime.Fajr}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Sunrise</p>
            <p className="text-xl">{adhanTime.Sunrise}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Dhuhr</p>
            <p className="text-xl">{adhanTime.Dhuhr}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Asr</p>
            <p className="text-xl">{adhanTime.Asr}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Maghrib</p>
            <p className="text-xl">{adhanTime.Maghrib}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Isha</p>
            <p className="text-xl">{adhanTime.Isha}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
