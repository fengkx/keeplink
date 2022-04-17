import React from 'react';
import { Layout } from '@/components/Layout';
import { prisma } from '@/db/prisma';
import { supabase } from '@/db/supabase';
import type { User as PUser } from '@prisma/client';
import { GetServerSideProps } from 'next';

import { User } from '@supabase/supabase-js';
import { Form } from '@/components/Forms/user-settings';

type Props = {
  userData: PUser;
  user: User;
};

const Settings: React.FC<Props> = ({ user, userData }) => {
  return (
    <Layout userRole={user.user_metadata.role}>
      <Form userData={userData} maxW='2xl' mx={'auto'} />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { permanent: false, destination: '/signin' } };
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      role: true,
      settings: true,
      api_token: true,
    },
  });
  return {
    props: { userData, user },
  };
};

export default Settings;
