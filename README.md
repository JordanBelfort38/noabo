# No Abo — Gestion et résiliation d'abonnements

Plateforme française de gestion d'abonnements qui détecte automatiquement vos dépenses récurrentes, vous aide à les suivre et vous guide pour résilier ceux dont vous n'avez plus besoin.

## Fonctionnalités

- **Connexion bancaire** — Importez vos transactions via Bridge API v3 (Open Banking DSP2) ou par upload de relevés (CSV, PDF, OFX)
- **Détection automatique** — Algorithme d'analyse de fréquence avec scoring de confiance (0-100, seuil ≥ 60)
- **Tableau de bord** — Vue d'ensemble avec statistiques, graphiques d'évolution et alertes
- **Résiliation guidée** — 22 templates de résiliation pour les services français (Netflix, Spotify, Canal+, Free, Orange, SFR, etc.) avec lettres types conformes aux lois Hamon/Chatel
- **Économies** — Calcul des économies potentielles avec suggestions d'alternatives
- **Alertes** — Notifications de renouvellement, fin d'engagement et augmentation de prix

## Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16 | Framework (App Router) |
| React | 19 | UI |
| TypeScript | 5 | Typage |
| Tailwind CSS | 4 | Styles |
| Prisma | 7 | ORM (PostgreSQL) |
| NextAuth | 5 beta 30 | Authentification |
| Zod | 4 | Validation |
| Recharts | 2 | Graphiques |
| Sonner | — | Toast notifications |
| Lucide | — | Icônes |
| Bridge API | v3 | Connexion bancaire |

## Prérequis

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 15
- **npm** ≥ 9

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd no-abo

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs (voir section ci-dessous)

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# Seeder les templates de résiliation
npx tsx prisma/seed-cancellation-templates.ts

# Lancer le serveur de développement
npm run dev
```

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/noabo"

# NextAuth
AUTH_SECRET="votre-secret-aleatoire-32-chars"
AUTH_URL="http://localhost:3000"

# OAuth (optionnel)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Bridge API (connexion bancaire)
BRIDGE_CLIENT_ID="sandbox_id_..."
BRIDGE_CLIENT_SECRET="sandbox_secret_..."
BRIDGE_API_URL="https://api.bridgeapi.io/v3"
BRIDGE_REDIRECT_URI="http://localhost:3000/api/bank/callback"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENCRYPTION_KEY="votre-cle-chiffrement-32-chars"
```

> **Note** : Sans `BRIDGE_CLIENT_ID`, l'application fonctionne en mode mock pour les connexions bancaires.

## Scripts

```bash
npm run dev        # Serveur de développement (port 3000)
npm run build      # Build de production
npm run start      # Serveur de production
npm run lint       # Linting ESLint
```

## Structure du projet

