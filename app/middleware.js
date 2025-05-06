import { withIronSessionApiRoute } from "iron-session/next";

export const config = {
  matcher: ['/api/chat'],
};

export function middleware(request) {
  return;
}
