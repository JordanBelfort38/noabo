import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité — No Abo",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <article className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Dernière mise à jour : février 2026
          </p>
        </header>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            1. Introduction
          </h2>
          <p>
            No Abo (&quot;nous&quot;, &quot;notre&quot;, &quot;nos&quot;) s&apos;engage à protéger
            la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment
            nous collectons, utilisons, stockons et protégeons vos données personnelles conformément
            au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et
            Libertés.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            2. Données collectées
          </h2>
          <p>Nous collectons les données suivantes :</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Données d&apos;identification :</strong> nom, adresse e-mail, mot de passe
              (chiffré)
            </li>
            <li>
              <strong>Données bancaires :</strong> connexions bancaires via des API sécurisées
              (tokens chiffrés AES-256), transactions pour la détection d&apos;abonnements
            </li>
            <li>
              <strong>Données d&apos;utilisation :</strong> journaux de connexion, préférences
              utilisateur
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            3. Finalités du traitement
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Création et gestion de votre compte utilisateur</li>
            <li>Détection automatique de vos abonnements récurrents</li>
            <li>Suivi et gestion de vos abonnements</li>
            <li>Envoi de notifications et alertes (avec votre consentement)</li>
            <li>Amélioration de nos services</li>
          </ul>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            4. Base légale
          </h2>
          <p>Le traitement de vos données repose sur :</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Votre consentement</strong> (article 6.1.a du RGPD) pour la création de
              compte et la connexion bancaire
            </li>
            <li>
              <strong>L&apos;exécution du contrat</strong> (article 6.1.b) pour la fourniture du
              service
            </li>
            <li>
              <strong>Notre intérêt légitime</strong> (article 6.1.f) pour l&apos;amélioration du
              service et la sécurité
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            5. Durée de conservation
          </h2>
          <p>
            Vos données sont conservées pendant la durée de votre utilisation du service. En cas de
            suppression de compte, toutes vos données sont effacées sous 30 jours. Les données
            bancaires (tokens) sont supprimées immédiatement.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            6. Vos droits
          </h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Droit d&apos;accès :</strong> obtenir une copie de vos données personnelles
            </li>
            <li>
              <strong>Droit de rectification :</strong> corriger vos données inexactes
            </li>
            <li>
              <strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> recevoir vos données dans un format
              structuré
            </li>
            <li>
              <strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données
            </li>
            <li>
              <strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout
              moment
            </li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à :{" "}
            <a
              href="mailto:privacy@no-abo.fr"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              privacy@no-abo.fr
            </a>
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            7. Sécurité
          </h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
            protéger vos données : chiffrement AES-256 pour les données sensibles, hachage bcrypt
            pour les mots de passe, connexions HTTPS, et limitation du taux de requêtes.
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            8. Contact
          </h2>
          <p>
            Pour toute question relative à cette politique de confidentialité, vous pouvez nous
            contacter à :{" "}
            <a
              href="mailto:contact@no-abo.fr"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              contact@no-abo.fr
            </a>
          </p>
          <p>
            Vous pouvez également introduire une réclamation auprès de la CNIL :{" "}
            <a
              href="https://www.cnil.fr"
              className="text-blue-600 hover:underline dark:text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.cnil.fr
            </a>
          </p>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        {/* English version */}
        <header>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Privacy Policy</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Last updated: February 2026</p>
        </header>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">1. Introduction</h2>
          <p>
            No Abo (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting user
            privacy. This privacy policy explains how we collect, use, store, and protect your
            personal data in compliance with the General Data Protection Regulation (GDPR).
          </p>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">2. Data Collected</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Identification data:</strong> name, email address, encrypted password</li>
            <li><strong>Banking data:</strong> bank connections via secure APIs (AES-256 encrypted tokens), transactions for subscription detection</li>
            <li><strong>Usage data:</strong> connection logs, user preferences</li>
          </ul>
        </section>

        <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">3. Your Rights</h2>
          <p>Under the GDPR, you have the right to access, rectify, erase, port, and object to the processing of your personal data. Contact us at{" "}
            <a href="mailto:privacy@no-abo.fr" className="text-blue-600 hover:underline dark:text-blue-400">privacy@no-abo.fr</a>.
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
