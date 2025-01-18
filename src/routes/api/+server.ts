import { json } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';
import jwt from 'jsonwebtoken';

export const GET: RequestHandler = async ({ url }: RequestEvent) => {
  const query = new URLSearchParams(url.search);
  const value = query.get("value");
  const token = jwt.sign({value}, "its a secret to everybody");
  return json(token);
}
