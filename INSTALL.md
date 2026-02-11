# Guide d'installation — No Abo

Guide complet pour installer et lancer le projet **No Abo** en local sur macOS, avec VS Code et l'extension Claude Code.

---

## Table des matières

1. [Prérequis](#1--prérequis)
2. [Cloner le projet](#2--cloner-le-projet)
3. [Installer les dépendances](#3--installer-les-dépendances)
4. [Configurer PostgreSQL](#4--configurer-postgresql)
5. [Variables d'environnement](#5--variables-denvironnement)
6. [Initialiser la base de données](#6--initialiser-la-base-de-données)
7. [Lancer le serveur de développement](#7--lancer-le-serveur-de-développement)
8. [Tester l'application](#8--tester-lapplication)
9. [Dépannage](#9--dépannage)

---

## 1 — Prérequis

### Homebrew

Si Homebrew n'est pas installé, ouvrez le Terminal et exécutez :

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Après l'installation, suivez les instructions affichées pour ajouter Homebrew au PATH (généralement une commande `eval` à copier-coller).

### Node.js (≥ 18)

```bash
# Installer Node.js via Homebrew
brew install node

# Vérifier l'installation
node --version   # doit afficher v18.x.x ou supérieur
npm --version    # doit afficher 9.x.x ou supérieur
```

> **Alternative** : Si vous utilisez `nvm` (Node Version Manager) :
> ```bash
> brew install nvm
> nvm install 20
> nvm use 20
> ```

### Git

```bash
# Git est souvent pré-installé sur macOS. Vérifiez :
git --version

# Sinon, installez-le :
brew install git
```

### PostgreSQL (≥ 15)

```bash
# Installer PostgreSQL
brew install postgresql@17

# Démarrer le service PostgreSQL (se lance automatiquement au démarrage)
brew services start postgresql@17

# Vérifier que PostgreSQL tourne
psql --version
```

> **Note** : Homebrew installe PostgreSQL avec votre nom d'utilisateur macOS comme superuser par défaut (sans mot de passe).

### VS Code + Extensions

1. Téléchargez [VS Code](https://code.visualstudio.com/) si ce n'est pas déjà fait
2. Installez l'extension **Claude Code** depuis le marketplace VS Code
3. Extensions recommandées (optionnel mais utile) :
   - **Prisma** — Coloration syntaxique pour les fichiers `.prisma`
   - **Tailwind CSS IntelliSense** — Autocomplétion des classes Tailwind
   - **ESLint** — Linting intégré

---

## 2 — Cloner le projet

```bash
# Cloner le dépôt
git clone https://github.com/JordanBelfort38/noabo.git

# Entrer dans le dossier du projet
cd noabo

# Ouvrir dans VS Code
code .
```

---

## 3 — Installer les dépendances

Dans le terminal intégré de VS Code (`Ctrl+ù` ou `Cmd+ù`) :

```bash
npm install
```

Cela installe toutes les dépendances listées dans `package.json`, notamment :
- **next** 16.1.6 — Framework React
- **prisma** 7.3 — ORM pour PostgreSQL
- **next-auth** 5 beta 30 — Authentification
- **recharts** — Graphiques
- **sonner** — Notifications toast
- **zod** 4 — Validation de données

---

## 4 — Configurer PostgreSQL

### Créer la base de données

```bash
# Se connecter à PostgreSQL (utilise votre user macOS par défaut)
psql postgres

# Dans le shell psql, créer la base de données :
CREATE DATABASE noabo;

# (Optionnel) Créer un utilisateur dédié avec mot de passe :
CREATE USER noabo_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE noabo TO noabo_user;
ALTER DATABASE noabo OWNER TO noabo_user;

# Quitter psql
\q
```

### Vérifier la connexion

```bash
# Avec l'utilisateur par défaut (sans mot de passe) :
psql -d noabo -c "SELECT 1;"

# Ou avec l'utilisateur dédié :
psql -U noabo_user -d noabo -c "SELECT 1;"
```

Si la commande retourne `1`, la connexion fonctionne.

---

## 5 — Variables d'environnement

Créez le fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local 2>/dev/null || touch .env.local
```

Ouvrez `.env.local` et ajoutez le contenu suivant :

```env
# ============================================
# BASE DE DONNÉES
# ============================================
# Si vous utilisez votre user macOS par défaut (sans mot de passe) :
DATABASE_URL="postgresql://localhost:5432/noabo"

# Si vous avez créé un utilisateur dédié :
# DATABASE_URL="postgresql://noabo_user:votre_mot_de_passe@localhost:5432/noabo"

# ============================================
# NEXTAUTH — Authentification
# ============================================
# Générez un secret aléatoire avec : openssl rand -base64 32
AUTH_SECRET="REMPLACEZ_PAR_VOTRE_SECRET_GENERE"
AUTH_URL="http://localhost:3000"

# ============================================
# OAUTH — Providers (optionnel)
# ============================================
# Laissez vide si vous n'utilisez que l'auth par email/mot de passe.
# Pour Google : https://console.cloud.google.com/apis/credentials
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
# Pour GitHub : https://github.com/settings/developers
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# ============================================
# BRIDGE API — Connexion bancaire (optionnel)
# ============================================
# Sans ces variables, l'app fonctionne en mode mock (données simulées).
# Pour obtenir des credentials sandbox : https://dashboard.bridgeapi.io
BRIDGE_CLIENT_ID=""
BRIDGE_CLIENT_SECRET=""
BRIDGE_API_URL="https://api.bridgeapi.io/v3"
BRIDGE_REDIRECT_URI="http://localhost:3000/api/bank/callback"

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Clé de chiffrement pour les tokens bancaires (32 caractères)
# Générez avec : openssl rand -hex 16
ENCRYPTION_KEY="REMPLACEZ_PAR_VOTRE_CLE_GENEREE"
```

### Générer les secrets

Exécutez ces commandes dans le terminal et copiez les résultats dans `.env.local` :

```bash
# Générer AUTH_SECRET
echo "AUTH_SECRET=$(openssl rand -base64 32)"

# Générer ENCRYPTION_KEY
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)"
```

---

## 6 — Initialiser la base de données

### Générer le client Prisma

```bash
npx prisma generate
```

Cela génère le client Prisma typé dans `src/generated/prisma/`.

### Créer les tables

```bash
npx prisma db push
```

Cette commande synchronise le schéma Prisma (`prisma/schema.prisma`) avec votre base PostgreSQL et crée toutes les tables nécessaires :
- `User`, `Account`, `Session` — Authentification
- `BankConnection`, `BankAccount`, `Transaction` — Banque
- `Subscription` — Abonnements
- `CancellationTemplate`, `CancellationRequest` — Résiliation

### Seeder les templates de résiliation

```bash
npx tsx prisma/seed-templates.ts
```

Cela insère les 22 templates de résiliation pour les services français (Netflix, Spotify, Canal+, Free, Orange, SFR, etc.).

### Vérifier (optionnel)

```bash
# Ouvrir Prisma Studio pour visualiser la base de données
npx prisma studio
```

Prisma Studio s'ouvre dans le navigateur sur `http://localhost:5555`. Vous devriez voir les tables créées et les templates de résiliation insérés.

---

## 7 — Lancer le serveur de développement

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3000**.

Ouvrez votre navigateur et accédez à cette URL. Vous devriez voir la landing page de No Abo.

### Premier test rapide

1. Cliquez sur **Commencer gratuitement** ou allez sur `/register`
2. Créez un compte avec email + mot de passe
3. Connectez-vous sur `/login`
4. Vous arrivez sur le tableau de bord `/dashboard`
5. Essayez d'ajouter un abonnement manuellement via **Ajouter un abonnement**

---

## 8 — Tester l'application

### Build de production

Vérifiez que le projet compile sans erreur :

```bash
npm run build
```

Résultat attendu : **~48 routes, 0 erreurs**.

### Linting

```bash
npm run lint
```

### Fonctionnalités à tester

| Fonctionnalité | URL | Ce qu'il faut vérifier |
|---|---|---|
| Landing page | `/` | Affichage correct, animations |
| Inscription | `/register` | Création de compte, validation du formulaire |
| Connexion | `/login` | Login email/mot de passe |
| Tableau de bord | `/dashboard` | Onboarding pour nouvel utilisateur |
| Ajout abonnement | `/dashboard/subscriptions/new` | Formulaire, toast de succès |
| Détail abonnement | `/dashboard/subscriptions/[id]` | Infos, confirmer, supprimer |
| Connexion bancaire | `/dashboard/bank` | Mode mock si pas de Bridge API |
| Guides résiliation | `/help/cancel` | Liste des 22 services |
| Guide détaillé | `/help/cancel/netflix` | Étapes, méthodes, templates |
| Profil | `/profile` | Modification nom/email |

---

## 9 — Dépannage

### PostgreSQL ne démarre pas

```bash
# Vérifier le statut
brew services list

# Redémarrer PostgreSQL
brew services restart postgresql@17

# Si le port 5432 est occupé
lsof -i :5432
# Tuer le processus si nécessaire
kill -9 <PID>
```

### Erreur `ECONNREFUSED` à la connexion DB

La base PostgreSQL n'est pas accessible. Vérifiez :

1. PostgreSQL tourne : `brew services list`
2. La base `noabo` existe : `psql -l | grep noabo`
3. Le `DATABASE_URL` dans `.env.local` est correct
4. Testez la connexion : `psql -d noabo -c "SELECT 1;"`

### Erreur `P1001: Can't reach database server`

Même cause que ci-dessus. Assurez-vous que PostgreSQL est démarré et que le `DATABASE_URL` est correct.

### Erreur `prisma generate` échoue

```bash
# Nettoyer et regénérer
rm -rf src/generated/prisma
rm -rf node_modules/.prisma
npx prisma generate
```

### Erreur `Module not found: @/generated/prisma/client`

Le client Prisma n'a pas été généré. Exécutez :

```bash
npx prisma generate
```

### Erreur `relation "User" does not exist`

Les tables n'ont pas été créées. Exécutez :

```bash
npx prisma db push
```

### Erreur `AUTH_SECRET` manquant

NextAuth nécessite un secret. Générez-en un :

```bash
openssl rand -base64 32
```

Ajoutez le résultat dans `.env.local` comme valeur de `AUTH_SECRET`.

### Le port 3000 est déjà utilisé

```bash
# Trouver le processus sur le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou lancer sur un autre port
npm run dev -- -p 3001
```

### Les templates de résiliation sont vides

```bash
npx tsx prisma/seed-templates.ts
```

### Erreur `tsx: command not found`

```bash
# tsx est inclus dans les dépendances, utilisez npx :
npx tsx prisma/seed-templates.ts

# Si ça ne marche toujours pas :
npm install -g tsx
```

### Réinitialiser complètement la base de données

⚠️ **Attention** : Cela supprime toutes les données.

```bash
# Supprimer et recréer la base
psql postgres -c "DROP DATABASE IF EXISTS noabo;"
psql postgres -c "CREATE DATABASE noabo;"

# Recréer les tables
npx prisma db push

# Re-seeder les templates
npx tsx prisma/seed-templates.ts
```

### Les graphiques ne s'affichent pas

Les graphiques (Recharts) sont chargés dynamiquement. Ils n'apparaissent que s'il y a des données d'abonnements. Ajoutez quelques abonnements manuellement pour les voir.

### Problème avec `npm install`

```bash
# Nettoyer le cache npm et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

## Résumé des commandes

```bash
# Installation complète (copier-coller)
brew install node postgresql@17
brew services start postgresql@17
psql postgres -c "CREATE DATABASE noabo;"

git clone https://github.com/JordanBelfort38/noabo.git
cd noabo
npm install

# Configurer .env.local (voir section 5)

npx prisma generate
npx prisma db push
npx tsx prisma/seed-templates.ts

npm run dev
# → Ouvrir http://localhost:3000
```

---

## Besoin d'aide ?

- **Prisma** : [Documentation Prisma](https://www.prisma.io/docs)
- **Next.js** : [Documentation Next.js](https://nextjs.org/docs)
- **NextAuth** : [Documentation NextAuth v5](https://authjs.dev)
- **Bridge API** : [Documentation Bridge](https://docs.bridgeapi.io)
- **Tailwind CSS** : [Documentation Tailwind v4](https://tailwindcss.com/docs)
