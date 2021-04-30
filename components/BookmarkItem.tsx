import React, {useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import {ConfirmDelete} from '@/components/ConfirmDelete';
import {BookMarkListContext} from '@/components/BookMarkListContext';
import {supabase} from '@/db/supabase';
import {RealtimeSubscription} from '@supabase/supabase-js';
import {BookMark} from '../pages';

export const BookmarkItem: React.FC<{bookmark: BookMark}> = ({bookmark}) => {
  const {onDelete, formatTime} = useContext(BookMarkListContext);
  const [data, setData] = useState(bookmark);
  useEffect(() => {
    setData(bookmark);
  }, [bookmark]);
  useEffect(() => {
    let subscription: RealtimeSubscription;
    if (bookmark.archive_stat === 'pending') {
      subscription = supabase
        .from(`links:id=eq.${bookmark.link_id}`)
        .on('UPDATE', (payload) => {
          console.log(payload);

          setData((bookmark) => {
            bookmark.archive_stat = payload.new.archive_stat;
            bookmark.title = payload.new.title;
            bookmark.description = payload.new.description;
            return bookmark;
          });
        })
        .subscribe();
    }

    return () => {
      if (subscription) {
        void supabase.removeSubscription(subscription);
      }
    };
  }, []);
  return (
    <article className="h-full text-sm sm:text-base p-2 flex justify-between flex-col overflow-hidden">
      <style jsx>{`
        .item-meta li {
          margin-right: 0.75rem;
        }
        .item-tags li:before {
          content: '#';
          display: inline;
          margin-right: 1px;
        }
      `}</style>
      <div className="item-content flex flex-col">
        <div className="item-title font-bold align-middle leading-normal mb-1 whitespace-nowrap overflow-hidden overflow-ellipsis">
          <Link href={data.url}>
            <a className="inline ml-1 text-lg" target="_blank" rel="nofollow">
              {data.title ?? data.url}
            </a>
          </Link>
        </div>
        <p className="item-description overflow-ellipsis whitespace-nowrap overflow-hidden">
          {data.description ?? data.title}
        </p>
      </div>
      {data.tags.length > 0 && (
        <div className="item-tags my-2">
          <ul className="flex items-center">
            {data.tags.map((tag: string) => {
              return (
                <li className="inline-block bg-gray-100 p-0.5 mr-2" key={tag}>
                  <Link href={`/tag/${tag}`}>
                    <a>{tag}</a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="item-meta flex justify-between">
        <ul className="item-meta-info flex items-center">
          <li>{formatTime(data.createdAt as number)}</li>
        </ul>
        <ul className="item-meta-actions flex items-center">
          <li>
            <Link href={`/bookmark/edit/${data.id}`}>
              <a>Edit</a>
            </Link>
          </li>
          <li>
            <ConfirmDelete
              onDelete={() => {
                console.log('delete', bookmark.id);
                onDelete(data.id);
              }}
            />
          </li>
          <li>
            <Link href={`/archive/${data.link_id}`}>
              <a>Archive</a>
            </Link>
          </li>
        </ul>
      </div>
    </article>
  );
};
