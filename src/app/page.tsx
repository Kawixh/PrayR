import { PrayerTimesWrapper } from "./_components/prayer-times-wrapper";
import { SettingsCheck } from "./_components/settings-check";

export default function Page() {
  return (
    <SettingsCheck>
      <div className="space-y-5">
        <PrayerTimesWrapper />
      </div>
    </SettingsCheck>
  );
}
