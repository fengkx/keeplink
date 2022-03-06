import { Button, ChakraProps, FormControl, FormLabel, HStack, Input, InputGroup, InputRightAddon, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { apiCall } from '@/utils/api-call';
import { useSyncTokenToCookie } from '@/utils/hooks';
import { supabase } from '@/db/supabase';
import type { User as PUser } from '@prisma/client';

type FormProps = {userData: PUser} & ChakraProps;

export function Form({userData, ...restProps}: FormProps) {
  useSyncTokenToCookie();
  const toast = useToast();
  type FormInput = {
    password?: string;
    password_confirm?: string;
    api_token: string;
  };
  const defaultSettings = {};
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
} = useForm<FormInput>({
    defaultValues: { ...defaultSettings, api_token: userData.api_token },
  });

  const onSubmit = handleSubmit(
    async (data) => {
      const { password, password_confirm: passwordConfirm, api_token: apiToken, ...settings } = data;
      if (password || passwordConfirm) {
        if (passwordConfirm === password) {
          try {
            const user = supabase.auth.user();
            if (
              process.env.NEXT_PUBLIC_LOCK_ACCOUNT_FRONTEND
              && user
              && user.email
              && process.env.NEXT_PUBLIC_LOCK_ACCOUNT_FRONTEND.includes(user.email)
            ) {
              toast(
                { status: 'info', title: 'This is account is locked cannot change password' },
              );
              return;
            }

            await supabase.auth.update({ password });
            toast({ title: 'Password changed' });
          } catch (error: any) {
            toast({ description: error.message, status: 'error' });
          }
        } else {
          toast({ title: 'Password not the same', status: 'error' });
        }
      }

      if (Object.keys(settings).length > 0 || apiToken) {
        try {
          await apiCall('/api/pusers', {
            method: 'PUT',
            body: JSON.stringify({ settings, api_token: apiToken }),
          });
          toast({ title: 'API Token saved' });
        } catch (error: any) {
          const resp = error.response;
          const data = await resp.json();
          if (data.issues) {
            toast({ status: 'error', description: data.issues[0].message });
          } else {
            toast({ description: error.message, status: 'error' });
          }
        }
      }
    },
    (err) => {
      const message = err.password?.message ?? err.password_confirm?.message;
      if (message) {
        toast({ title: message });
      }
    },
  );

  return (
    <Stack spacing={6} as='form' onSubmit={onSubmit} {...restProps}>
      <FormControl isInvalid={Boolean(errors.password)}>
        <FormLabel htmlFor='password'>Password</FormLabel>
        <Input id='password' {...register('password')} autoComplete='off' />
      </FormControl>
      <FormControl isInvalid={Boolean(errors.password_confirm)}>
        <FormLabel htmlFor='password_confirm'>Password Confirmation</FormLabel>
        <Input id='password_confirm' type='password' {...register('password_confirm')} autoComplete='off' />
      </FormControl>
      <FormControl isInvalid={Boolean(errors.api_token)}>
        <FormLabel htmlFor='api_token'>API Token</FormLabel>
        <InputGroup>
        <Input id='api_token' readOnly type='text' {...register('api_token')} />
        <InputRightAddon padding={0}>
          <Button onClick={async (ev) => {
                ev.preventDefault();
                const { data, error } = await supabase.rpc<string>('gen_random_uuid');

                if (error) {
                  toast({ description: error.message, status: 'error' });
                  return;
                }

                // @ts-expect-error @supabase/supabase-js 1.30.7 return data as non array value
                setValue('api_token', data, {
                  shouldDirty: true,
                });
              }}>Refresh</Button>
        </InputRightAddon>
        </InputGroup>
      </FormControl>
      <HStack>
        <Button type='submit' isLoading={isSubmitting}>Update</Button>
      </HStack>
    </Stack>
  );

}
