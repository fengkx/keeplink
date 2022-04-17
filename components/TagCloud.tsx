import { Box, Link, Tag, ChakraProps } from '@chakra-ui/react';
import NextLink from 'next/link';
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
        <NextLink key={tag} href={`/tag/${tag}`} passHref>
          <Tag
            as={Link}
            colorScheme='gray'
            bgColor={'gray.200'}
            size='lg'
            m={1}
            lineHeight={1.5}
            rounded={0}
            whiteSpace='nowrap'
            px={2}
            py={1}
            display='inline-block'
            textDecoration='none'
            _hover={
              {textDecoration: 'none'}
            }
          >
            {tag}
          </Tag>
        </NextLink>
      ))}
    </Box>
  );
};
