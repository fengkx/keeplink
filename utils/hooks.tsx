import {useNow} from '@/utils/useNow';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import {formatDistance} from 'date-fns';
import {useLocalStorage} from 'react-use';

export const useFormatTime = () => {
  const now = useNow();
  return useCallback((timestamp) => {
    return formatDistance(new Date(timestamp * 1000), now, {addSuffix: true});
  }, []);
};

export const useAutoRefreshToken = () => {
  const authUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [value, setValue] = useLocalStorage('supabase.auth.token', undefined, {
    raw: false,
    serializer: JSON.stringify,
    deserializer: JSON.parse
  });

  const timeoutMillSeconds = useMemo(() => {
    const timeNow = Date.now();
    const expiresAt = (value?.expiresAt ?? 0) * 1000;
    return expiresAt - timeNow - 60 * 1000; // Refresh 1 minutes ahead
  }, [value]);

  const doRefresh = useCallback(async () => {
    const {refresh_token} = value.currentSession;
    if (!refresh_token) {
      throw new Error('No current session.');
    }

    try {
      const resp = await fetch(`${authUrl}/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        },
        body: JSON.stringify({refresh_token})
      });
      const data = await resp.json();

      const session = {...data};
      if (session.expires_in) {
        const timeNow = Math.round(Date.now() / 1000);

        session.expires_at = Number.parseInt(session.expires_in, 10) + timeNow;
      }

      fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        credentials: 'same-origin',
        body: JSON.stringify({event: 'SIGNED_IN', session})
      }).catch((error) => {
        console.error(error);
      });
      setValue({currentSession: session, expiresAt: session.expires_at});
    } catch (error) {
      throw error;
    }
  }, [authUrl, value, setValue]);

  useEffect(() => {
    const startRefreshTimer = () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      if (!value || !value.currentSession.refresh_token) return;
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
