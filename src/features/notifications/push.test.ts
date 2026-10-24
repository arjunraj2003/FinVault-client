import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationApi } from "./api";
import { disableBudgetNotifications, enableBudgetNotifications, notificationsSupported } from "./push";

vi.mock("./api", () => ({
  NotificationApi: {
    publicKey: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

const subscriptionJson = {
  endpoint: "https://push.example/1",
  keys: { p256dh: "key", auth: "auth" },
};

function installBrowserPush() {
  const subscription = {
    endpoint: subscriptionJson.endpoint,
    toJSON: () => subscriptionJson,
    unsubscribe: vi.fn(async () => true),
  };
  const subscribe = vi.fn(async () => subscription);
  const getSubscription = vi.fn(async () => null);
  const registration = { pushManager: { subscribe, getSubscription } };

  Object.defineProperty(window, "PushManager", { configurable: true, value: function PushManager() {} });
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: { requestPermission: vi.fn(async () => "granted") },
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      getRegistration: vi.fn(async () => registration),
      ready: Promise.resolve(registration),
    },
  });

  return { subscription, subscribe, getSubscription, registration };
}

describe("budget notification toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(NotificationApi.publicKey).mockResolvedValue({
      data: { data: { publicKey: "BEl" + "A".repeat(84) } },
    } as Awaited<ReturnType<typeof NotificationApi.publicKey>>);
    vi.mocked(NotificationApi.subscribe).mockResolvedValue({} as Awaited<ReturnType<typeof NotificationApi.subscribe>>);
    vi.mocked(NotificationApi.unsubscribe).mockResolvedValue({} as Awaited<ReturnType<typeof NotificationApi.unsubscribe>>);
  });

  it("hides the toggle when the browser cannot receive push", () => {
    Object.defineProperty(window, "PushManager", { configurable: true, value: undefined });

    expect(notificationsSupported()).toBe(false);
  });

  it("asks for permission and stores the phone subscription", async () => {
    const { subscribe } = installBrowserPush();

    await enableBudgetNotifications();

    expect(subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true }));
    expect(NotificationApi.subscribe).toHaveBeenCalledWith(subscriptionJson);
  });

  it("does not subscribe when permission is denied", async () => {
    installBrowserPush();
    vi.mocked(Notification.requestPermission).mockResolvedValue("denied");

    await expect(enableBudgetNotifications()).rejects.toThrow("Notifications are blocked");
    expect(NotificationApi.subscribe).not.toHaveBeenCalled();
  });

  it("removes this phone when notifications are turned off", async () => {
    const { subscription, getSubscription } = installBrowserPush();
    getSubscription.mockResolvedValue(subscription);

    await disableBudgetNotifications();

    expect(subscription.unsubscribe).toHaveBeenCalled();
    expect(NotificationApi.unsubscribe).toHaveBeenCalledWith(subscription.endpoint);
  });
});
