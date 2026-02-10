"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";

function EditSubscriptionContent() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/subscriptions/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.subscription) setData(d.subscription);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        Abonnement non trouvé
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <SubscriptionForm
          mode="edit"
          initialData={{
            id: data.id as string,
            merchantName: data.merchantName as string,
            displayName: data.displayName as string | null,
            amount: data.amount as number,
            frequency: data.frequency as string,
            category: data.category as string | null,
            status: data.status as string,
            nextChargeDate: data.nextChargeDate as string | null,
            commitmentEndDate: data.commitmentEndDate as string | null,
            notes: data.notes as string | null,
          }}
        />
      </div>
    </div>
  );
}

export default function EditSubscriptionPage() {
  return (
    <ProtectedRoute>
      <EditSubscriptionContent />
    </ProtectedRoute>
  );
}
