import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createInstallId,
  INSTALL_ID_COOKIE_MAX_AGE,
  INSTALL_ID_COOKIE_NAME,
} from "@/shared/api/install-id";

export function proxy(request: NextRequest) {
  const existingInstallId =
    request.headers.get("x-install-id") ??
    request.cookies.get(INSTALL_ID_COOKIE_NAME)?.value;

  const requestHeaders = new Headers(request.headers);
  const installId = existingInstallId ?? createInstallId();

  requestHeaders.set("x-install-id", installId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!existingInstallId) {
    response.cookies.set(INSTALL_ID_COOKIE_NAME, installId, {
      maxAge: INSTALL_ID_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
