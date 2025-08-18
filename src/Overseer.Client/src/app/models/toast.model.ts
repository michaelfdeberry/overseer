export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  type?: ToastType;
  header?: string;
  message: string;
  delay?: number;
};
