import type { ReactNode } from "react";

type SettingsSectionProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function SettingsSection({
  children,
  description,
  title,
}: SettingsSectionProps) {
  return (
    <section className="space-y-3">
      <header className="space-y-1">
        <h2 className="text-balance text-lg font-semibold sm:text-xl">{title}</h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </header>

      {children}
    </section>
  );
}
