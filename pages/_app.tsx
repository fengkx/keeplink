import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import 'tailwindcss/tailwind.css';
import { extendTheme } from '@chakra-ui/react';
import {SaasProvider, AuthProvider} from '@saas-ui/react';
import { createAuthService } from '@/utils/create-auth-service';
import { supabase } from '@/db/supabase';

import '../public/font/work_sans.css';

const theme = extendTheme();

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>KeepLink</title>
        <meta
          name='description'
          content='Simple bookmark Service with tags and archive'
        />
        <meta
          name='og:description'
          content='Simple bookmark Service with tags and archive'
        />
        <meta name='keywords' content='KeepLink,bookmark,archive' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link rel='manifest' href='/site.webmanifest' />
      </Head>
      <SaasProvider theme={theme} >
        <AuthProvider
          {...createAuthService(supabase)}
        >
          <Component {...pageProps} />
        </AuthProvider>
      </SaasProvider>
    </>
  );
};

export default MyApp;
