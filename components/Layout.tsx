import { useAutoRefreshToken } from '@/utils/hooks';
import type { user_role } from '@prisma/client';
import Head from 'next/head';
import { Header } from './Header';
import { NavBar } from './Header/NavBar';

type Props = {
  userRole: user_role;
  title?: string;
};
export const Layout: React.FC<Props> = ({ children, userRole, title }) => {
  useAutoRefreshToken();
  return (
    <div>
      <Head>
        <title>{title ? `${title} | KeepLink` : 'KeepLink'}</title>
      </Head>
      <Header>
        <NavBar userRole={userRole} />
      </Header>
      <main className='application-main px-3 h-full'>{children}</main>
    </div>
  );
};
