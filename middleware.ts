import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token =
        req.cookies.get("next-auth.session-token")?.value ||
        req.cookies.get("__Secure-next-auth.session-token")?.value ||
        req.cookies.get("token")?.value;

    const { pathname } = req.nextUrl;

    const isAuthPage =
        pathname.startsWith("/authentication/signIn") ||
        pathname.startsWith("/authentication/signUp");

    // If logged in & tries to visit auth pages → redirect to dashboard
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL("/pages/dashBoard", req.url));
    }

    // If NOT logged in & tries to visit any non-auth page → redirect to sign in
    if (!isAuthPage && !token) {
        return NextResponse.redirect(new URL("/authentication/signIn", req.url));
    }

    return NextResponse.next();
}

// Apply middleware to ALL routes except static files & API routes
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api).*)",
    ],
};
