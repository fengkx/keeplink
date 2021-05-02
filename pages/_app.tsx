import {supabase} from '@/db/supabase';
import {Auth} from '@supabase/ui';
import 'tailwindcss/tailwind.css';
import React from 'react';
import {ToastProvider} from 'react-toast-notifications';
import type {AppProps} from 'next/app';
import Head from 'next/head';

const MyApp: React.FC<AppProps> = ({Component, pageProps}) => {
  return (
    <>
      <Head>
        <title>KeepLink</title>
        <link href="/font/work_sans.css" rel="stylesheet" />
        <meta
          name="description"
          content="Simple bookmark Service with tags and archive"
        />
        <meta
          name="og:description"
          content="Simple bookmark Service with tags and archive"
        />
        <meta name="keywords" content="KeepLink,bookmark,archive" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Auth.UserContextProvider supabaseClient={supabase}>
        <ToastProvider placement={'top-center'} autoDismiss={true}>
          <Component {...pageProps} />
        </ToastProvider>
      </Auth.UserContextProvider>
    </>
  );
};

export default MyApp;
