import { chakra, ChakraProps, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { getOneParamFromQuery } from '@/utils/query-param';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

export function Search(props: ChakraProps) {
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
      path += new URLSearchParams({ q: search }).toString();
    }

    return path;
  }, [search, router]);
  return (
    <chakra.form
      mx={5}
      onSubmit={(ev) => {
        ev.preventDefault();
        void router.push(searchPath);
      }}
      className='pl-2 lg:pl-3 flex items-center flex-1'
      // action={`${router.pathname}` === '/' ? '/bookmark' : router.pathname}
      method='GET'
      {...props}
    >
      <InputGroup size='md' inputMode="search" boxShadow="base" rounded="md" outline={0}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon />
        </InputLeftElement>
        <Input size='md'
          placeholder='Search'
          type="search"
          name='q'
          w='full'
          textAlign="left"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
        />
      </InputGroup>
    </chakra.form>
  );
}
