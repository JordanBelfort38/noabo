import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <FileQuestion className="h-10 w-10 text-zinc-400" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          404
        </h1>
        <h2 className="mt-2 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
          Page introuvable
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
