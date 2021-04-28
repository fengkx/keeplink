import React, {useEffect} from 'react';
import {Layout} from '@/components/Layout';
import {GetServerSideProps} from 'next';
import {supabase} from '@/db/supabase';
import {prisma} from '@/db/prisma';
import type {User} from '@prisma/client';
import {useForm} from 'react-hook-form';

import styles from '@/styles/Form.module.css';
import {Button} from '@supabase/ui';
import {apiCall} from '@/utils/api-call';
import {useToasts} from 'react-toast-notifications';

type Props = {
  user: User;
};
type FormInput = {
  size: number;
  password?: string;
  password_confirm?: string;
};
const defaultSettings = {
  size: 50
};
const Settings: React.FC<Props> = () => {
  const form = useForm<FormInput>({defaultValues: defaultSettings});
  const {register, handleSubmit} = form;
  const toast = useToasts();
  useEffect(() => {
    console.log(supabase.auth.session());
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
  });
  const onSubmit = handleSubmit(
    async (data) => {
      const {password, password_confirm, ...rest} = data;
      if (password || password_confirm) {
        if (password_confirm === password) {
          try {
            await supabase.auth.update({password});
            toast.addToast('Password changed');
          } catch (error) {
            toast.addToast(error.message, {appearance: 'error'});
          }
        } else {
          toast.addToast('Password not the same', {appearance: 'error'});
        }
      }

      try {
        await apiCall('/api/pusers', {
          method: 'PUT',
          body: JSON.stringify(rest)
        });
        toast.addToast('Settings saved');
      } catch (error) {
        toast.addToast(error.message, {appearance: 'error'});
      }
    },
    (err) => {
      console.error(err);
    }
  );
  return (
    <Layout>
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
          {/* <label className={styles.label}> */}
          {/*    Entries Pre Page */}
          {/* </label> */}
          {/* <input type="number" min="1" className={styles.input} {...register('size', {required: true, valueAsNumber: true, min: 1})} /> */}
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
      settings: true
    }
  });
  return {props: {user: userData}};
};

export default Settings;
