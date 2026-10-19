/**
 * 通用类型定义
 */

/** NERV family: the NERV console theme plus one palette per Evangelion unit. */
export type NervTheme = 'nerv' | 'eva00' | 'eva01' | 'eva02' | 'eva03' | 'eva08' | 'mark06';

export type Theme = 'light' | 'white' | 'dark' | 'auto' | NervTheme;

export type Language = 'zh-CN' | 'zh-TW' | 'en' | 'ru' | 'vi' | 'ko' | 'tr';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}
