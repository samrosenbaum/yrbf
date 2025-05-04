import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  console.log("LOG EVENT", body);
  return NextResponse.json({ status: "ok" });
}
