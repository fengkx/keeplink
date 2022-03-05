import { apiCall } from '@/utils/api-call';
import { Button, Input } from '@supabase/ui';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { Bookmark } from 'react-feather';
import { useToasts } from 'react-toast-notifications';

type Props = {
  onSuccess: (data: any) => void;
} & React.HTMLAttributes<HTMLInputElement>;
const QuickAdd: React.FC<Props> = ({ className, onSuccess }) => {
  const toast = useToasts();
  const [urlInput, setUrlInput] = useState('');
  const quickAddHandler = useCallback(
    async (ev) => {
      ev.preventDefault();
      try {
        const resp = await apiCall('/api/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ url: urlInput }),
        });
        const data = await resp.json();
        onSuccess(data);
        setUrlInput('');
      } catch (error: any) {
        const { data } = await error.response.json();
        console.log(data);
        if (data.errors) {
          toast.addToast(data.errors[0].message, { appearance: 'error' });
        }

        if (data.bookmark_id) {
          toast.addToast(
            <div className='text-lg font-semibold'>
              Already existed in
              <Link href={`/bookmark/edit/${data.bookmark_id}`}>
                <a>Here</a>
              </Link>
            </div>,
            {
              appearance: 'error',
            },
          );
        }
      }
    },
    [urlInput],
  );
  return (
    <form onSubmit={quickAddHandler}>
      <Input
        value={urlInput}
        onChange={(v) => {
          setUrlInput(v.target.value);
        }}
        className={className}
        size='small'
        icon={<Bookmark />}
        placeholder='https://'
        actions={[
          <Button key={'quick add'} size='small' onClick={quickAddHandler}>
            Quick Add
          </Button>,
        ]}
      />
    </form>
  );
};

export default QuickAdd;
