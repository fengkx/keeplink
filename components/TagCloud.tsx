import styles from '@/components/TagCloud.module.css';
import { Box, ChakraProps } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';

export type Tag = {
  cnt: number;
  tag: string;
};
export type Props = {
  tagList: Tag[];
  className?: string;
} & ChakraProps;
export const TagCloud: React.FC<Props> = ({ tagList, className, ...restProps }) => {
  return (
    <Box as={'div'} className={['tag-cloud', className].join(' ')} {...restProps}>
      {tagList.map(({ tag }) => (
        <Link key={tag} href={`/tag/${tag}`}>
          <a className={styles.tag}>{tag}</a>
        </Link>
      ))}
    </Box>
  );
};
