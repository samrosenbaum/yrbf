export const config = {
    matcher: '/api/chat',
  };
  
  export function middleware(req) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (!forwardedFor) {
      req.headers.set("x-forwarded-for", req.ip ?? "unknown");
    }
  
    return NextResponse.next();
  }
  