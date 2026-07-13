import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';

const LOGIN_ERROR_KEYS: Record<string, string> = {
  invalid_state: 'login.error.invalid_state',
  token_exchange_failed: 'login.error.token_exchange_failed',
  userinfo_failed: 'login.error.userinfo_failed',
};

function resolveLoginErrorMessage(t: (key: string, params?: Record<string, string | number>) => string, errorCode: string | null): string | null {
  if (!errorCode) return null;
  if (LOGIN_ERROR_KEYS[errorCode]) return t(LOGIN_ERROR_KEYS[errorCode]);
  if (errorCode.startsWith('token_exchange_failed_')) {
    const status = errorCode.replace('token_exchange_failed_', '');
    return t('login.error.token_exchange_failed_status', { status });
  }
  if (errorCode.startsWith('userinfo_failed_')) {
    const status = errorCode.replace('userinfo_failed_', '');
    return t('login.error.userinfo_failed_status', { status });
  }
  return t('login.error.fallback', { code: errorCode });
}

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const errorMessage = resolveLoginErrorMessage(t, searchParams.get('error'));

  return (
    <div className="min-h-screen bg-white">
      <header className="flex h-16 items-center justify-between border-b border-surface-700 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f48120] text-white shadow-sm">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.3 17.5a4.8 4.8 0 0 1 0-9.6h.5a6.3 6.3 0 0 1 12.1 2.1A3.9 3.9 0 0 1 19 17.5H7.3Z" />
              <path d="M3.8 18.4a3.2 3.2 0 0 1 2.4-5.3h1.1a3.9 3.9 0 0 0 0 7.8h11.4a3.4 3.4 0 0 1-2.8 1.5H6.4a3.2 3.2 0 0 1-2.6-4Z" opacity=".85" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-surface-100">IssueTick</span>
        </div>
        <span className="text-sm text-surface-400">{t('login.tagline')}</span>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#f48120]">{t('login.heroKicker')}</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-surface-100 md:text-5xl">
            {t('login.heroTitle')}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-surface-400">
            {t('login.heroDesc')}
          </p>
          <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[t('login.feature.thinCards'), t('login.feature.denseList'), t('login.feature.unifiedStatus')].map((item) => (
              <div key={item} className="rounded-lg border border-surface-700 bg-surface-900 px-4 py-3 text-sm font-medium text-surface-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-surface-700 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-surface-100">{t('login.title')}</h2>
            <p className="mt-2 text-sm text-surface-400">{t('login.subtitle')}</p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            onClick={login}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-primary-700 bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            {t('login.button')}
          </button>

          <div className="mt-6 border-t border-surface-700 pt-5">
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <span>{t('login.securedBy')}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
