'use client';
import type { TUserSession } from '@/lib/auth/session';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

type SessionContextType =
  | {
      session: TUserSession;
      status: 'authenticated';
      refresh: () => Promise<void>;
    }
  | {
      session: null;
      status: 'loading';
      refresh: () => Promise<void>;
    }
  | {
      session: null;
      status: 'unauthenticated';
      refresh: () => Promise<void>;
    };

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  initialSession?: TUserSession | null;
}

export function SessionProvider({ children, initialSession = null }: SessionProviderProps) {
  const [session, setSession] = useState<TUserSession | null>(initialSession);
  const [status, setStatus] = useState<SessionStatus>(initialSession ? 'authenticated' : 'loading');

  const validateSession = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.session && data.user) {
        setSession({
          session: data.session,
          user: data.user,
        });
        setStatus('authenticated');
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Error validating session:', error);
      setSession(null);
      setStatus('unauthenticated');
    }
  };

  const refresh = async () => {
    await validateSession();
  };

  useEffect(() => {
    // Se não temos sessão inicial, validamos
    if (!initialSession) {
      validateSession();
    }

    // Configurar intervalo de validação (opcional)
    const interval = setInterval(
      () => {
        validateSession();
      },
      5 * 60 * 1000
    ); // Valida a cada 5 minutos

    return () => clearInterval(interval);
  }, [initialSession]);

  const value: SessionContextType = {
    session,
    status,
    refresh,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession({ required = false }: { required?: boolean }): SessionContextType {
  const router = useRouter();
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession deve ser usado dentro de um SessionProvider');
  }
  useEffect(() => {
    if (required && context.status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [context.status, required]);
  return context;
}
