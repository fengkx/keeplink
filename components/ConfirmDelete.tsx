import {useBoolean} from 'react-use';

export const ConfirmDelete: React.FC<{onDelete: () => void}> = ({onDelete}) => {
  const [isOpen, toggle] = useBoolean(false);
  if (!isOpen) {
    return (
      <a className="cursor-pointer" onClick={toggle}>
        Delete
      </a>
    );
  }

  return (
    <span>
      <a className="mr-1 cursor-pointer" onClick={toggle}>
        Cancel
      </a>
      <a className="cursor-pointer" onClick={onDelete}>
        Confirm
      </a>
    </span>
  );
};
