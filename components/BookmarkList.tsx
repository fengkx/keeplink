import React, {useCallback} from 'react';
import {BookMark} from '../pages';
import {useNow} from '../utils/useNow';
import {formatDistance} from 'date-fns';
import {BookMarkListContext} from '@/components/BookMarkListContext';
import {BookmarkItem} from '@/components/BookmarkItem';

type Props = {
  bookmarks: BookMark[];
  onDelete: (id: number) => void;
  className?: string;
};
export const BookmarkList: React.FC<Props> = ({
  bookmarks,
  onDelete,
  className
}) => {
  const now = useNow();
  const formatTime = useCallback((timestamp) => {
    return formatDistance(new Date(timestamp * 1000), now, {addSuffix: true});
  }, []);
  const deleteHandler = useCallback(
    async (id: number) => {
      const resp = await fetch(`/api/bookmarks/${id}`, {method: 'DELETE'});
      if (resp.ok) {
        onDelete(id);
      }
    },
    [onDelete]
  );
  return (
    <BookMarkListContext.Provider value={{formatTime, onDelete: deleteHandler}}>
      <ul className={['bookmark-list', className].join(' ')}>
        {bookmarks.map((bookmark) => {
          return (
            <li key={bookmark.id} className="mb-6 border h-36">
              <BookmarkItem bookmark={bookmark} />
            </li>
          );
        })}
      </ul>
    </BookMarkListContext.Provider>
  );
};
