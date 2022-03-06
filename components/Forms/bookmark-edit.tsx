import { Controller, useForm } from 'react-hook-form';
import {
  Button,
  ChakraProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { TagsInput } from '@/components/TagsInput';
import { Props } from '@/pages/bookmark/edit/[id]';
import { useRouter } from 'next/router';
import { apiCall } from '@/utils/api-call';
import { SetRequired } from 'type-fest';

export function Form({
  bookmark,
  ...restProps
}: Omit<SetRequired<Props, 'bookmark'>, 'user'> & ChakraProps) {

  const router = useRouter();
  const toast = useToast();

  type FormInput = {
    title: string;
    description: string;
    tags: string;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    defaultValues: {
      title: bookmark?.title ?? '',
      description: bookmark?.description ?? '',
      tags: JSON.stringify(bookmark?.tags.map((t) => t.tag)),
    },
  });
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        tags: Array.isArray(data.tags)
          ? data.tags
          : JSON.parse(data.tags || '[]').map((t: { value: any } | string) => (typeof t === 'string' ? t : t.value)),
      };
      console.log(payload);
      await apiCall(`/api/bookmarks/${bookmark?.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      router.back();
    } catch (error: any) {
      const data = await error.response.json();
      toast({ status: 'error', description: data.message });
    }
  });

  return (
    <Stack spacing={6} h='full' align='center' as="form" onSubmit={onSubmit} {...restProps}>
      <FormControl isReadOnly>
        <FormLabel htmlFor="url">URL</FormLabel>
        <Input value={bookmark?.url} readOnly bg="gray.200" />
      </FormControl>
      <FormControl isInvalid={Boolean(errors.title)}>
        <FormLabel htmlFor="title">Title</FormLabel>
        <Input
          id="title"
          placeholder="title"
          {...register('title', {
            required: 'Title is required',
          })}
        />
        <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={Boolean(errors.description)}>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Textarea
          id='description'
          placeholder="Description"
          resize="vertical"
          {...register('description')}
        />
      </FormControl>
      <FormControl isInvalid={Boolean(errors.tags)}>
        <FormLabel htmlFor="tags">Tags</FormLabel>
        <Controller
          control={control}
          render={({ field }) => {
            return (
              <TagsInput
                onChange={(ev: { detail: { value: any } }) => {
                  field.onChange(ev.detail.value);
                }}
                onBlur={field.onBlur}
                name={field.name}
                value={field.value}
                settings={{
                  maxTags: 5,
                  whitelist: [],
                  dropdown: {
                    caseSensitive: true,
                    maxItems: 20,
                    enabled: 0,
                  },
                  placeholder: 'Add Tags',
                }}
              />
            );
          }}
          name="tags"
        />
      </FormControl>
      <HStack spacing={6}>
        <Button
          colorScheme='teal'
          isLoading={isSubmitting}
          type="submit"
        >
          Submit
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            router.back();
          }}
        >
          Cancel
        </Button>
      </HStack>
    </Stack>
  );
}
