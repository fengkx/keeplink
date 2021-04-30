import {useNow} from '@/utils/useNow';
import {useCallback} from 'react';
import {formatDistance} from 'date-fns';

export const useFormatTime = () => {
  const now = useNow();
  return useCallback((timestamp) => {
    return formatDistance(new Date(timestamp * 1000), now, {addSuffix: true});
  }, []);
};
