import {Input} from '@supabase/ui';
import {Search} from 'react-feather';
import React, {useEffect, useMemo, useState} from 'react';
import styles from '@/components/Navbar.module.css';
import {useRouter} from 'next/router';
import {getOneParamFromQuery} from '@/utils/query-param';

const MainSearch: React.FC<React.HTMLAttributes<HTMLInputElement>> = () => {
  const [search, setSearch] = useState('');
  const router = useRouter();
  useEffect(() => {
    const query = getOneParamFromQuery(router.query, 'q');
    setSearch(query);
  }, []);
  const searchPath = useMemo((): string => {
    let path = `${router.pathname === '/' ? '/bookmark' : router.pathname}`;
    if (search) {
      path += '?';
      path += new URLSearchParams({q: search}).toString();
    }

    return path;
  }, [search, router]);
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        void router.push(searchPath);
      }}
      className="pl-2 lg:pl-3 flex items-center flex-1"
      action={`${router.pathname} === '/` ? '/bookmark' : router.pathname}
      method="GET"
    >
      <div className="relative flex items-center w-full">
        <Search className="absolute" size={'1em'} style={{zIndex: 1000}} />
        <Input
          value={search}
          onChange={(ev) => {
            setSearch(ev.target.value);
          }}
          placeholder="Search"
          size={'small'}
          type="search"
          name="q"
          className={styles.searchInput}
        />
      </div>
    </form>
  );
};

export default MainSearch;
