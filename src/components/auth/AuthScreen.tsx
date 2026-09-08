import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Sparkles, AlertCircle, ShieldCheck, Cloud, Laptop, HelpCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginWithApple, loginAsDemo, isFirebaseReady } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
        setIsLoading(false);
        return;
      }
      setErrorMessage(
        !isFirebaseReady
          ? 'Firebase no está configurado aún. Añade tus variables de entorno en Vercel o usa el Modo Demo / Local abajo.'
          : 'Error al iniciar sesión con Google. Comprueba que el dominio esté autorizado en Firebase Console.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithApple();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
        setIsLoading(false);
        return;
      }
      setErrorMessage(
        'El inicio de sesión con Apple requiere configurar tu Services ID en Apple Developer Console y en Firebase. Puedes iniciar con Google o entrar en modo Demo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#080d1a] bg-mesh-light dark:bg-mesh-dark">
      <div className="w-full max-w-md relative">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 select-none">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 shadow-2xl shadow-indigo-500/35 text-white mb-3 transition-transform hover:scale-105 duration-300">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-700 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent">
            StudyFlow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centro de Organización & Estudio Inteligente
          </p>
        </div>

        {/* Main Glass Card */}
        <GlassCard padding="lg" className="shadow-2xl border-white/60 dark:border-white/15 backdrop-blur-2xl">
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Iniciar Sesión en la Nube
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Accede desde cualquier dispositivo y sincroniza tus asignaturas, tareas y exámenes
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3 pt-1">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm shadow-md hover:shadow-lg border border-slate-200/80 dark:border-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              {/* Apple Login Button */}
              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-md hover:shadow-lg border border-black/20 dark:border-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.64-.78 1.08-1.86.96-2.94-1 .04-2.14.65-2.8 1.42-.58.67-1.1 1.77-.96 2.82 1.11.09 2.16-.54 2.8-1.3" />
                </svg>
                <span>Continuar con Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                O también
              </span>
              <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Offline / Demo Login Button */}
            <button
              type="button"
              onClick={loginAsDemo}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Laptop className="w-4 h-4" /> Entrar en Modo Demo / Almacenamiento Local
            </button>

            {/* Security & Cloud Badge */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Datos protegidos en Firestore</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="text-indigo-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Ayuda Vercel
              </button>
            </div>

            {/* Vercel Configuration Guidance Drawer */}
            {showConfigHelp && (
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-2 animate-fade-in">
                <p className="font-bold text-slate-900 dark:text-white">
                  ⚙️ Despliegue en Vercel:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Para activar la autenticación con Google y Apple en producción, añade las variables <code className="text-indigo-500 font-mono">VITE_FIREBASE_*</code> en tu panel de Vercel (Project Settings &rarr; Environment Variables).
                </p>
                <p className="text-[11px] text-slate-400">
                  Tus datos existentes de localStorage se migrarán automáticamente a tu cuenta en la nube sin borrarse.
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};