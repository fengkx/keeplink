import { Navbar } from '@/components/Navbar';
import { useAutoRefreshToken } from '@/utils/hooks';
import type { user_role } from '@prisma/client';
import Head from 'next/head';

type Props = {
  userRole: user_role;
  title?: string;
};
export const Layout: React.FC<Props> = ({ children, userRole, title }) => {
  useAutoRefreshToken();
  return (
    <div className='container mx-auto mt-4 h-screen'>
      <Head>
        <title>{title ? `${title} | KeepLink` : 'KeepLink'}</title>
      </Head>
      <header>
        <Navbar userRole={userRole} />
      </header>
      <main className='application-main px-3 h-full'>{children}</main>
    </div>
  );
};
