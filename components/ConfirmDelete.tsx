import React from 'react';
import { useToggle } from '@react-hookz/web';
import { Button } from '@chakra-ui/react';

export const ConfirmDelete: React.FC<{
  onDelete: () => void;
  Component?: React.FC<{onClick: () => void}>;
}> = ({ onDelete, Component }) => {
  const [isOpen, toggle] = useToggle(false);
  if (!isOpen) {
    if (Component) {
      return <Component onClick={toggle} />;
    }

    return (
      <a className='cursor-pointer' onClick={() => toggle()}>
        Delete
      </a>
    );
  }

  return (
    <span>
      <a className='mr-3 cursor-pointer' onClick={() => toggle()}>
        Cancel
      </a>
      <Button color='red.600' onClick={onDelete}>
        Confirm
      </Button>
    </span>
  );
};
