import { NextResponse } from "next/server";
import { handleBankCallback } from "@/lib/bank-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/bank?error=missing_params", request.url)
    );
  }

  try {
    const { connectionId, accountCount } = await handleBankCallback(code, state);

    return NextResponse.redirect(
      new URL(
        `/dashboard/bank?success=true&connectionId=${connectionId}&accounts=${accountCount}`,
        request.url
      )
    );
  } catch (err) {
    console.error("Bank callback error:", err);
    const message =
      err instanceof Error && err.message === "Invalid or expired state token"
        ? "expired_state"
        : "callback_failed";
    return NextResponse.redirect(
      new URL(`/dashboard/bank?error=${message}`, request.url)
    );
  }
}
