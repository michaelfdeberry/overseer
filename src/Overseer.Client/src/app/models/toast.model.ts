export type Toast = {
  id: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  header?: string;
  message: string;
  delay?: number;
};
