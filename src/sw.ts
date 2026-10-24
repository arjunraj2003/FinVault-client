/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("push", (event) => {
  const payload = event.data?.json() as { title?: string; body?: string; url?: string } | undefined;
  event.waitUntil(
    self.registration.showNotification(payload?.title || "FinVault", {
      body: payload?.body || "A budget needs attention",
      icon: "/icons/icon-192x192.png",
      data: { url: payload?.url || "/budgets" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/budgets", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windowClients) => {
      const existing = windowClients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        await existing.focus();
        return existing.navigate(url);
      }
      return self.clients.openWindow(url);
    })
  );
});

export {};
