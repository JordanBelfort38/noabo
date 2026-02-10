import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  TrendingDown,
  Bell,
  Shield,
  ChevronRight,
  ChevronDown,
  BarChart3,
  FileText,
  Zap,
  Eye,
  Scissors,
  PiggyBank,
  ArrowRight,
  CheckCircle2,
  Check,
  Star,
} from "lucide-react";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative isolate px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:px-8">
        {/* Background gradient */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <Zap className="h-3.5 w-3.5" />
            100% gratuit — Aucun abonnement requis
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl dark:text-white">
            Vos abonnements vous coûtent{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              plus que vous ne le pensez
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl dark:text-zinc-400">
            Les Français dépensent en moyenne <strong className="text-zinc-900 dark:text-white">49&nbsp;€/mois</strong> en
            abonnements mais pensent n&apos;en dépenser que 31,50&nbsp;€.
            No&nbsp;Abo détecte, analyse et résilie vos abonnements inutiles.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#comment-ca-marche"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-8 py-4 text-base font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:-translate-y-0.5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Voir comment ça marche
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
            Aucune carte bancaire requise — Données chiffrées AES-256 — Conforme RGPD
          </p>
        </div>

        {/* Bottom gradient */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-cyan-400 to-blue-600 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <AnimatedCounter
            value={49}
            suffix="€/mois"
            label="dépensés en abonnements numériques"
            source="BearingPoint 2025"
          />
          <AnimatedCounter
            value={40}
            suffix="%"
            label="des Français paient des abonnements inutilisés"
            source="Ipsos / Papernest"
          />
          <AnimatedCounter
            value={550}
            suffix="€/an"
            label="d'économies possibles en moyenne"
            source="Meilleurtaux"
          />
          <AnimatedCounter
            value={10}
            suffix=""
            label="abonnements en moyenne par Français"
            source="Ipsos 2024"
          />
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
              Le problème
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              L&apos;abonnement : le piège de la surconsommation
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Les dépenses pré-engagées représentent <strong>30,4% du revenu disponible</strong> des
              ménages français — plus du double depuis 1959.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Problem Card 1 */}
            <div className="group relative rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900 dark:hover:shadow-red-900/20">
              <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-950 dark:text-red-400">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Vous ne voyez pas tout
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                <strong>35% des Français</strong> ne peuvent pas lister leurs abonnements et
                leurs coûts mensuels. Les prélèvements passent inaperçus.
              </p>
            </div>

            {/* Problem Card 2 */}
            <div className="group relative rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900 dark:hover:shadow-red-900/20">
              <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-950 dark:text-red-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Vous payez pour rien
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                <strong>15% des abonnements payés</strong> sont des « abonnements fantômes »,
                des services que vous n&apos;utilisez jamais mais qui continuent de vous facturer.
              </p>
            </div>

            {/* Problem Card 3 */}
            <div className="group relative rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-red-200 hover:shadow-lg hover:shadow-red-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900 dark:hover:shadow-red-900/20">
              <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-950 dark:text-red-400">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Résilier est un cauchemar
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                <strong>47% des Français</strong> se sont déjà sentis « piégés » par un
                abonnement. Procédures complexes, numéros surtaxés, lettres recommandées...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative overflow-hidden bg-zinc-950 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              La solution
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              No Abo : votre copilote anti-abonnements
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Une plateforme tout-en-un pour voir, comprendre et agir sur vos dépenses récurrentes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <SolutionCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Tableau de bord clair"
              description="Visualisez tous vos abonnements, leurs coûts et leur évolution en un coup d'œil."
            />
            <SolutionCard
              icon={<Zap className="h-6 w-6" />}
              title="Détection automatique"
              description="Notre algorithme identifie vos abonnements dans vos relevés bancaires automatiquement."
            />
            <SolutionCard
              icon={<FileText className="h-6 w-6" />}
              title="Résiliation guidée"
              description="Lettres pré-rédigées, guides étape par étape, et suivi de vos demandes de résiliation."
            />
            <SolutionCard
              icon={<Bell className="h-6 w-6" />}
              title="Alertes intelligentes"
              description="Soyez prévenu avant chaque renouvellement et fin d'engagement."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="comment-ca-marche" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Simple et rapide
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Reprenez le contrôle en 3 étapes simples, en moins de 5 minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <StepCard
              number="1"
              title="Connectez vos comptes"
              description="Reliez vos banques en toute sécurité ou importez vos relevés (CSV, PDF, OFX). Vos données sont chiffrées de bout en bout."
              features={[
                "Compatible avec toutes les banques françaises",
                "Import CSV, PDF, OFX",
                "Chiffrement AES-256",
              ]}
            />
            <StepCard
              number="2"
              title="Détectez vos abonnements"
              description="Notre algorithme analyse vos transactions et identifie automatiquement tous vos abonnements récurrents."
              features={[
                "Détection intelligente",
                "Catégorisation automatique",
                "Calcul des coûts annuels",
              ]}
            />
            <StepCard
              number="3"
              title="Économisez"
              description="Résiliez les abonnements inutiles grâce à nos guides, lettres pré-rédigées et suivi personnalisé."
              features={[
                "Lettres de résiliation prêtes",
                "Guides étape par étape",
                "Suivi des demandes",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y border-zinc-200 bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Fonctionnalités
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Tout ce dont vous avez besoin
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<TrendingDown className="h-5 w-5" />}
              title="Calcul des économies"
              description="Voyez exactement combien vous pouvez économiser en résiliant vos abonnements superflus."
            />
            <FeatureCard
              icon={<PiggyBank className="h-5 w-5" />}
              title="Budget mensuel"
              description="Suivez l'évolution de vos dépenses récurrentes mois après mois avec des graphiques clairs."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Sécurité maximale"
              description="Chiffrement AES-256, connexions bancaires sécurisées, conformité RGPD totale."
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Lettres de résiliation"
              description="Lettres conformes au droit français (Loi Hamon, Loi Chatel) générées automatiquement."
            />
            <FeatureCard
              icon={<Bell className="h-5 w-5" />}
              title="Alertes de renouvellement"
              description="Recevez un rappel avant chaque renouvellement pour ne plus jamais être surpris."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Analyse par catégorie"
              description="Streaming, télécom, assurances... Comprenez où va votre argent en un clin d'œil."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Statistics */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Pourquoi agir maintenant
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Les chiffres parlent d&apos;eux-mêmes
            </h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <StatCard
                value="827 €"
                label="par mois"
                description="C'est le montant moyen des prélèvements automatiques par foyer, soit 47% du revenu disponible."
                source="UFC-Que Choisir"
              />
              <StatCard
                value="73%"
                label="des Français"
                description="ne font jamais le point sur leurs charges récurrentes. Seuls 27% vérifient régulièrement."
                source="Ipsos / Papernest"
              />
              <StatCard
                value="+20 €"
                label="par mois"
                description="L'augmentation du coût des abonnements depuis 2020, soit 240 €/an de plus pour les mêmes services."
                source="UFC-Que Choisir"
              />
            </div>
            <div className="space-y-6">
              <StatCard
                value="6"
                label="abonnements"
                description="en moyenne par foyer, mais les ménages pensent n'en avoir que 3,5. La moitié passe sous le radar."
                source="UFC-Que Choisir"
              />
              <StatCard
                value="150 €"
                label="par an perdus"
                description="à cause d'abonnements oubliés ou mal gérés. De l'argent récupérable en quelques minutes."
                source="UFC-Que Choisir"
              />
              <StatCard
                value="38%"
                label="des consommateurs"
                description="gardent des abonnements inutiles par peur de perdre leurs données ou historiques."
                source="Economie Matin"
              />
            </div>
          </div>

          <p className="mt-12 text-center text-xs text-zinc-400">
            Sources : INSEE, UFC-Que Choisir, Ipsos/Papernest, BearingPoint 2025, Economie Matin, Meilleurtaux
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-zinc-200 bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Ils ont repris le contrôle
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="J'ai découvert que je payais encore un abonnement à une salle de sport que j'avais quittée il y a 8 mois. 39€/mois dans le vide !"
              name="Marie L."
              role="Économie : 468 €/an"
              stars={5}
            />
            <TestimonialCard
              quote="En 10 minutes j'ai vu que mes abonnements streaming me coûtaient 67€/mois. J'en ai coupé 3 que je n'utilisais plus."
              name="Thomas R."
              role="Économie : 384 €/an"
              stars={5}
            />
            <TestimonialCard
              quote="La lettre de résiliation générée automatiquement m'a fait gagner un temps fou. Tout était conforme, j'ai juste eu à envoyer."
              name="Sophie M."
              role="Économie : 276 €/an"
              stars={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Tarif
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Gratuit. Point final.
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Pas d&apos;abonnement, pas de frais cachés, pas de piège. Ironique, non ?
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-md">
            <div className="relative overflow-hidden rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl shadow-blue-600/10 dark:bg-zinc-900">
              <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                Pour toujours
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-zinc-900 dark:text-white">0&nbsp;€</span>
                <span className="text-zinc-500">/mois</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">Aucune carte bancaire requise</p>

              <ul className="mt-8 space-y-3">
                {[
                  "Détection illimitée d'abonnements",
                  "Import CSV, PDF, OFX",
                  "Tableau de bord complet",
                  "Lettres de résiliation (Loi Hamon / Chatel)",
                  "Alertes de renouvellement",
                  "Calcul d'économies",
                  "Guides de résiliation (70+ services)",
                  "Chiffrement AES-256",
                  "Conforme RGPD",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <Check className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                Commencer maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-zinc-200 bg-zinc-50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Questions fréquentes
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            <FaqItem
              question="Est-ce que No Abo est vraiment gratuit ?"
              answer="Oui, No Abo est entièrement gratuit. Nous ne vendons pas vos données et il n'y a aucun abonnement caché — ce serait un comble pour un anti-abonnements !"
            />
            <FaqItem
              question="Mes données bancaires sont-elles en sécurité ?"
              answer="Absolument. Vos données sont chiffrées avec l'algorithme AES-256 (le même que les banques). Nous sommes conformes au RGPD et ne partageons jamais vos informations avec des tiers."
            />
            <FaqItem
              question="Quelles banques sont compatibles ?"
              answer="Toutes les banques françaises sont compatibles. Vous pouvez aussi importer vos relevés au format CSV, PDF ou OFX si vous préférez ne pas connecter votre banque directement."
            />
            <FaqItem
              question="Comment fonctionne la détection des abonnements ?"
              answer="Notre algorithme analyse vos transactions pour identifier les paiements récurrents (même montant, même fréquence, même destinataire). Il détecte les abonnements mensuels, trimestriels et annuels."
            />
            <FaqItem
              question="Puis-je résilier directement depuis No Abo ?"
              answer="No Abo vous guide dans la résiliation avec des instructions détaillées et des lettres pré-rédigées conformes au droit français (Loi Hamon, Loi Chatel). Vous restez maître de chaque étape."
            />
            <FaqItem
              question="Est-ce que No Abo fonctionne sur mobile ?"
              answer="Oui, No Abo est entièrement responsive et fonctionne parfaitement sur smartphone, tablette et ordinateur. Aucune application à installer, tout se passe dans votre navigateur."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-blue-600 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-blue-600 to-blue-800" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Prêt à économiser jusqu&apos;à 550&nbsp;€ par an ?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100">
            Rejoignez les Français qui ont repris le contrôle de leurs abonnements.
            Inscription en 30 secondes, résultats immédiats.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:-translate-y-0.5"
            >
              Créer mon compte gratuit
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/60 hover:-translate-y-0.5"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 py-12 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                  NA
                </div>
                <span className="text-lg font-bold text-zinc-900 dark:text-white">No Abo</span>
              </div>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                La plateforme qui vous aide à reprendre le contrôle de vos abonnements et économiser
                de l&apos;argent chaque mois.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Produit</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/register" className="text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Créer un compte
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <Link href="/help/cancel" className="text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Guides de résiliation
                  </Link>
                </li>
                <li>
                  <Link href="/help/export-bank-statement" className="text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Exporter un relevé bancaire
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Légal</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/privacy" className="text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Conditions d&apos;utilisation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Ressources</h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Loi Hamon — résiliation à tout moment
                  </span>
                </li>
                <li>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Loi Chatel — préavis obligatoire
                  </span>
                </li>
                <li>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    RGPD — protection des données
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
            <p>© {new Date().getFullYear()} No Abo. Tous droits réservés. Fait avec passion en France.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-Components ─── */

function SolutionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-blue-800 hover:bg-zinc-900">
      <div className="mb-4 inline-flex rounded-xl bg-blue-600/10 p-3 text-blue-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  features,
}: {
  number: string;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
      <ul className="mt-4 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        {icon}
      </div>
      <h3 className="font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function StatCard({
  value,
  label,
  description,
  source,
}: {
  value: string;
  label: string;
  description: string;
  source: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">Source : {source}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
  stars,
}: {
  quote: string;
  name: string;
  role: string;
  stars: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">&ldquo;{quote}&rdquo;</p>
      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{name}</p>
        <p className="text-xs text-green-600 dark:text-green-400">{role}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 [&[open]]:shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-semibold text-zinc-900 marker:content-none dark:text-white [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{answer}</p>
      </div>
    </details>
  );
}
