import {Layout} from '@/components/Layout';
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
    return <div>Loading</div>;
  }
  if(error) {
    return <div>Error</div>
  }

  return (
    <Layout userRole={user.user_metadata.role}>
      <div className="max-w-4xl mx-auto">
        <ul>
          <style jsx>{`
            .tag {
              min-width: 6em;
              text-align: right;
            }
          `}</style>
          {(data ?? []).map((tag) => (
            <li key={tag.id} className="py-3.5 border-b">
              <div className="flex">
                <Link href={`/tag/${tag.tag}`}>
                  <a className="inline-block tag font-bold hover:text-brand-800">
                    {tag.tag}
                  </a>
                </Link>
                <div className="alias flex justify-between flex-1">
                  <div className="ml-4">
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
        <div className="flex justify-between mx-16 my-6 text-brand-800 ">
          <Link href={{query: {page: Math.max(page - 1, 1), size}}}>
            <a className={page < 2 ? 'invisible' : 'inline'}>Prev</a>
          </Link>
          <Link href={{query: {page: page + 1, size}}}>
            <a className={data.length < size ? 'invisible' : 'inline'}>Next</a>
          </Link>
        </div>
      </div>
    </Layout>
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
      user,
    }
  };
};
