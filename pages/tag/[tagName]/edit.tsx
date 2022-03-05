import { Layout } from '@/components/Layout';
import { prisma } from '@/db/prisma';
import { supabase } from '@/db/supabase';
import { apiCall } from '@/utils/api-call';
import { Button } from '@supabase/ui';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ConfirmDelete } from '@/components/ConfirmDelete';
import { TagsInput } from '@/components/TagsInput';
import styles from '@/styles/Form.module.css';
import type { Tag } from '@prisma/client';
import { User } from '@supabase/supabase-js';
import Error from 'next/error';
import { useToast } from '@chakra-ui/react';

const Edit: React.FC<Props> = ({ tag, user }) => {
  type FormInput = {
    tag: string;
    alias: string;
  };
  const form = useForm<FormInput>({
    defaultValues: {
      tag: tag?.tag ?? '',
      alias: JSON.stringify(tag?.alias.map((item: string) => ({ value: item }))),
    },
  });
  const router = useRouter();
  const toast = useToast();
  const handleApiError = useCallback(async (error) => {
    const data = await error.response.json();
    if (data.reason) {
      toast({ description: data.reason, status: 'error' });
    } else if (data.errors) {
      toast({ description: data.errors[0].message, status: 'error' });
    } else {
      toast({ description: error.message, status: 'error' });
    }
  }, []);
  const onDelete = async () => {
    try {
      await apiCall(`/api/tags/${tag!.tag}`, { method: 'DELETE' });
      router.back();
    } catch (error) {
      await handleApiError(error);
    }
  };

  const { register, handleSubmit, control } = form;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const alias = JSON.parse(data.alias).map((v: { value: string }) => v.value);
      const payload = { tag: data.tag, alias: [...new Set(alias)] };
      await apiCall(`/api/tags/${tag!.tag}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      router.back();
    } catch (error) {
      await handleApiError(error);
    }
  });
  if (!tag) {
    return <Error statusCode={404} />;
  }

  return (
    <Layout userRole={user.user_metadata.role}>
      <form
        onSubmit={onSubmit}
        className='form flex flex-col h-96 justify-between min-h-screen'
      >
        <div className='flex flex-col max-w-5xl mx-auto w-full'>
          <label htmlFor='tag' className={styles.label}>
            Tag
          </label>
          <input className={styles.input} {...register('tag')} />
          <label htmlFor='alias' className={styles.label}>
            Alias Names
          </label>
          <Controller
            control={control}
            render={({ field }) => {
              return (
                <TagsInput
                  className='mb-8'
                  onChange={(ev: { detail: { value: any } }) => {
                    field.onChange(ev.detail.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  value={field.value}
                  settings={{
                    maxTags: 100,
                    dropdown: {
                      caseSensitive: true,
                      maxItems: 20,
                      enabled: 0,
                    },
                    placeholder: 'Add Tags',
                  }}
                />
              );
            }}
            name='alias'
          />
          <div>
            <Button type='primary' className='mr-2' role='submit'>
              Submit
            </Button>
            <Button
              className='mr-8'
              onClick={(event) => {
                event.preventDefault();
                router.back();
              }}
              type='secondary'
            >
              Cancel
            </Button>
            <ConfirmDelete
              Component={({ onClick }) => (
                <Button
                  onClick={onClick}
                  type='primary'
                  danger={true}
                  className='mr-2'
                >
                  Delete
                </Button>
              )}
              onDelete={onDelete}
            />
          </div>
        </div>
      </form>
    </Layout>
  );
};

type Props = {
  user: User;
  tag?: Tag;
};
type Query = {
  id: string;
};
export const getServerSideProps: GetServerSideProps<Props, Query> = async (
  ctx,
) => {
  const { req, query } = ctx;
  const { user } = await supabase.auth.api.getUserByCookie(req);
  const tagName = Array.isArray(query.tagName)
    ? query.tagName[0]
    : query.tagName;
  if (!user) {
    return { props: {}, redirect: { destination: '/signin', permanent: false } };
  }

  const tag = await prisma.tag.findUnique({
    where: {
      tag: tagName,
    },
  });
  if (tag) {
    return {
      props: {
        user,
        tag,
      },
    };
  }

  return {
    props: { user },
  };
};

export default Edit;
