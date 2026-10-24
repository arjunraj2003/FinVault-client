import axiosInstance from "@/lib/axios";

export class NotificationApi {
  static publicKey() {
    return axiosInstance.get<{ data: { publicKey: string } }>("/notifications/vapid-public-key");
  }

  static subscribe(subscription: PushSubscriptionJSON) {
    return axiosInstance.post("/notifications/subscribe", subscription);
  }

  static unsubscribe(endpoint: string) {
    return axiosInstance.delete("/notifications/subscribe", { data: { endpoint } });
  }
}
