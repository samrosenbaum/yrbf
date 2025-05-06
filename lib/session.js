import { getIronSession } from "iron-session";

const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "chat-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function getSession(req) {
  return getIronSession(req, sessionOptions);
}
