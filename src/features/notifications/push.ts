import { NotificationApi } from "./api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

export function notificationsSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function currentPushSubscription() {
  if (!notificationsSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function enableBudgetNotifications() {
  if (!notificationsSupported()) {
    throw new Error("Install FinVault to the home screen to get budget alerts.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notifications are blocked in the browser settings.");
  }

  const registration = await navigator.serviceWorker.ready;
  const keyResponse = await NotificationApi.publicKey();
  const publicKey = keyResponse.data.data.publicKey;
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("This browser did not create a push subscription.");
  }
  await NotificationApi.subscribe(json);
  return subscription;
}

export async function disableBudgetNotifications() {
  const subscription = await currentPushSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await NotificationApi.unsubscribe(endpoint);
}
