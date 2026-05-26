// Thin accessor for the global Telegram.WebApp object. Typed loose on purpose —
// once we migrate to @telegram-apps/sdk-react fully we delete this.

interface TgWebApp {
  initData?: string;
  initDataUnsafe?: { user?: { language_code?: string } };
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  HapticFeedback?: {
    impactOccurred?: (k: string) => void;
    notificationOccurred?: (k: string) => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export const tg: TgWebApp | undefined = window.Telegram?.WebApp;
