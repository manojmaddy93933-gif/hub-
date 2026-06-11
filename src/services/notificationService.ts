/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class NotificationService {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }

  sendNotification(title: string, body: string, icon?: string): void {
    if (!this.isSupported()) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: icon || 'https://images.unsplash.com/photo-1616844868137-7effae7e8e49?w=96&auto=format&fit=crop&q=60',
        });
      } catch (e) {
        console.error('Failed to trigger web notification:', e);
      }
    }
  }
}

export const notificationService = new NotificationService();
