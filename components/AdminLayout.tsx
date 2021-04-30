import React from 'react';
import Link from 'next/link';
import {Layout} from '@/components/Layout';
import type {user_role} from '@prisma/client';

type Props = {
  userRole: user_role;
};
export const AdminLayout: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  userRole
}) => {
  return (
    <Layout userRole={userRole}>
      <div className="max-w-4xl mx-auto text-brand-800 mb-2 border-b pb-6 px-8">
        <Link href="/admin/users">
          <a className="mr-8">Users</a>
        </Link>
        <Link href="/admin/tags">
          <a>Tags</a>
        </Link>
      </div>
      <div className="max-w-4xl mx-auto">{children}</div>
    </Layout>
  );
};