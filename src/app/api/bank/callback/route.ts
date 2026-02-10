import { NextResponse } from "next/server";
import { handleBankCallback } from "@/lib/bank-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Bridge Connect v3 callback params
  const itemId = searchParams.get("item_id") ?? undefined;
  const userUuid = searchParams.get("user_uuid") ?? undefined;
  const success = searchParams.get("success") ?? undefined;
  const state = searchParams.get("state");

  if (!state) {
    return NextResponse.redirect(
      new URL("/dashboard/bank?error=missing_params", request.url)
    );
  }

  // User cancelled or exited the Connect flow
  if (success === "false") {
    const step = searchParams.get("step") ?? "unknown";
    console.log(`Bridge Connect cancelled at step: ${step}`);
    return NextResponse.redirect(
      new URL("/dashboard/bank?error=cancelled", request.url)
    );
  }

  try {
    const { connectionId, accountCount } = await handleBankCallback({
      itemId,
      userUuid,
      success,
      state,
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard/bank?success=true&connectionId=${connectionId}&accounts=${accountCount}`,
        request.url
      )
    );
  } catch (err) {
    console.error("Bank callback error:", err);
    let message = "callback_failed";
    if (err instanceof Error) {
      if (err.message === "Invalid or expired state token") message = "expired_state";
      else if (err.message.includes("not completed")) message = "connection_failed";
    }
    return NextResponse.redirect(
      new URL(`/dashboard/bank?error=${message}`, request.url)
    );
  }
}
