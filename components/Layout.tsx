import {Navbar} from '@/components/Navbar';
import type {user_role} from '@prisma/client';
import Head from "next/head";

type Props = {
  userRole: user_role;
};
export const Layout: React.FC<Props> = ({children, userRole}) => {
  return (
    <div className="container mx-auto mt-4 h-screen">
        <Head>
            <title>KeepLink</title>
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="/font/work_sans.css" rel="stylesheet" />
        </Head>
      <header>
        <Navbar className="mb-10" userRole={userRole} />
      </header>
      <main className="application-main px-3 h-full">{children}</main>
    </div>
  );
};
