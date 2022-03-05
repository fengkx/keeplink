import { Layout } from '@/components/Layout';
import type { user_role } from '@prisma/client';
import Link from 'next/link';
import React from 'react';

type Props = {
  userRole: user_role;
};
export const AdminLayout: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  userRole,
}) => {
  return (
    <Layout userRole={userRole}>
      <div className='max-w-4xl mx-auto text-brand-800 mb-2 border-b pb-4 sm:pb-6 px-8'>
        <Link href='/admin/users'>
          <a className='mr-8'>Users</a>
        </Link>
        <Link href='/admin/tags'>
          <a>Tags</a>
        </Link>
      </div>
      <div className='max-w-4xl mx-auto'>{children}</div>
    </Layout>
  );
};
