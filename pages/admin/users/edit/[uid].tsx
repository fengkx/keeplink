import React from 'react';
import {GetServerSideProps} from 'next';
import {prisma} from '@/db/prisma';
import type {User as SupabaseUser} from '@supabase/supabase-js';
import type {user_role} from '@prisma/client';
import {getOneParamFromQuery} from '@/utils/query-param';
import {useForm} from 'react-hook-form';
import {useToasts} from 'react-toast-notifications';
import {apiCall} from '@/utils/api-call';
import {supabase} from '@/db/supabase';
import {Button} from '@supabase/ui';

import styles from '@/styles/Form.module.css';
import {AdminLayout} from '@/components/AdminLayout';

type FormInput = {
  role: user_role;
};
type Props = {
  user: SupabaseUser;
  editedUser: User;
};

export default function EditUser({user, editedUser}: Props) {
  const form = useForm<FormInput>({
    defaultValues: {
      role: editedUser.role
    }
  });
  const {register, handleSubmit} = form;
  const toast = useToasts();
  const onSubmit = handleSubmit(
    async (data) => {
      const {role} = data;
      const payload = {role};
      try {
        await apiCall(`/api/users/${editedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        toast.addToast('Settings saved');
      } catch (error) {
        toast.addToast(error.message, {appearance: 'error'});
      }
    },
    (err) => {
      const message = err.role?.message;
      if (message) {
        toast.addToast(message);
      }
    }
  );
  return (
    <AdminLayout userRole={user.user_metadata.role}>
      <form onSubmit={onSubmit}>
        <style jsx>{`
          input[type='password'] {
            width: 20em;
          }

          input[name='size'] {
            width: 6rem;
          }
        `}</style>
        <div className="flex flex-col max-w-5xl mx-auto w-full">
          <label className={styles.label}>Role</label>
          <select {...register('role')} className={`${styles.input} w-32`}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <div>
            <Button
              size={'medium'}
              type="primary"
              className="mr-2"
              role="submit"
            >
              Update
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

type User = {
  id: string;
  provider: string;
  email: string;
  last_sign_in_at: number;
  role: user_role;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  params
}) => {
  const {user} = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {props: {}, redirect: {destination: '/signin', permanent: false}};
  }

  if (user.user_metadata.role !== 'admin') {
    return {props: {user}, redirect: {destination: '/', permanent: false}};
  }

  const uid = getOneParamFromQuery(params!, 'uid');
  const usersData = await prisma.$queryRaw`
        SELECT pusers.id, raw_app_meta_data as app_metadata, last_sign_in_at, email, pusers.role
        FROM auth.users
                 LEFT JOIN pusers ON auth.users.id = pusers.id
        WHERE auth.users.id = ${uid}
    `;
  const users: User[] = usersData.map((u: Partial<SupabaseUser>) => ({
    id: u.id,
    provider: u.app_metadata?.provider,
    email: u.email,
    last_sign_in_at: Math.floor(
      new Date(u.last_sign_in_at ?? '1970-01-01 00:00:00').getTime() / 1000
    ),
    role: u.role
  }));
  return {
    props: {
      editedUser: users[0],
      user
    }
  };
};
