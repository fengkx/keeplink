import {useBoolean} from 'react-use';
import React from 'react';

export const ConfirmDelete: React.FC<{
  onDelete: () => void;
  Component?: React.FC<any>;
}> = ({onDelete, Component}) => {
  const [isOpen, toggle] = useBoolean(false);
  if (!isOpen) {
    if (Component) {
      return <Component onClick={toggle} />;
    }

    return (
      <a className="cursor-pointer" onClick={toggle}>
        Delete
      </a>
    );
  }

  return (
    <span>
      <a className="mr-3 cursor-pointer" onClick={toggle}>
        Cancel
      </a>
      <a className="cursor-pointer text-red-600" onClick={onDelete}>
        Confirm
      </a>
    </span>
  );
};
