import { cookies, headers } from "next/headers";

export async function buildServerRequestContext() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const authorizationHeader = headerStore.get("authorization");
  const accessToken =
    authorizationHeader?.replace(/^Bearer\s+/i, "") ??
    cookieStore.get("access_token")?.value;

  return {
    accessToken,
    cookie: headerStore.get("cookie") ?? cookieStore.toString(),
  };
}
