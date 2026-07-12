import { dummyNotificationsData } from "./notifications.data";
import type { NotificationsData } from "./notifications.types";

export async function getNotificationsData(): Promise<NotificationsData> {
  return structuredClone(dummyNotificationsData);
}
