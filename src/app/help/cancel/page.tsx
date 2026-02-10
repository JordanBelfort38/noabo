"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  FileText,
  ArrowRight,
  Scissors,
} from "lucide-react";

import { Input } from "@/components/ui/input";

interface TemplateSummary {
  id: string;
  merchantName: string;
  displayName: string;
  category: string;
  difficulty: string;
  onlineUrl: string | null;
  requiresCall: boolean;
  requiresLetter: boolean;
  noticeRequired: number | null;
  lawReference: string | null;
  contractType: string | null;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  EASY: { label: "Facile", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50", dot: "bg-emerald-500" },
  MEDIUM: { label: "Moyen", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800/50", dot: "bg-orange-500" },
  HARD: { label: "Difficile", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800/50", dot: "bg-red-500" },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; gradient: string }> = {
  streaming: { label: "Streaming", icon: "🎬", gradient: "from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10" },
  software: { label: "Logiciels", icon: "💻", gradient: "from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10" },
  telecom: { label: "Télécom", icon: "📱", gradient: "from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10" },
  health: { label: "Sport & Santé", icon: "💪", gradient: "from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10" },
  insurance: { label: "Assurance", icon: "🛡️", gradient: "from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10" },
  housing: { label: "Logement", icon: "🏠", gradient: "from-teal-50 to-green-50 dark:from-teal-900/10 dark:to-green-900/10" },
};

const CATEGORIES = ["all", "streaming", "software", "telecom", "health", "insurance", "housing"];

export default function CancelLibraryPage() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/cancellation/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filtered = useMemo(() => {
    let result = templates;
    if (category !== "all") {
      result = result.filter((t) => t.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.merchantName.toLowerCase().includes(q) ||
          t.displayName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [templates, category, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Hero */}
      <div className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-6">
          <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" />
            Tableau de bord
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
              <Scissors className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Guides de{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                  résiliation
                </span>
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {templates.length} services avec guides de résiliation détaillés
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un service (Netflix, Free, Orange...)"
              className="rounded-xl border-zinc-200 bg-zinc-50 pl-11 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          {/* Category filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    category === cat
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat === "all" ? "Tous" : `${cfg?.icon ?? ""} ${cfg?.label ?? cat}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <Search className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500">Aucun service trouvé pour cette recherche.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tpl) => {
              const diff = DIFFICULTY_CONFIG[tpl.difficulty] ?? DIFFICULTY_CONFIG.MEDIUM;
              const catCfg = CATEGORY_CONFIG[tpl.category];
              const methods: { icon: typeof Globe; label: string }[] = [];
              if (tpl.onlineUrl) methods.push({ icon: Globe, label: "En ligne" });
              if (tpl.requiresCall) methods.push({ icon: Phone, label: "Téléphone" });
              if (tpl.requiresLetter) methods.push({ icon: FileText, label: "Courrier" });
              if (methods.length === 0) methods.push({ icon: Mail, label: "E-mail" });

              return (
                <Link
                  key={tpl.id}
                  href={`/help/cancel/${encodeURIComponent(tpl.merchantName)}`}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  {/* Category gradient overlay */}
                  {catCfg && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${catCfg.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  )}

                  <div className="relative">
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-800">
                        {catCfg?.icon ?? "📋"}
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${diff.color} ${diff.bg} ${diff.border}`}>
                        <span className={`h-1 w-1 rounded-full ${diff.dot}`} />
                        {diff.label}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {tpl.displayName}
                    </h3>

                    {/* Methods */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {methods.map((m) => (
                        <span key={m.label} className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                          <m.icon className="h-3 w-3" />
                          {m.label}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between">
                      {tpl.noticeRequired ? (
                        <span className="text-[10px] text-zinc-400">Préavis {tpl.noticeRequired}j</span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">Sans préavis</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:text-blue-400">
                        Voir le guide
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
