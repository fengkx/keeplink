import React from 'react';
import styles from '@/components/TagCloud.module.css';

export type Tag = {
  cnt: number;
  tag: string;
};
export type Props = {
  tagList: Tag[];
  className?: string;
};
export const TagCloud: React.FC<Props> = ({tagList, className}) => {
  return (
    <div className={['tag-cloud', 'text-sm', className].join(' ')}>
      {tagList.map(({tag}) => (
        <a className={styles.tag} key={tag}>
          {tag}
        </a>
      ))}
    </div>
  );
};
