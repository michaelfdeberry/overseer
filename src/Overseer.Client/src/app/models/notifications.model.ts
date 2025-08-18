export type NotificationType = 'Job' | 'Simple';

export type NotificationBase = {
  notificationType: NotificationType;
  id: number;
  timestamp: number;
  message: string;
  isRead: boolean;
};

export type SimpleNotification = NotificationBase & { notificationType: 'Simple' };

export type JobNotification = {
  notificationType: 'Job';
  id: number;
  timestamp: number;
  message: string;
  isRead: boolean;
  type: 'JobStarted' | 'JobPaused' | 'JobResumed' | 'JobCompleted' | 'JobError';
  machineId: number;
  machineJobId: string;
};

export type Notification = JobNotification | SimpleNotification;
