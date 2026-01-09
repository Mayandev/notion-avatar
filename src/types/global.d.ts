// Google Analytics gtag 类型声明
interface Window {
  gtag?: (
    command: 'config' | 'set' | 'event' | 'js',
    targetId: string | Date,
    config?: {
      page_path?: string;
      [key: string]: any;
    },
  ) => void;
  dataLayer?: any[];
}
