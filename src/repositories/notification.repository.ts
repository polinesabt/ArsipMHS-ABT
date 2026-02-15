/**
 * Notification Repository
 */

import { apiClient, ApiResponse } from '@/lib/api-client';
import type { NotificationListPayload } from '@/types/evaluation.types';

export async function getStudentNotifications(
  unreadOnly = false
): Promise<ApiResponse<NotificationListPayload>> {
  return apiClient.get<NotificationListPayload>('notifications/list.php', {
    params: unreadOnly ? { unread_only: 1 } : {},
  });
}

export async function markNotificationRead(
  notificationId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('notifications/mark_read.php', {
    notification_id: notificationId,
  });
}

export async function markAllNotificationsRead(): Promise<
  ApiResponse<{ updated: number }>
> {
  return apiClient.post<{ updated: number }>('notifications/mark_all_read.php');
}
