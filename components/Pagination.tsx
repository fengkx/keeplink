import Link from 'next/link';
import React from 'react';

type Props = {
  page: number;
  size: number;
  currentLen: number;
};
export const Pagination: React.FC<Props> = ({ page, size, currentLen }) => {
  return (
    <div className='flex justify-between mx-16 my-6 text-brand-800 '>
      <Link href={{ query: { page: Math.max(page - 1, 1), size } }}>
        <a className={page < 2 ? 'invisible' : 'inline'}>Prev</a>
      </Link>
      <Link href={{ query: { page: page + 1, size } }}>
        <a className={currentLen < size ? 'invisible' : 'inline'}>Next</a>
      </Link>
    </div>
  );
};
