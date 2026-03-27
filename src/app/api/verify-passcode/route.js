import { NextResponse } from "next/server";

export async function POST(request) {
  const { passcode } = await request.json();
  const valid = passcode === process.env.ADMIN_PASSCODE;
  return NextResponse.json({ valid });
}
