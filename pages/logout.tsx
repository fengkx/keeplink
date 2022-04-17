import { supabase } from '@/db/supabase';
import { noop } from '@/utils/const';
import { useMountEffect } from '@react-hookz/web';
import { GetServerSideProps } from 'next';
import React from 'react';

const Logout: React.FC = () => {
  useMountEffect(() => {
    supabase.auth
      .signOut()
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  });
  return <div>{}</div>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  await supabase.auth.signOut();
  //  @ts-expect-error fix supabase redirect
  res.redirect = noop;
  supabase.auth.api.deleteAuthCookie(req, res, {
    redirectTo: '/login'
  });
  return {
    props: {},
    redirect: { permanent: false, destination: '/' },
  };
};

export default Logout;
