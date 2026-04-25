import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "blackroad-os-web",
    status: "ok"
  });
}
