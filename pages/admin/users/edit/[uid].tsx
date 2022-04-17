import { prisma } from '@/db/prisma';
import { supabase } from '@/db/supabase';
import { getOneParamFromQuery } from '@/utils/query-param';
import type { user_role } from '@prisma/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { GetServerSideProps } from 'next';
import React from 'react';

import { AdminLayout } from '@/components/AdminLayout';
import { Form } from '@/components/Forms/admin-user-edit';

type Props = {
  user: SupabaseUser;
  editedUser: User;
};

export default function EditUser({ user, editedUser }: Props) {

  return (
    <AdminLayout userRole={user.user_metadata.role}>
      <Form mt={10} editedUser={editedUser} />
    </AdminLayout>
  );
}

export type User = {
  id: string;
  provider: string;
  email: string;
  last_sign_in_at: number;
  role: user_role;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  params,
}) => {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {}, redirect: { destination: '/signin', permanent: false } };
  }

  if (user.user_metadata.role !== 'admin') {
    return { props: { user }, redirect: { destination: '/', permanent: false } };
  }

  const uid = getOneParamFromQuery(params!, 'uid');
  const usersData = await prisma.$queryRaw<SupabaseUser[]>`
        SELECT pusers.id, raw_app_meta_data as app_metadata, last_sign_in_at, email, pusers.role
        FROM auth.users
                 LEFT JOIN pusers ON auth.users.id = pusers.id
        WHERE auth.users.id = ${uid}
    `;
  const users: User[] = usersData.map((u: SupabaseUser) => ({
    id: u.id,
    provider: u.app_metadata?.provider ?? '',
    email: u.email!,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    last_sign_in_at: Math.floor(
      new Date(u.last_sign_in_at ?? '1970-01-01 00:00:00').getTime() / 1000,
    ),
    role: u.role as user_role,
  }));
  return {
    props: {
      editedUser: users[0],
      user,
    },
  };
};
