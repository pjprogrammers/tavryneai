import {
  initializeAppCheck as initAppCheck,
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import { app } from '@/lib/firebase/client';

let appCheckInstance: ReturnType<typeof initAppCheck> | undefined;
let isInitialized = false;

const getRecaptchaSiteKey = (): string | undefined => {
  const v3Key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (v3Key) return v3Key;
  return process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
};

const isDevelopment = () => process.env.NODE_ENV === 'development';

export const initializeAppCheck = async () => {
  if (isInitialized && appCheckInstance) return appCheckInstance;
  if (typeof window === 'undefined') return undefined;

  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) {
    if (!isDevelopment()) {
      console.error('[App Check] Production build without reCAPTCHA key');
    }
    return undefined;
  }

  if (isDevelopment()) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  try {
    const isEnterprise = !!process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
    const provider = isEnterprise
      ? new ReCaptchaEnterpriseProvider(siteKey)
      : new ReCaptchaV3Provider(siteKey);

    appCheckInstance = initAppCheck(app, { provider, isTokenAutoRefreshEnabled: true });
    isInitialized = true;
    return appCheckInstance;
  } catch (error) {
    console.error('[App Check] Failed to initialize:', error);
    return undefined;
  }
};

export const isAppCheckInitialized = () => isInitialized;
