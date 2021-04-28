import {Button, Input} from '@supabase/ui';
import {Search} from 'react-feather';
import React from 'react';

const MainSearch: React.FC<React.HTMLAttributes<HTMLInputElement>> = ({
  className,
  style
}) => {
  return (
    <Input
      className={className}
      style={style}
      icon={<Search />}
      placeholder="Search bookmark"
      actions={[<Button>Search</Button>]}
    />
  );
};

export default MainSearch;
