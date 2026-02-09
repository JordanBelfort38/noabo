import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "User avatar"}
              className="h-14 w-14 rounded-full"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {session.user.name ?? "User"}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {session.user.email}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Session
          </p>
          <pre className="mt-2 overflow-auto text-xs text-zinc-700 dark:text-zinc-300">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
