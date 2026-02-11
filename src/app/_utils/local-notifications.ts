export type LocalNotificationPermission = NotificationPermission | "unsupported";

type LocalNotificationPayload = {
  title: string;
  body: string;
  tag: string;
  icon?: string;
  badge?: string;
};

export function getLocalNotificationPermission(): LocalNotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function showLocalNotification({
  title,
  body,
  tag,
  icon = "/icon-192.png",
  badge = "/icon-192.png",
}: LocalNotificationPayload): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("Notifications are not supported on this device.");
  }

  if (Notification.permission !== "granted") {
    throw new Error("Notification permission is not granted.");
  }

  const options: NotificationOptions = {
    body,
    icon,
    badge,
    tag,
  };

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    } catch (error) {
      console.error("Service worker notification failed:", error);
    }
  }

  new Notification(title, options);
}
