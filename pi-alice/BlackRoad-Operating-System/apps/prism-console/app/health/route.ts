import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "blackroad-os-prism-console",
    status: "ok"
  });
}
