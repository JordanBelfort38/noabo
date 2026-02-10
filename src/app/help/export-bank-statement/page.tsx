import Link from "next/link";

export const metadata = {
  title: "Comment exporter mon relevé bancaire — No Abo",
};

export default function ExportBankStatementPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <article className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Comment exporter mon relevé bancaire ?
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Guide pas à pas pour les principales banques françaises
          </p>
        </header>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            BNP Paribas
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Connectez-vous à votre espace client sur <strong>mabanque.bnpparibas</strong></li>
            <li>Allez dans <strong>Mes comptes</strong> → sélectionnez votre compte courant</li>
            <li>Cliquez sur <strong>Télécharger</strong> (icône de téléchargement)</li>
            <li>Choisissez le format <strong>CSV</strong> et la période souhaitée</li>
            <li>Cliquez sur <strong>Télécharger</strong></li>
            <li>Importez le fichier .csv dans No Abo</li>
          </ol>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Crédit Agricole
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Connectez-vous sur <strong>www.credit-agricole.fr</strong></li>
            <li>Allez dans <strong>Mes comptes</strong> → <strong>Historique des opérations</strong></li>
            <li>Sélectionnez la période souhaitée</li>
            <li>Cliquez sur <strong>Exporter</strong> → choisissez <strong>CSV</strong></li>
            <li>Enregistrez le fichier et importez-le dans No Abo</li>
          </ol>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Société Générale
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Connectez-vous sur <strong>particuliers.sg.fr</strong></li>
            <li>Allez dans <strong>Mes comptes</strong> → sélectionnez le compte</li>
            <li>Cliquez sur <strong>Exporter les opérations</strong></li>
            <li>Choisissez le format <strong>CSV</strong> ou <strong>OFX</strong></li>
            <li>Téléchargez et importez dans No Abo</li>
          </ol>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Boursorama Banque
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Connectez-vous sur <strong>clients.boursorama.com</strong></li>
            <li>Allez dans <strong>Mon compte</strong> → <strong>Historique</strong></li>
            <li>Cliquez sur <strong>Exporter</strong> en haut à droite</li>
            <li>Sélectionnez le format <strong>CSV</strong> et la période</li>
            <li>Téléchargez et importez dans No Abo</li>
          </ol>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            N26
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Ouvrez l&apos;application N26 ou connectez-vous sur <strong>app.n26.com</strong></li>
            <li>Allez dans <strong>Mon compte</strong> → <strong>Relevés</strong></li>
            <li>Cliquez sur <strong>Télécharger CSV</strong></li>
            <li>Sélectionnez la période souhaitée</li>
            <li>Importez le fichier dans No Abo</li>
          </ol>
        </section>

        <section className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Formats supportés
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li><strong>CSV</strong> — Format le plus courant, supporté par toutes les banques</li>
            <li><strong>OFX/QIF</strong> — Format standard international (Open Financial Exchange)</li>
            <li><strong>PDF</strong> — Relevés bancaires en PDF (extraction automatique)</li>
          </ul>
          <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">
            Taille maximale : 10 Mo par fichier. Nous recommandons le format CSV pour une meilleure précision.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                Mon format n&apos;est pas reconnu, que faire ?
              </h3>
              <p className="mt-1 text-sm">
                Essayez d&apos;exporter au format CSV avec le séparateur point-virgule (;).
                Si le problème persiste, contactez-nous à{" "}
                <a href="mailto:support@no-abo.fr" className="text-blue-600 hover:underline dark:text-blue-400">
                  support@no-abo.fr
                </a>.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                Mes données sont-elles sécurisées ?
              </h3>
              <p className="mt-1 text-sm">
                Oui. Vos fichiers sont traités côté serveur et ne sont jamais stockés.
                Seules les transactions extraites sont enregistrées dans votre compte.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                Puis-je importer plusieurs fichiers ?
              </h3>
              <p className="mt-1 text-sm">
                Oui, vous pouvez importer autant de fichiers que nécessaire.
                Les doublons sont automatiquement détectés et ignorés.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <Link
            href="/dashboard/bank/connect"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Importer un relevé
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </article>
    </div>
  );
}
