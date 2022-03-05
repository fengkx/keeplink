import useSWR from 'swr';

export function useNow(): Date {
  const { data } = useSWR('now', () => new Date(), {
    refreshInterval: 1000,
    dedupingInterval: 1000,
  });
  return data ?? new Date();
}
