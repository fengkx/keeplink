import React from 'react';
import {Layout} from '@/components/Layout';
import {GetServerSideProps} from 'next';
import {supabase} from '@/db/supabase';
import {prisma} from '@/db/prisma';
import {Button} from '@supabase/ui';
import {Controller, useForm} from 'react-hook-form';
import {apiCall} from '@/utils/api-call';
import {useRouter} from 'next/router';

// @ts-expect-error
import Tags from '@yaireo/tagify/dist/react.tagify';
import '@yaireo/tagify/dist/tagify.css';

import styles from '@/styles/Form.module.css';
import type {Tag} from '@prisma/client';
import {User} from '@supabase/supabase-js';
import {useToasts} from 'react-toast-notifications';

const Edit: React.FC<Props> = ({tag, user}) => {
  type FormInput = {
    tag: string;
    alias: string;
  };
  const form = useForm<FormInput>({
    defaultValues: {
      tag: tag?.tag ?? '',
      alias: JSON.stringify(tag?.alias.map((item: string) => ({value: item})))
    }
  });
  const router = useRouter();
  const toast = useToasts();
  const {register, handleSubmit, control} = form;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const alias = JSON.parse(data.alias).map((v: {value: string}) => v.value);
      const payload = {tag: data.tag, alias};
      await apiCall(`/api/tags/${tag!.tag}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      router.back();
    } catch (error) {
      toast.addToast(error.message, {appearance: 'error'});
    }
  });
  if (!tag) {
    return <div>Not Found</div>;
  }

  if (tag) {
    return (
      <Layout userRole={user.user_metadata.role}>
        <form
          onSubmit={onSubmit}
          className="form flex flex-col h-96 justify-between min-h-screen"
        >
          <div className="flex flex-col max-w-5xl mx-auto w-full">
            <label htmlFor="tag" className={styles.label}>
              Tag
            </label>
            <input className={styles.input} {...register('tag')} />
            <label htmlFor="alias" className={styles.label}>
              Alias Names
            </label>
            <Controller
              control={control}
              render={({field}) => {
                return (
                  <Tags
                    className="mb-8"
                    onChange={(ev: {detail: {value: any}}) => {
                      field.onChange(ev.detail.value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    value={field.value}
                    settings={{
                      maxTags: 5,
                      whitelist: ['111', '222'],
                      dropdown: {
                        maxItems: 20,
                        enabled: 0
                      },
                      placeholder: 'Add Tags'
                    }}
                  />
                );
              }}
              name="alias"
            />
            <div>
              <Button type="primary" className="mr-2" role="submit">
                Submit
              </Button>
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  router.back();
                }}
                type="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Layout>
    );
  }

  return <div>Not Found</div>;
};

type Props = {
  user: User;
  tag?: Tag;
};
type Query = {
  id: string;
};
export const getServerSideProps: GetServerSideProps<Props, Query> = async (
  ctx
) => {
  const {req, query} = ctx;
  const {user} = await supabase.auth.api.getUserByCookie(req);
  const tagName = Array.isArray(query.tagName)
    ? query.tagName[0]
    : query.tagName;
  if (!user) {
    return {props: {}, redirect: {destination: '/signin', permanent: false}};
  }

  const tag = await prisma.tag.findUnique({
    where: {
      tag: tagName
    }
  });
  if (tag) {
    return {
      props: {
        user,
        tag
      }
    };
  }

  return {
    props: {user}
  };
};

export default Edit;
