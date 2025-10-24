import { NextApiResponse, NextPageContext } from "next";
import * as express from "express";
import { setCookie } from "nookies";
type CookieContext =
	| Pick<NextPageContext, "res">
	| {
			res: NextApiResponse;
	  }
	| {
			res: express.Response;
	  }
	| null
	| undefined;
export function handleSetCookie({ ctx, key, value, age, path }: { ctx: CookieContext; key: string; value: string; age?: number; path: string }) {
	setCookie(ctx, key, value, { maxAge: age ? age : 30 * 24 * 60 * 60, path: path });
	return;
}
