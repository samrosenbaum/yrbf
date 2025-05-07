import { kv } from "./kv";

export async function getSession(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  let messages = await kv.get(ip);
  if (!messages) {
    messages = [];
  }

  return {
    messages,
    save: async () => {
      await kv.set(ip, messages);
    },
  };
}
