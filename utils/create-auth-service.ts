import type {
  SupabaseClient,
  UserCredentials,
  VerifyOTPParams,
} from '@supabase/supabase-js';

import type {
  AuthParams,
  AuthOptions,
  User,
  AuthStateChangeCallback,
  AuthProviderProps,
  AuthToken,
} from '@saas-ui/auth';
import { SetRequired } from 'type-fest';

interface RecoveryParams {
  access_token?: string;
  refresh_token?: string;
  expires_in?: string;
  token_type?: string;
  type?: string;
}

const getParams = (): RecoveryParams => {
  const hash = window.location.hash.replace('#', '');
  return hash.split('&').reduce((memo, part) => {
    const [key, value] = part.split('=');
    memo[key] = value;
    return memo;
  }, {} as Record<string, string>);
};

export const createAuthService = (
  supabase: SupabaseClient
): AuthProviderProps => {
  const onLogin = async (params: AuthParams, options?: AuthOptions) => {
    const { user, error } = await supabase.auth.signIn(
      params as UserCredentials,
      options
    );
    console.log(user, error, 123);

    if (user) {
      return user as User;
    }
    if (error) {
      return Promise.reject(error);
    }
  };

  const onSignup = async (params: AuthParams, options?: AuthOptions) => {
    const { email, password, ...data } = params;
    const { user, error } = await supabase.auth.signUp(
      {
        email,
        password,
      },
      {
        data,
        ...options,
      }
    );

    if (user) {
      return user as User;
    }
    if (error) {
      throw error;
    }
  };

  const onVerifyOtp = async (params: VerifyOTPParams) => {
    const { session, error } = await supabase.auth.verifyOTP(params);

    if (session) {
      return !!session;
    }
    if (error) {
      throw error;
    }
  };

  const onLogout = async () => supabase.auth.signOut();

  const onAuthStateChange = (callback: AuthStateChangeCallback) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user as User);
    });

    return () => data?.unsubscribe();
  };

  type TOnLoadUser = SetRequired<AuthProviderProps, 'onLoadUser'>['onLoadUser'];
  const onLoadUser: TOnLoadUser = (() => supabase.auth.user()) as unknown as TOnLoadUser;

  type TOnGetToken = SetRequired<AuthProviderProps, 'onGetToken'>['onGetToken'];
  const onGetToken: TOnGetToken = async () => {
    const session = supabase.auth.session();
    return (session?.access_token as AuthToken) || null;
  };

  const onResetPassword = async ({
    email,
  }: SetRequired<AuthParams, 'email'>) => {
    return supabase.auth.api.resetPasswordForEmail(email);
  };

  const onUpdatePassword = async ({ password }: AuthParams) => {
    const params = getParams() as SetRequired<
      ReturnType<typeof getParams>,
      'access_token'
    >;

    if (params?.type === 'recovery') {
      return supabase.auth.api.updateUser(params.access_token, {
        password,
      });
    }
  };

  return {
    onLogin,
    onSignup,
    onLogout,
    onAuthStateChange,
    onLoadUser,
    onGetToken,
    // @ts-expect-error give away
    onVerifyOtp,
    // @ts-expect-error give away
    onResetPassword,
    // @ts-expect-error give away
    onUpdatePassword,
  };
};
