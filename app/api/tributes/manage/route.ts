import { NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";
import { requestTributeEditLink } from "@/lib/tribute-edit";

export async function POST(request: Request) {
  const formData = await request.formData();
  const rateKey = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown-tribute-manage";
  const rateLimit = applyRateLimit(`tribute-manage:${rateKey}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "If a matching tribute exists, an editing link has been sent to that email address." },
      { status: 202 },
    );
  }

  const email = String(formData.get("email") || "");
  if (email) {
    await requestTributeEditLink(email);
  }

  return NextResponse.json(
    { message: "If a matching tribute exists, an editing link has been sent to that email address." },
    { status: 202 },
  );
}
