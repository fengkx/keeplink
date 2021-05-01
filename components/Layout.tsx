import {Navbar} from '@/components/Navbar';
import type {user_role} from '@prisma/client';
import Head from 'next/head';

type Props = {
  userRole: user_role;
  title?: string;
};
export const Layout: React.FC<Props> = ({children, userRole, title}) => {
  return (
    <div className="container mx-auto mt-4 h-screen">
      <Head>
        <title>{title ? `${title} | KeepLink` : 'KeepLink'}</title>
        <link href="/font/work_sans.css" rel="stylesheet" />
        <meta
          name="description"
          content="Simple bookmark Service with tags and archive"
        />
        <meta
          name="og:description"
          content="Simple bookmark Service with tags and archive"
        />
        <meta name="keywords" content="KeepLink,bookmark,archive" />
      </Head>
      <header>
        <Navbar userRole={userRole} />
      </header>
      <main className="application-main px-3 h-full">{children}</main>
    </div>
  );
};
