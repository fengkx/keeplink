import React, {useEffect} from 'react';
import {Layout} from '@/components/Layout';
import {GetServerSideProps} from 'next';
import {supabase} from '@/db/supabase';
import {prisma} from '@/db/prisma';
import type {User as PUser} from '@prisma/client';
import {useForm} from 'react-hook-form';

import styles from '@/styles/Form.module.css';
import {Button} from '@supabase/ui';
import {apiCall} from '@/utils/api-call';
import {useToasts} from 'react-toast-notifications';
import {User} from '@supabase/supabase-js';

type Props = {
  userData: PUser;
  user: User;
};
type FormInput = {
  password?: string;
  password_confirm?: string;
  api_token: string;
};
const defaultSettings = {};

const Settings: React.FC<Props> = ({user, userData}) => {
  const form = useForm<FormInput>({
    defaultValues: {...defaultSettings, api_token: userData.api_token}
  });
  const {register, handleSubmit} = form;
  const toast = useToasts();
  useEffect(() => {
    const {data: authListener} = supabase.auth.onAuthStateChange(
      (event, session) => {
        void fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({'Content-Type': 'application/json'}),
          credentials: 'same-origin',
          body: JSON.stringify({event, session})
        });
      }
    );
    return () => {
      authListener?.unsubscribe();
    };
  }, []);
  const onSubmit = handleSubmit(
    async (data) => {
      const {password, password_confirm, api_token, ...settings} = data;
      if (password || password_confirm) {
        if (password_confirm === password) {
          try {
            const user = supabase.auth.user();
            if (
              process.env.NEXT_PUBLIC_LOCK_ACCOUNT_FRONTEND &&
              user &&
              user.email &&
              process.env.NEXT_PUBLIC_LOCK_ACCOUNT_FRONTEND.includes(user.email)
            ) {
              toast.addToast(
                'This is account is locked cannot change password',
                {appearance: 'info'}
              );
              return;
            }

            await supabase.auth.update({password});
            toast.addToast('Password changed');
          } catch (error) {
            toast.addToast(error.message, {appearance: 'error'});
          }
        } else {
          toast.addToast('Password not the same', {appearance: 'error'});
        }
      }

      if (Object.keys(settings).length > 0 || api_token) {
        try {
          await apiCall('/api/pusers', {
            method: 'PUT',
            body: JSON.stringify({settings, api_token})
          });
          toast.addToast('API Token saved');
        } catch (error) {
          const resp = error.response;
          const data = await resp.json();
          if (data.errors) {
            toast.addToast(data.errors[0].message, {appearance: 'error'});
          } else {
            toast.addToast(error.message, {appearance: 'error'});
          }
        }
      }
    },
    (err) => {
      const message = err.password?.message ?? err.password_confirm?.message;
      if (message) {
        toast.addToast(message);
      }
    }
  );
  return (
    <Layout userRole={user.user_metadata.role}>
      <form onSubmit={onSubmit}>
        <style jsx>{`
          input[type='password'] {
            width: 20em;
          }

          input[name='size'] {
            width: 6rem;
          }
          input[name='api_token'] {
            overflow-wrap: break-word;
            width: 20rem;
          }
        `}</style>
        <div className="flex flex-col max-w-5xl mx-auto w-full">
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            className={styles.input}
            {...register('password')}
            type="password"
            autoComplete="off"
          />
          <label htmlFor="password_confirm" className={styles.label}>
            Password Confirmation
          </label>
          <input
            className={styles.input}
            {...register('password_confirm')}
            type="password"
            autoComplete="off"
          />
          <label className={styles.label}>API Token</label>
          <div className={`${styles.input} border-none`}>
            <input readOnly {...register('api_token')} />
            <Button
              type="link"
              className="mt-2 mt-0 md:ml-4 md:pt-1 md:-mb-1"
              onClick={async (ev) => {
                ev.preventDefault();
                const {data, error} = await supabase.rpc('gen_random_uuid');
                if (error) {
                  toast.addToast(error.message, {appearance: 'error'});
                  return;
                }

                form.setValue('api_token', data![0].gen_random_uuid, {
                  shouldDirty: true
                });
              }}
            >
              RENEW
            </Button>
          </div>
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
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({req}) => {
  const {user} = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {props: {}, redirect: {permanent: false, destination: '/signin'}};
  }

  const userData = await prisma.user.findUnique({
    where: {id: user.id},
    select: {
      id: true,
      role: true,
      settings: true,
      api_token: true
    }
  });
  return {
    props: {userData, user}
  };
};

export default Settings;
