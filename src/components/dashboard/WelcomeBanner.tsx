"use client";

import { Sparkles } from "lucide-react";

interface WelcomeBannerProps {
  userName: string | null | undefined;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const firstName = userName?.split(" ")[0] ?? null;
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-20 top-16 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-200" />
          <span className="text-sm font-medium text-blue-200">No Abo</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1.5 max-w-lg text-sm text-blue-100/90 sm:text-base">
          Votre centre de contrôle des abonnements
        </p>
      </div>
    </div>
  );
}