```
src/
├── app/                          # Pages (App Router)
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Layout racine (metadata, fonts, Toaster)
│   ├── sitemap.ts                # Sitemap XML
│   ├── robots.ts                 # Robots.txt
│   ├── not-found.tsx             # Page 404
│   ├── login/                    # Connexion
│   ├── register/                 # Inscription
│   ├── profile/                  # Profil utilisateur
│   ├── dashboard/                # Tableau de bord principal
│   │   ├── bank/                 # Comptes bancaires
│   │   │   └── connect/          # Connexion bancaire
│   │   ├── transactions/         # Transactions
│   │   ├── subscriptions/        # Abonnements (CRUD)
│   │   │   └── [id]/
│   │   │       ├── edit/         # Modifier
│   │   │       └── cancel/       # Résilier
│   │   └── cancellations/        # Demandes de résiliation
│   ├── help/
│   │   ├── cancel/               # Guides de résiliation
│   │   │   └── [merchant]/       # Guide par service
│   │   └── export-bank-statement/# Aide export relevé
│   └── api/                      # Routes API
│       ├── auth/                 # Auth (NextAuth + profil)
│       ├── bank/                 # Banque (connect, callback, sync, disconnect, upload)
│       ├── subscriptions/        # Abonnements (CRUD, detect, stats, alerts)
│       ├── savings/              # Calcul d'économies
│       └── cancellation/         # Résiliation (templates, requests, letter)
├── components/
│   ├── ui/                       # Composants shadcn/ui
│   ├── auth/                     # Auth (LoginForm, RegisterForm, ProtectedRoute)
│   ├── bank/                     # Banque (BankCard, BankEmptyState, BankStatsCards)
│   ├── dashboard/                # Dashboard (WelcomeBanner, OnboardingCard, QuickStats...)
│   ├── subscriptions/            # Abonnements (SubscriptionCard, SubscriptionForm)
│   ├── cancellation/             # Résiliation (CancellationGuide, CancellationStepper)
│   ├── charts/                   # Graphiques (SpendingChart, CategoryChart)
│   ├── alerts/                   # Alertes (AlertBanner)
│   └── landing/                  # Landing page (AnimatedCounter)
├── lib/                          # Utilitaires
│   ├── prisma.ts                 # Client Prisma
│   ├── bank-api.ts               # Bridge API v3 (serveur uniquement)
│   ├── bank-constants.ts         # Constantes banques (client-safe)
│   ├── validations.ts            # Schémas Zod
│   ├── password.ts               # Hachage mot de passe
│   └── rate-limit.ts             # Rate limiting
└── auth.ts                       # Configuration NextAuth
```

## Architecture

### Connexion bancaire (Bridge API v3)

```
Utilisateur → Connecter → POST /api/bank/connect
  → Crée/récupère l'utilisateur Bridge
  → Obtient un token d'accès (2h)
  → Crée une session Connect
  → Redirige vers Bridge Connect (hébergé)
  → Callback → /api/bank/callback
    → Valide le state token (CSRF)
    → Crée la connexion en DB
    → Synchronise comptes et transactions
```

### Détection d'abonnements

L'algorithme analyse les transactions pour détecter les paiements récurrents :
1. Normalise les descriptions (70+ marchands connus)
2. Groupe par marchand
3. Analyse les intervalles entre transactions
4. Détecte la fréquence (hebdo, mensuel, trimestriel, annuel)
5. Calcule un score de confiance (0-100)
6. Crée les abonnements avec confiance ≥ 60

### Résiliation

22 templates de résiliation pour les services français :
- Méthodes : en ligne, e-mail, téléphone, courrier
- Lettres types conformes aux lois Hamon et Chatel
- Génération PDF pour envoi postal
- Suivi des demandes de résiliation

## Déploiement

### Vercel (recommandé)

1. Connecter le repo à Vercel
2. Configurer les variables d'environnement dans le dashboard Vercel
3. Configurer une base PostgreSQL (Vercel Postgres, Neon, Supabase...)
4. Mettre à jour `BRIDGE_REDIRECT_URI` avec l'URL de production
5. Déployer

### Variables de production

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="secret-production-32-chars"
AUTH_URL="https://noabo.fr"
BRIDGE_CLIENT_ID="production_id_..."
BRIDGE_CLIENT_SECRET="production_secret_..."
BRIDGE_API_URL="https://api.bridgeapi.io/v3"
BRIDGE_REDIRECT_URI="https://noabo.fr/api/bank/callback"
NEXT_PUBLIC_APP_URL="https://noabo.fr"
ENCRYPTION_KEY="cle-production-32-chars"
```

## Sécurité

- **Authentification** : NextAuth v5 avec JWT, providers Google/GitHub/Credentials
- **Chiffrement** : Tokens bancaires chiffrés en DB
- **Rate limiting** : Sur les endpoints sensibles (connexion, sync, upload)
- **CSRF** : State tokens pour les callbacks bancaires
- **Validation** : Zod sur toutes les entrées API
- **Sanitization** : Prisma parameterized queries (pas d'injection SQL)
- **Headers** : Robots.txt bloque /dashboard/ et /api/ de l'indexation

## Licence

Projet privé — Tous droits réservés.
