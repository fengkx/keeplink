import { supabase } from '@/db/supabase';
import { useNow } from '@/utils/useNow';
import { useMountEffect, useLocalStorageValue } from '@react-hookz/web';
import { Session } from '@supabase/supabase-js';
import { formatDistance } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export const useFormatTime = () => {
  const now = useNow();
  return useCallback((timestamp: number) => {
    return formatDistance(new Date(timestamp * 1000), now, { addSuffix: true });
  }, []);
};

export const useAutoRefreshToken = () => {
  const authUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useLocalStorageValue<{expiresAt?: number; currentSession?: Session}>('supabase.auth.token', null);

  const timeoutMillSeconds = useMemo(() => {
    const timeNow = Date.now();
    const expiresAt = (value?.expiresAt ?? 0) * 1000;
    const expiresIn = (value?.currentSession?.expires_in ?? 0) * 1000;
    const refreshAhead = Math.floor(expiresIn * 0.75); // Refresh ahead 3 quarter of the token valid time
    return expiresAt - timeNow - refreshAhead;
  }, [value]);

  const doRefresh = useCallback(async () => {
    const refreshToken = value?.currentSession?.refresh_token;
    if (!refreshToken) {
      throw new Error('No current session.');
    }

    const resp = await fetch(`${authUrl}/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await resp.json();

    const session: Session = { ...data };
    if (session.expires_in) {
      const timeNow = Math.round(Date.now() / 1000);

      session.expires_at = session.expires_in + timeNow;
    }

    fetch('/api/auth', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'same-origin',
      body: JSON.stringify({ event: 'SIGNED_IN', session }),
    }).catch((error) => {
      console.error(error);
    });
    setValue({ currentSession: session, expiresAt: session.expires_at });
  }, [authUrl, value, setValue]);

  useEffect(() => {
    const startRefreshTimer = () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      if (!value || !value.currentSession?.refresh_token) return;
      timer.current = setTimeout(() => {
        void doRefresh();
      }, timeoutMillSeconds);
    };

    startRefreshTimer();
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [value, timeoutMillSeconds]);
};

export function useSyncTokenToCookie() {
  useMountEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        });
      },
    );
    return () => {
      authListener?.unsubscribe();
    };
  });
}
