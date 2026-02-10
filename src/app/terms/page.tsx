import Link from "next/link";

export const metadata = {
  title: "Conditions d'utilisation — No Abo",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <article className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Conditions générales d&apos;utilisation
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Dernière mise à jour : février 2026
          </p>
        </header>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            1. Objet
          </h2>
          <p>
            Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;accès et
            l&apos;utilisation du service No Abo, une plateforme de gestion d&apos;abonnements
            permettant aux utilisateurs de suivre, gérer et résilier leurs abonnements récurrents.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            2. Description du service
          </h2>
          <p>No Abo propose les fonctionnalités suivantes :</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Connexion sécurisée à vos comptes bancaires via des API agréées</li>
            <li>Détection automatique des abonnements récurrents</li>
            <li>Suivi et catégorisation de vos abonnements</li>
            <li>Alertes et notifications sur vos dépenses récurrentes</li>
            <li>Aide à la résiliation d&apos;abonnements</li>
          </ul>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            3. Inscription et compte utilisateur
          </h2>
          <p>
            Pour utiliser No Abo, vous devez créer un compte en fournissant des informations exactes
            et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion
            et de toute activité effectuée sous votre compte.
          </p>
          <p>
            Vous devez être âgé d&apos;au moins 18 ans pour utiliser ce service.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            4. Obligations de l&apos;utilisateur
          </h2>
          <p>En utilisant No Abo, vous vous engagez à :</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Fournir des informations exactes et à jour</li>
            <li>Ne pas utiliser le service à des fins illicites</li>
            <li>Ne pas tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
            <li>Ne pas perturber le fonctionnement du service</li>
            <li>Respecter les droits de propriété intellectuelle</li>
          </ul>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            5. Protection des données
          </h2>
          <p>
            La collecte et le traitement de vos données personnelles sont régis par notre{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              politique de confidentialité
            </Link>
            . En utilisant No Abo, vous acceptez cette politique.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            6. Responsabilité
          </h2>
          <p>
            No Abo s&apos;efforce de fournir un service fiable et sécurisé. Toutefois, nous ne
            pouvons garantir l&apos;absence d&apos;interruptions ou d&apos;erreurs. Le service est
            fourni &quot;en l&apos;état&quot;.
          </p>
          <p>
            No Abo ne saurait être tenu responsable des décisions financières prises par
            l&apos;utilisateur sur la base des informations fournies par le service.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            7. Résiliation
          </h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis votre page de profil. La
            suppression entraîne l&apos;effacement définitif de toutes vos données conformément à
            notre politique de confidentialité.
          </p>
          <p>
            Nous nous réservons le droit de suspendre ou de supprimer un compte en cas de violation
            des présentes CGU.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            8. Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des éléments du service No Abo (textes, images, logos, logiciels) sont
            protégés par le droit de la propriété intellectuelle. Toute reproduction ou utilisation
            non autorisée est interdite.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            9. Droit applicable
          </h2>
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige relatif à
            l&apos;utilisation du service sera soumis aux tribunaux compétents de Paris.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            10. Contact
          </h2>
          <p>
            Pour toute question relative aux présentes CGU, contactez-nous à :{" "}
            <a
              href="mailto:contact@no-abo.fr"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              contact@no-abo.fr
            </a>
          </p>
        </section>

        <div className="pt-4">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </article>
    </div>
  );
}
