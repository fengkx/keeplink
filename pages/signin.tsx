// Import Head from 'next/head';
import {Auth, Card} from '@supabase/ui';
import React, {useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import {supabase} from '@/db/supabase';

const AuthBasic: React.FC<{error: Error}> = () => {
  const router = useRouter();
  const {session} = Auth.useUser();

  useEffect(() => {
    const {data: authListener} = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Send session to /api/auth route to set the auth cookie.
        // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
        fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({'Content-Type': 'application/json'}),
          credentials: 'same-origin',
          body: JSON.stringify({event, session}),
        })
          .then(async (res) => res.json())
          .then(() => {
            void router.push('/');
          })
          .catch((error) => {
            console.error(error);
          });
      },
    );
    if (session) {
      void fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({'Content-Type': 'application/json'}),
        credentials: 'same-origin',
        body: JSON.stringify({event: 'SIGN_IN', session}),
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
      <Head>
        <title>Signin | KeepLink</title>
      </Head>
      <main className="mx-auto max-w-3xl w-full lg:w-10/12 p-5">
        <Card>
          <Auth
            supabaseClient={supabase}
            providers={['google', 'github']}
          />
        </Card>
      </main>
    </div>
  );
};

export default AuthBasic;
