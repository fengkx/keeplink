import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const BookMarkListContext = createContext<{
  formatTime: (timestamp: number) => string;
  onDelete: (id: number) => void;
}>({
  onDelete: noop,
  formatTime: () => '',
});
