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

import styles from '@/styles/Form.module.css';
import '@yaireo/tagify/dist/tagify.css';
import type {Tag} from '@prisma/client';

const Edit: React.FC<Props> = ({bookmark}) => {
  type FormInput = {
    title: string;
    description: string;
    tags: string;
  };
  const form = useForm<FormInput>({
    defaultValues: {
      title: bookmark?.title ?? '',
      description: bookmark?.description ?? '',
      tags: bookmark?.tags.map((t) => t.tag).join(',')
    }
  });
  const router = useRouter();
  const {register, handleSubmit, control} = form;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        tags: JSON.parse(data.tags).map((t: {value: any}) => t.value)
      };
      const resp = await apiCall(`/api/bookmarks/${bookmark?.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      await resp.json();
      router.back();
    } catch (error: any) {
      console.log(error.message);
    }
  });
  if (!bookmark) {
    return <div>Not Found</div>;
  }

  if (bookmark) {
    return (
      <Layout>
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
                  <Tags
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
  }

  return <div>Not Found</div>;
};

type Props = {
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
      description: data.description ?? data.link.description,
      url: data.link.url,
      tags: data.tags.map((t) => ({tag: t.tag.tag, id: t.tag.id}))
    };
    return {
      props: {
        bookmark
      }
    };
  }

  return {
    props: {}
  };
};

export default Edit;
