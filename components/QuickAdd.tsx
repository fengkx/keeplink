import {Button, Input} from '@supabase/ui';
import {Bookmark} from 'react-feather';
import Link from 'next/link';
import React, {useCallback, useState} from 'react';
import {useDebounce} from 'react-use';
import {apiCall} from '@/utils/api-call';
import {useToasts} from 'react-toast-notifications';

type Props = {
  onSuccess: (data: any) => void;
} & React.HTMLAttributes<HTMLInputElement>;
const QuickAdd: React.FC<Props> = ({className, onSuccess}) => {
  const toast = useToasts();
  const [urlInput, setUrlInput] = useState('');
  const [debounceedInput, setDebouncedInput] = useState('');
  const [isReady] = useDebounce(
    () => {
      setDebouncedInput(urlInput);
    },
    500,
    [urlInput]
  );
  const quickAddHandler = useCallback(
    async (ev) => {
      ev.preventDefault();
      if (isReady() !== false) {
        try {
          const resp = await apiCall('/api/bookmarks', {
            method: 'POST',
            body: JSON.stringify({url: debounceedInput})
          });
          const data = await resp.json();
          onSuccess(data);
        } catch (error: any) {
          const {data} = await error.response.json();
          console.log(data);
          toast.addToast(
            <div className="text-lg font-semibold">
              Already existed in
              <Link href={`/bookmark/edit/${data.bookmark_id}`}>
                <a> Here</a>
              </Link>
            </div>,
            {
              appearance: 'error'
            }
          );
        }
      }
    },
    [isReady, debounceedInput]
  );
  return (
    <form onSubmit={quickAddHandler}>
      <Input
        value={urlInput}
        onChange={(v) => {
          setUrlInput(v.target.value);
        }}
        className={className}
        size="small"
        icon={<Bookmark />}
        placeholder="https://"
        actions={[
          <Button key={'quick add'} size="small" onClick={quickAddHandler}>
            Quick Add
          </Button>
        ]}
      />
    </form>
  );
};

export default QuickAdd;
