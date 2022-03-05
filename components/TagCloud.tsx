import styles from '@/components/TagCloud.module.css';
import Link from 'next/link';
import React from 'react';

export type Tag = {
  cnt: number;
  tag: string;
};
export type Props = {
  tagList: Tag[];
  className?: string;
};
export const TagCloud: React.FC<Props> = ({ tagList, className }) => {
  return (
    <div className={['tag-cloud', 'text-sm', className].join(' ')}>
      {tagList.map(({ tag }) => (
        <Link key={tag} href={`/tag/${tag}`}>
          <a className={styles.tag}>{tag}</a>
        </Link>
      ))}
    </div>
  );
};
