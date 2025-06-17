import { PrayerTimesWrapper } from "./_components/prayer-times-wrapper";
import { SettingsCheck } from "./_components/settings-check";
import { InstallPrompt } from "./_utils/install-prompt";

export default function Page() {
  return (
    <SettingsCheck>
      <div className="p-4 flex flex-col container max-w-full md:max-w-2xl lg:max-w-4xl mx-auto h-screen gap-10">
        <InstallPrompt />
        <PrayerTimesWrapper />
      </div>
    </SettingsCheck>
  );
}
