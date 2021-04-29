import {Input} from '@supabase/ui';
import {Search} from 'react-feather';
import React, {useMemo, useState} from 'react';
import styles from '@/components/Navbar.module.css';
import {useRouter} from 'next/router';
import {getOneParamFromQuery} from '@/utils/query-param';

const MainSearch: React.FC<React.HTMLAttributes<HTMLInputElement>> = () => {
  const [serach, setSearch] = useState('');
  const router = useRouter();
  const searchDefault = useMemo(() => {
    const query = getOneParamFromQuery(router.query, 'q');
    return query ?? '';
  }, []);
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        void router.push(
          `${router.pathname} === '/` ? '/bookmark' : router.pathname,
          {query: {q: 'css'}}
        );
      }}
      className="pl-2 lg:pl-3 flex items-center flex-1"
      action={`${router.pathname} === '/` ? '/bookmark' : router.pathname}
      method="GET"
    >
      <div className="relative flex items-center w-full">
        <Search className="absolute" size={'1rem'} style={{zIndex: 1000}} />
        <Input
          value={serach}
          onChange={(ev) => {
            setSearch(ev.target.value);
          }}
          placeholder="Search"
          size={'small'}
          type="search"
          name="q"
          className={styles.searchInput}
          defaultValue={searchDefault}
        />
      </div>
    </form>
  );
};

export default MainSearch;
