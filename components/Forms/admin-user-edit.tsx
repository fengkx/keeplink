import { apiCall } from '@/utils/api-call';
import { Controller, useForm } from 'react-hook-form';
import {
  useToast,
  Button,
  ChakraProps,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  HStack,
  Radio,
  FormErrorMessage,
} from '@chakra-ui/react';
import type { user_role } from '@prisma/client';
import { User } from '@/pages/admin/users/edit/[uid]';

type Props = { editedUser: User } & ChakraProps;

export function Form({ editedUser, ...restProps }: Props) {
  type FormInput = {
    role: user_role;
  };
  const form = useForm<FormInput>({
    defaultValues: {
      role: editedUser.role,
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;
  const toast = useToast();
  const onSubmit = handleSubmit(
    async (data) => {
      const { role } = data;
      const payload = { role };
      try {
        await apiCall(`/api/users/${editedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Settings saved' });
      } catch (error: any) {
        const data = await error.response.json();
        if (data.errors) {
          toast({ description: data.errors[0].message, status: 'error' });
        } else {
          toast({ description: error.message, status: 'error' });
        }
      }
    },
    (err) => {
      const message = err.role?.message;
      if (message) {
        toast({ description: message });
      }
    }
  );

  return (
    <Stack spacing={8} as="form" onSubmit={onSubmit} {...restProps}>
      <FormControl isInvalid={Boolean(errors.role)}>
        <FormLabel htmlFor="role">Role</FormLabel>
        <Controller
          name='role'
          control={control}
          render={({ field }) => {
            return (
              <RadioGroup
                id='role'
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                value={field.value}
                ref={field.ref}
              >
                <Stack direction='row'>
                  <Radio value='admin'>Admin</Radio>
                  <Radio value='user'>User</Radio>
                </Stack>
              </RadioGroup>
            );
          }}
        />
        <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
      </FormControl>
      <HStack>
        <Button colorScheme='teal' isLoading={isSubmitting} type='submit'>Update</Button>
      </HStack>
    </Stack>
  );
}
