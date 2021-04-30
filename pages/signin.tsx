// Import Head from 'next/head';
import {Auth, Card} from '@supabase/ui';
import {supabase} from '@/db/supabase';
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

const AuthBasic: React.FC<{error: Error}> = () => {
  const router = useRouter();
  const {session} = Auth.useUser();

  const [authView, setAuthView] = useState('sign_in');
  useEffect(() => {
    const {data: authListener} = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') setAuthView('forgotten_password');
        if (event === 'USER_UPDATED') {
          setTimeout(() => {
            setAuthView('sign_in');
          }, 1000);
        }

        // Send session to /api/auth route to set the auth cookie.
        // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({'Content-Type': 'application/json'}),
          credentials: 'same-origin',
          body: JSON.stringify({event, session})
        })
          .then(async (res) => res.json())
          .then(() => {
            void router.push('/');
          })
          .catch((error) => {
            console.error(error);
          });
      }
    );
    if (session) {
      void fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        credentials: 'same-origin',
        body: JSON.stringify({event: 'SIGN_IN', session})
      })
        .then(async (res) => res.json())
        .then(() => {
          void router.push('/');
        });
    }

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <div className="container mx-auto flex justify-center items-center h-screen">
      <main className="mx-auto max-w-3xl w-full lg:w-10/12 p-5">
        <Card>
          <Auth
            authView={authView}
            supabaseClient={supabase}
            providers={['google', 'github']}
          />
        </Card>
      </main>
    </div>
  );
};

export default AuthBasic;
