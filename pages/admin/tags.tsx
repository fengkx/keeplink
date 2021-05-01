import {GetServerSideProps} from 'next';
import {supabase} from '@/db/supabase';
import {User} from '@supabase/supabase-js';
import React, {useCallback} from 'react';
import {apiCall} from '@/utils/api-call';
import useSWR from 'swr';
import type {Tag} from '@prisma/client';
import Link from 'next/link';

import {useRouter} from 'next/router';
import {getPagination} from '@/utils/get-pagination';
import {Pagination} from '@/components/Pagination';
import {AdminLayout} from '@/components/AdminLayout';
import Error from 'next/error';
import 'placeholder-loading/dist/css/placeholder-loading.css';

function useTagList() {
  const router = useRouter();
  const {page, size} = getPagination(router.query);
  const fetcher = useCallback(async (entry) => {
    const resp = await apiCall(entry);
    const data = await resp.json();
    return data as Tag[];
  }, []);

  const {data, error} = useSWR(
    `/api/tags?page=${page}&size=${size}&q=${router.query.q ?? ''}`,
    fetcher
  );
  return {data, error, page, size};
}

const TagsAdmin: React.FC<Props> = ({user}) => {
  const {data, error, page, size} = useTagList();

  if (!data) {
    return (
      <AdminLayout userRole={user.user_metadata.role}>
        {[...Array.from({length: 4}).keys()].map((key) => (
          <div key={key} className="h-1/3 overflow-hidden">
            <div className="ph-picture" />
            <div className="ph-row my-6">
              <div className="ph-col-6 big" />
              <div className="ph-col-4 empty big" />
              <div className="ph-col-2 big" />
              <div className="ph-col-4" />
              <div className="ph-col-8 empty" />
              <div className="ph-col-6" />
              <div className="ph-col-6 empty" />
              <div className="ph-col-12" />
            </div>
          </div>
        ))}
      </AdminLayout>
    );
  }

  if (error) {
    return <Error title={error.message} statusCode={0} />;
  }

  return (
    <AdminLayout userRole={user.user_metadata.role}>
      <ul>
        <style jsx>{`
          .tag {
            min-width: 6em;
            text-align: right;
          }
        `}</style>
        {data.length === 0 && (
          <div className="text-center mt-4 font-semibold text-xl">
            Tags is Empty
          </div>
        )}
        {data.map((tag) => (
          <li key={tag.id} className="py-3.5 border-b">
            <div className="flex leading-10">
              <Link href={`/tag/${tag.tag}`}>
                <a className="inline-block tag font-bold hover:text-brand-800">
                  {tag.tag}
                </a>
              </Link>
              <div className="alias flex justify-between flex-1">
                <div className="ml-4 break-words flex-wrap flex">
                  {tag.alias.map((alias) => (
                    <a
                      className="leading-relaxed bg-gray-100 m-1 px-2 py-1"
                      key={alias}
                    >
                      {alias}
                    </a>
                  ))}
                </div>
                <Link href={`/tag/${tag.tag}/edit`}>
                  <a className="h-full text-brand-300 mr-2">Edit</a>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={page} size={size} currentLen={data.length} />
    </AdminLayout>
  );
};

export default TagsAdmin;
type Props = {
  user: User;
};
export const getServerSideProps: GetServerSideProps = async ({req}) => {
  const {user} = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {props: {}, redirect: {destination: '/signin', permanent: false}};
  }

  if (user.user_metadata.role !== 'admin') {
    return {props: {}, redirect: {destination: '/', permanent: false}};
  }

  return {
    props: {
      user
    }
  };
};
