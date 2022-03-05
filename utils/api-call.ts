export async function apiCall(
  entryPoint: string,
  init?: RequestInit,
): Promise<Response> {
  const isServer = typeof window === 'undefined';
  const url = isServer
    ? `${process.env.BASE_URL ?? 'http://localhost:3000'}${entryPoint}`
    : entryPoint;
  const resp = await fetch(url, {
    headers: {
      'content-type': 'application/json',
    },
    ...init,
  });
  if (resp.status === 404) {
    throw new Error('404');
  }

  if (!resp.ok) {
    const err: any = new Error('APIError');
    err.response = resp;
    throw err;
  }

  return resp;
}
