import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  ChakraProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Stack,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { apiCall } from '@/utils/api-call';
import { Controller, useForm } from 'react-hook-form';

import { ConfirmDelete } from '@/components/ConfirmDelete';
import { TagsInput } from '@/components/TagsInput';
import { Tag } from '@prisma/client';

type Props = { tag: Tag } & ChakraProps;
export function Form({ tag, ...restProps }: Props) {
  type FormInput = {
    tag: string;
    alias: string;
  };
  const form = useForm<FormInput>({
    defaultValues: {
      tag: tag?.tag ?? '',
      alias: JSON.stringify(
        tag?.alias.map((item: string) => ({ value: item }))
      ),
    },
  });
  const router = useRouter();
  const toast = useToast();

  const handleApiError = useCallback(async (error: any) => {
    const data = await error.response.json();
    if (data.reason) {
      toast({ description: data.reason, status: 'error' });
    } else if (data.errors) {
      toast({ description: data.errors[0].message, status: 'error' });
    } else {
      toast({ description: error.message, status: 'error' });
    }
  }, []);
  const onDelete = async () => {
    try {
      await apiCall(`/api/tags/${tag!.tag}`, { method: 'DELETE' });
      router.back();
    } catch (error) {
      await handleApiError(error);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;
  const onSubmit = handleSubmit(async (data) => {
    try {
      const alias = JSON.parse(data.alias).map(
        (v: { value: string }) => v.value
      );
      const payload = { tag: data.tag, alias: [...new Set(alias)] };
      await apiCall(`/api/tags/${tag!.tag}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      router.back();
    } catch (error) {
      await handleApiError(error);
    }
  });

  return (
    <Stack as="form" onSubmit={onSubmit} {...restProps}>
      <FormControl isInvalid={Boolean(errors.tag)}>
        <FormLabel htmlFor="tag">Tag</FormLabel>
        <Input id="tag" {...register('tag')} />
        <FormErrorMessage>{errors.tag?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={Boolean(errors.alias)}>
        <FormLabel htmlFor="alias">Alias</FormLabel>
        <Controller
          control={control}
          render={({ field }) => {
            return (
              <TagsInput
                className="mb-8"
                onChange={(ev: { detail: { value: any } }) => {
                  field.onChange(ev.detail.value);
                }}
                onBlur={field.onBlur}
                name={field.name}
                value={field.value}
                settings={{
                  maxTags: 100,
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
          name="alias"
        />
        <FormErrorMessage>{errors.alias?.message}</FormErrorMessage>
      </FormControl>
      <VStack spacing={8}>
        <HStack w="full">
          <Button isLoading={isSubmitting} type="submit" colorScheme={'teal'}>
            Submit
          </Button>
          <Button
            onClick={(event) => {
              event.preventDefault();
              router.back();
            }}
            type="button"
          >
            Cancel
          </Button>
        </HStack>
        <Box w="full">
          <ConfirmDelete
            Component={({ onClick }) => (
              <Button onClick={onClick} colorScheme={'red'}>
                Delete
              </Button>
            )}
            onDelete={onDelete}
          />
        </Box>
      </VStack>
    </Stack>
  );
}
