import React, { useCallback } from 'react';
import { BookMark } from '../pages';

import { BookmarkItem } from '@/components/BookmarkItem';
import { BookMarkListContext } from '@/components/BookMarkListContext';
import { useFormatTime } from '@/utils/hooks';

type Props = {
  bookmarks: BookMark[];
  onDelete: (id: number) => void;
  className?: string;
};
export const BookmarkList: React.FC<Props> = ({
  bookmarks,
  onDelete,
  className,
}) => {
  const formatTime = useFormatTime();
  const deleteHandler = useCallback(
    async (id: number) => {
      const resp = await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        onDelete(id);
      }
    },
    [onDelete],
  );
  if (bookmarks.length <= 0) {
    return (
      <div className='text-center font-semibold text-3xl flex justify-center items-center mt-4 text-gray-600'>
        <p>No bookmark found</p>
      </div>
    );
  }

  return (
    <BookMarkListContext.Provider value={{ formatTime, onDelete: deleteHandler }}>
      <ul className={['bookmark-list', className].join(' ')}>
        {bookmarks.map((bookmark) => {
          return (
            <li key={bookmark.id} className='mb-6 border h-36'>
              <BookmarkItem bookmark={bookmark} />
            </li>
          );
        })}
      </ul>
    </BookMarkListContext.Provider>
  );
};
