import React, {useEffect} from 'react';
import {supabase} from '@/db/supabase';
import {GetServerSideProps} from 'next';

const Logout: React.FC = () => {
  useEffect(() => {
    supabase.auth
      .signOut()
      .then((res) => {
        console.log(res, 123);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return <div>{}</div>;
};

export const getServerSideProps: GetServerSideProps = async ({res}) => {
  await supabase.auth.signOut();
  res.setHeader('Set-Cookie', 'sb:token=deleted; path=/;maxAge=-1');
  return {
    props: {},
    redirect: {permanent: false, destination: '/'}
  };
};

export default Logout;
