// Import Head from 'next/head';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { Auth } from '@saas-ui/react';
import {useToast} from '@chakra-ui/react';
import { useMountEffect } from '@react-hookz/web';
import { supabase } from '@/db/supabase';

const AuthBasic: React.FC<{ error: Error }> = () => {
  const router = useRouter();
  const toast = useToast();

  useMountEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Send session to /api/auth route to set the auth cookie.
        // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
        try {
          await fetch('/api/auth', {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/json' }),
            credentials: 'same-origin',
            body: JSON.stringify({ event, session }),
          });
          await router.push('/');
        } catch (err) {
          console.error(err);
        }
      },
    );
    const user = supabase.auth.user();
    if (user) {
      router.push('/');
    }

    return () => {
      authListener?.unsubscribe();
    };
  });
  return (
    <div className='container mx-auto flex justify-center items-center h-screen'>
      <Head>
        <title>Signin | KeepLink</title>
      </Head>
      <main className='mx-auto max-w-3xl w-full lg:w-10/12 p-5'>
        <Auth
          onSuccess={() => router.push('/')}
          onError={err => {
            toast({status: 'error', title: err.name, description: err.message});
          }}
          type="password"
          />
      </main>
    </div>
  );
};

export default AuthBasic;
