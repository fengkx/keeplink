import { apiCall } from '@/utils/api-call';
import { Button, Input } from '@supabase/ui';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { Bookmark } from 'react-feather';
import { useToast } from '@chakra-ui/react';

type Props = {
  onSuccess: (data: any) => void;
} & React.HTMLAttributes<HTMLInputElement>;
const QuickAdd: React.FC<Props> = ({ className, onSuccess }) => {
  const toast = useToast();
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
          toast({ description: data.errors[0].message, status: 'error' });
        }

        if (data.bookmark_id) {
          toast(
            {
              description: () => (
                <div className='text-lg font-semibold'>
                  Already existed in
                  <Link href={`/bookmark/edit/${data.bookmark_id}`}>
                    <a>Here</a>
                  </Link>
                </div>
              ),
              status: 'error',
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
