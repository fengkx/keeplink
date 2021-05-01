import React from 'react';
import {Layout} from '@/components/Layout';
import {GetServerSideProps} from 'next';
import {supabase} from '@/db/supabase';
import {prisma} from '@/db/prisma';
import {Button} from '@supabase/ui';
import {Controller, useForm} from 'react-hook-form';
import {apiCall} from '@/utils/api-call';
import {useRouter} from 'next/router';
import {decode as decodeHtml} from 'he';
import {User} from '@supabase/supabase-js';
import {useToasts} from 'react-toast-notifications';
import Error from 'next/error';
import {TagsInput} from '@/components/TagsInput';
import type {Tag} from '@prisma/client';

import styles from '@/styles/Form.module.css';

const Edit: React.FC<Props> = ({bookmark, user}) => {
  type FormInput = {
    title: string;
    description: string;
    tags: string;
  };
  const form = useForm<FormInput>({
    defaultValues: {
      title: bookmark?.title ?? '',
      description: bookmark?.description ?? '',
      tags: JSON.stringify(bookmark?.tags.map((t) => t.tag))
    }
  });
  const router = useRouter();
  const toast = useToasts();
  const {register, handleSubmit, control} = form;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        tags: Array.isArray(data.tags)
          ? data.tags
          : JSON.parse(data.tags || '[]').map((t: {value: any} | string) =>
              typeof t === 'string' ? t : t.value
            )
      };
      console.log(payload);
      await apiCall(`/api/bookmarks/${bookmark?.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      router.back();
    } catch (error: any) {
      toast.addToast(error.message, {appearance: 'error'});
    }
  });
  if (!bookmark) {
    return <Error statusCode={404} />;
  }

  return (
    <Layout userRole={user.user_metadata.role}>
      <form
        onSubmit={onSubmit}
        className="form flex flex-col h-96 justify-between"
      >
        <div className="flex flex-col max-w-5xl mx-auto w-full">
          <div className={styles.label}>URL</div>
          <p className={`${styles.input} bg-gray-100`} id="url">
            {bookmark.url}
          </p>
          <label htmlFor="title" className={styles.label}>
            Title
          </label>
          <input className={styles.input} {...register('title')} />
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            className={`h-28 ${styles.input}`}
            {...register('description')}
          />
          <label htmlFor="tags" className={styles.label}>
            Tags
          </label>
          <Controller
            control={control}
            render={({field}) => {
              return (
                <TagsInput
                  onChange={(ev: {detail: {value: any}}) => {
                    field.onChange(ev.detail.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  value={field.value}
                  className={styles.input}
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
            name="tags"
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
};

type Props = {
  user: User;
  bookmark?: {
    id: number;
    user_id: string;
    link_id: number;
    createdAt: number;
    title: string | null;
    description: string | null;
    url: string;
    tags: Array<Partial<Tag>>;
  };
};
type Query = {
  id: string;
};
export const getServerSideProps: GetServerSideProps<Props, Query> = async ({
  req,
  params
}) => {
  const {user} = await supabase.auth.api.getUserByCookie(req);
  const id = Number.parseInt(params!.id, 10);
  if (!user) {
    return {props: {}, redirect: {destination: '/signin', permanent: false}};
  }

  const data = await prisma.bookmark.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      user_id: true,
      link_id: true,
      title: true,
      description: true,
      createdAt: true,
      link: {
        select: {
          title: true,
          url: true,
          description: true
        }
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              tag: true
            }
          }
        }
      }
    }
  });
  if (data) {
    const bookmark = {
      id: data.id,
      user_id: data.user_id,
      link_id: data.link_id,
      createdAt: data.createdAt.getTime() / 1000,
      title: data.title ?? data.link.title,
      description: decodeHtml(data.description ?? data.link.description ?? ''),
      url: data.link.url,
      tags: data.tags.map((t) => ({tag: t.tag.tag, id: t.tag.id}))
    };
    return {
      props: {
        user,
        bookmark
      }
    };
  }

  return {
    props: {user}
  };
};

export default Edit;
