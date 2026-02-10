"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";

function NewSubscriptionContent() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <SubscriptionForm mode="create" />
      </div>
    </div>
  );
}

export default function NewSubscriptionPage() {
  return (
    <ProtectedRoute>
      <NewSubscriptionContent />
    </ProtectedRoute>
  );
}
