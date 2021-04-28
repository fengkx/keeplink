/* eslint @typescript-eslint/no-empty-function: 0 */
import React from 'react';

export const BookMarkListContext = React.createContext<{
  formatTime: (timestamp: number) => string;
  onDelete: (id: number) => void;
}>({
  onDelete: () => {},
  formatTime: () => ''
});
