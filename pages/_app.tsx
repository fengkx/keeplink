import {supabase} from '@/db/supabase';
import {Auth} from '@supabase/ui';
import 'tailwindcss/tailwind.css';
import React from 'react';
import {ToastProvider} from 'react-toast-notifications';
import type {AppProps} from 'next/app';

const MyApp: React.FC<AppProps> = ({Component, pageProps}) => {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <ToastProvider placement={'top-center'} autoDismiss={true}>
        <Component {...pageProps} />
      </ToastProvider>
    </Auth.UserContextProvider>
  );
};

export default MyApp;
