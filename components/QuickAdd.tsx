import { apiCall } from '@/utils/api-call';
import NextLink from 'next/link';
import React, { useCallback, useState } from 'react';
import {
  Button,
  Link,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  useToast,
} from '@chakra-ui/react';
import { MdOutlineLink } from 'react-icons/md';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const { data, issues } = await error.response.json();
        if (issues) {
          toast({ description: issues[0].message, status: 'error' });
        }

        if (data.bookmark_id) {
          toast({
            description: (
              <div className="text-lg font-semibold">
                Already existed in&nbsp;
                <NextLink href={`/bookmark/edit/${data.bookmark_id}`} passHref>
                  <Link color={'blue.500'}>Here</Link>
                </NextLink>
              </div>
            ),
            status: 'error',
          });
        }
      }
    },
    [urlInput]
  );
  return (
    <form onSubmit={quickAddHandler}>
      <InputGroup size="sm" shadow="xs">
        <InputLeftAddon children={<MdOutlineLink />} />
        <Input
          placeholder="https://"
          value={urlInput}
          onChange={(v) => {
            setUrlInput(v.target.value);
          }}
        />
        <InputRightAddon padding={0}>
          <Button
            type="submit"
            variant="solid"
            size="sm"
            height="100%"
            width="100%"
            rounded={0}
            colorScheme="teal"
            shadow={0}
          >
            Quick Add
          </Button>
        </InputRightAddon>
      </InputGroup>
    </form>
  );
};

export default QuickAdd;
