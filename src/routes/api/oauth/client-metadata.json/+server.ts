import type { RequestHandler } from './$types';
import { ctx } from '$lib/server/context';
import { createOAuthClient } from '$lib/server/oauth';

export const GET: RequestHandler = async (event) => {
  const { env, store } = ctx(event);
  const client = await createOAuthClient(env, store);
  return Response.json(client.clientMetadata, { headers: { 'Cache-Control': 'no-store' } });
};
