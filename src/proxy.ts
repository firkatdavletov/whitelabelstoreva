import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createInstallId,
  INSTALL_ID_COOKIE_MAX_AGE,
  INSTALL_ID_COOKIE_NAME,
} from "@/shared/api/install-id";
import {
  DEFAULT_LOCALE,
  getRequestHostnameFromHeaders,
  isSupportedLocale,
  resolveTenantSlugByHostname,
} from "@/shared/config/routing";

export function proxy(request: NextRequest) {
  const existingInstallId =
    request.headers.get("x-install-id") ??
    request.cookies.get(INSTALL_ID_COOKIE_NAME)?.value;

  const requestHeaders = new Headers(request.headers);
  const installId = existingInstallId ?? createInstallId();

  requestHeaders.set("x-install-id", installId);

  const hostname = getRequestHostnameFromHeaders(request.headers);
  const brandedTenantSlug = resolveTenantSlugByHostname(hostname);
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split("/").filter(Boolean);
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (brandedTenantSlug) {
    const localeOnlyPath =
      pathSegments.length > 0 && isSupportedLocale(pathSegments[0]);
    const tenantPrefixedPath =
      pathSegments.length > 1 &&
      pathSegments[0] === brandedTenantSlug &&
      isSupportedLocale(pathSegments[1]);

    if (pathname === "/") {
      const redirectUrl = request.nextUrl.clone();

      redirectUrl.pathname = `/${DEFAULT_LOCALE}`;
      response = NextResponse.redirect(redirectUrl);
    } else if (tenantPrefixedPath) {
      const redirectUrl = request.nextUrl.clone();
      const [, locale, ...restSegments] = pathSegments;

      redirectUrl.pathname = `/${locale}${
        restSegments.length ? `/${restSegments.join("/")}` : ""
      }`;
      response = NextResponse.redirect(redirectUrl);
    } else if (localeOnlyPath) {
      const rewriteUrl = request.nextUrl.clone();
      const [locale, ...restSegments] = pathSegments;

      rewriteUrl.pathname = `/${brandedTenantSlug}/${locale}${
        restSegments.length ? `/${restSegments.join("/")}` : ""
      }`;
      response = NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

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
