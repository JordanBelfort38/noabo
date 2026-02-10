# PHASE 6 — Intégration Bridge API v3 & Refonte UX Bancaire

## Résumé

La Phase 6 comprend deux volets majeurs :
1. **Intégration Bridge API v3** — Remplacement de l'implémentation mock par l'API réelle de Bridge pour les connexions bancaires
2. **Refonte UX complète** — Redesign du dashboard bancaire et de la page de connexion

---

## Partie 1 : Intégration Bridge API v3

### Flux d'authentification

```
Utilisateur clique "Connecter"
  → POST /api/bank/connect
    → getOrCreateBridgeUser(userId, email)     // POST /v3/aggregation/users
    → getBridgeAccessToken(userId, email)       // POST /v3/aggregation/authorization/token
    → bridgeFetch("/aggregation/connect-sessions")  // Crée la session Connect
    → Retourne l'URL Bridge Connect
  → Redirect vers Bridge Connect (hébergé par Bridge)
  → Utilisateur se connecte à sa banque
  → Bridge redirige vers /api/bank/callback?item_id=X&success=true&state=Y
    → handleBankCallback({itemId, success, state})
      → Valide le state token (CSRF)
      → Fetch item details + bank name/logo
      → Crée BankConnection en DB
      → Fetch accounts (paginé)
      → Sync transactions initiales (paginé)
    → Redirect vers /dashboard/bank?success=true
```

### Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `prisma/schema.prisma` | Ajout champ `bridgeUserUuid` au modèle User |
| `src/lib/bank-api.ts` | Réécriture complète (~620 lignes) avec Bridge API v3 |
| `src/app/api/bank/connect/route.ts` | Passage de l'email utilisateur |
| `src/app/api/bank/callback/route.ts` | Nouveaux params Bridge Connect v3 |

### Détails techniques

- **Base URL** : `https://api.bridgeapi.io/v3`
- **Headers** : `Client-Id`, `Client-Secret`, `Bridge-Version: 2025-01-15`, `Authorization: Bearer TOKEN`
- **Pagination** : cursor-based avec `resources[]` + `pagination.next_uri`
- **Transactions** : `clean_description` / `bank_description` (v3)
- **Token** : Access token valide 2h, rafraîchi automatiquement
- **Mode mock** : Activé quand `BRIDGE_CLIENT_ID` n'est pas défini

### Variables d'environnement

```env
BRIDGE_CLIENT_ID=sandbox_id_...
BRIDGE_CLIENT_SECRET=sandbox_secret_...
BRIDGE_API_URL=https://api.bridgeapi.io/v3
BRIDGE_REDIRECT_URI=http://localhost:3000/api/bank/callback
```

### Bugs corrigés

1. **404 sur connect-sessions** — Le champ `user_email` était manquant dans le body de la requête `POST /aggregation/connect-sessions`. Bridge API v3 l'exige.
2. **Double /v3** — Vérification que `BRIDGE_API_URL` inclut `/v3` et que les endpoints ne le dupliquent pas.

---

## Partie 2 : Refonte UX Bancaire (Phase 6.5)

### Nouveaux composants créés

| Composant | Description |
|-----------|-------------|
| `src/components/bank/BankEmptyState.tsx` | État vide avec illustration, CTA proéminent, badges de sécurité |
| `src/components/bank/BankCard.tsx` | Carte de connexion bancaire redesignée avec comptes expandables, actions, statuts |
| `src/components/bank/BankStatsCards.tsx` | 4 cartes de statistiques (banques, comptes, solde, dernière synchro) |
| `src/components/bank/BankCardSkeleton.tsx` | Squelettes de chargement (cartes + stats) avec animation shimmer |

### Pages redesignées

#### Dashboard bancaire (`/dashboard/bank`)

- **Header** avec titre, sous-titre et CTA "Connecter une banque"
- **Statistiques** en grille 4 colonnes (banques, comptes, solde total, dernière synchro)
- **Grille de cartes** responsive (1 col mobile, 2 cols desktop)
- **État vide** avec illustration et CTA proéminent
- **Skeleton loading** pendant le chargement
- **Toast notifications** (sonner) pour succès/erreurs au lieu d'alertes inline
- **URL nettoyée** après callback (suppression des query params)

#### Page de connexion (`/dashboard/bank/connect`)

- **Bouton retour** vers le dashboard
- **Banques populaires** en grille de cartes visuelles (5 colonnes desktop)
- **Recherche** avec input large et bouton clear
- **Toutes les banques** en liste avec badges "Populaire"
- **Demo Bank** section sandbox avec style distinct (bordure amber)
- **Loading par banque** — spinner sur la banque cliquée uniquement
- **Badges de sécurité** DSP2 + Données chiffrées

### Design system

**Couleurs des statuts :**
- Actif : vert (`#10B981`) avec dot animé
- Expirée : orange (`#F59E0B`)
- Erreur : rouge (`#EF4444`)
- Déconnecté : gris

**Icônes des comptes :**
- Compte courant : `Wallet` (bleu)
- Épargne : `PiggyBank` (vert)
- Carte de crédit : `CreditCard` (violet)

**Interactions :**
- Hover sur cartes : élévation + bordure
- Comptes expandables avec chevron
- Spinner de synchronisation dans le bouton
- Dialog de confirmation pour déconnexion
- Toast notifications (sonner) pour tous les feedbacks

### Dépendances ajoutées

```
sonner (toast notifications)
```

### Responsive design

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 640px) | 1 colonne, cartes empilées |
| Tablette (640-1024px) | 2 colonnes stats, 2 colonnes cartes |
| Desktop (> 1024px) | 4 colonnes stats, 2 colonnes cartes, 5 colonnes banques populaires |

---

## Partie 3 : Refonte du Dashboard Principal (Phase 6.5b)

### Avant / Après

| Aspect | Avant | Après |
|--------|-------|-------|
| **Accueil** | Titre "Tableau de bord" générique | Bannière gradient avec salutation personnalisée (Bonjour/Bon après-midi/Bonsoir + prénom) |
| **Nouvel utilisateur** | Aucun guidage, page vide avec stats à 0 | Carte d'onboarding 3 étapes avec CTA proéminent |
| **Statistiques** | 4 petites cartes compactes | 4 grandes cartes avec bordure colorée, icônes, sous-textes descriptifs |
| **Actions** | 2 boutons dans le header | 4 cartes d'actions rapides avec descriptions et liens |
| **Abonnements** | Liste complète avec tabs de filtrage | Aperçu de 6 abonnements récents en grille 3 colonnes |
| **Graphiques** | Carte unique avec toggle | Section dédiée avec toggle stylisé |
| **Chargement** | Spinner centré | Squelette complet reproduisant la structure de la page |
| **Navigation** | Liens mobiles en bas | 4 cartes de liens rapides (guides, aide, conseils, paramètres) |

### Structure de la page (`/dashboard`)

```
┌─────────────────────────────────────────────────┐
│  A) WelcomeBanner — Gradient bleu/indigo        │
│     "Bonjour, Julien 👋"                        │
│     "Votre centre de contrôle des abonnements"  │
├─────────────────────────────────────────────────┤
│  B) OnboardingCard (si pas de banque/abos)      │
│     Étape 1: Connecter banque ✓ / En cours      │
│     Étape 2: Détection automatique              │
│     Étape 3: Gérer et résilier                  │
│     [Connecter ma première banque]              │
├─────────────────────────────────────────────────┤
│  C) AlertBanner (si alertes)                    │
│     Renouvellements, prix, engagements...       │
├─────────────────────────────────────────────────┤
│  D) QuickStatsGrid (si abonnements)             │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │ Coût     │ Actifs   │ Économies│ Prochain │  │
│  │ mensuel  │ 12       │ possibles│ prélèvem.│  │
│  │ 142,50 € │          │ 48 €/mois│ 15 fév.  │  │
│  └──────────┴──────────┴──────────┴──────────┘  │
├─────────────────────────────────────────────────┤
│  E) QuickActionsGrid                            │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │ Mes abos │ Banques  │ Détecter │ Résilier │  │
│  │ [Voir]   │[Connecter│[Analyser]│ [Guides] │  │
│  └──────────┴──────────┴──────────┴──────────┘  │
├─────────────────────────────────────────────────┤
│  F) SubscriptionsPreview                        │
│  ┌────────┬────────┬────────┐                   │
│  │Netflix │Spotify │Canal+  │                   │
│  ├────────┼────────┼────────┤                   │
│  │Free    │EDF     │Basic-Fit│                  │
│  └────────┴────────┴────────┘                   │
│  [Voir tous les abonnements →]                  │
├─────────────────────────────────────────────────┤
│  G) DashboardCharts                             │
│  Évolution des dépenses / Répartition catégorie │
│  [📊 ligne] [🥧 camembert]                      │
├─────────────────────────────────────────────────┤
│  H) FooterLinks                                 │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │ Guides   │ Aide     │ Conseils │ Paramètres│ │
│  └──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────┘
```

### Nouveaux composants créés

| Composant | Description |
|-----------|-------------|
| `src/components/dashboard/WelcomeBanner.tsx` | Bannière hero avec gradient bleu→indigo, salutation personnalisée (heure du jour + prénom), cercles décoratifs |
| `src/components/dashboard/OnboardingCard.tsx` | Carte d'onboarding 3 étapes avec statut dynamique (terminé/en cours/en attente), CTA proéminent, badges sécurité (DSP2, RGPD, chiffrement) |
| `src/components/dashboard/QuickStatsGrid.tsx` | 4 cartes statistiques avec bordure colorée en haut (bleu, vert, orange, violet), icônes, valeurs formatées |
| `src/components/dashboard/QuickActionsGrid.tsx` | 4 cartes d'actions rapides (abonnements, banques, détection, résiliation) avec toast sonner sur détection |
| `src/components/dashboard/SubscriptionsPreview.tsx` | Aperçu de 6 abonnements récents en grille responsive, état vide avec CTA, lien "Voir tout" |
| `src/components/dashboard/DashboardCharts.tsx` | Wrapper graphiques avec toggle ligne/camembert stylisé, utilise `SpendingChart` et `CategoryChart` existants |
| `src/components/dashboard/DashboardSkeleton.tsx` | Squelette de chargement complet reproduisant la structure de la page (bannière, stats, actions, abonnements) |
| `src/components/dashboard/FooterLinks.tsx` | 4 liens rapides en grille (guides, aide, conseils, paramètres) avec icônes colorées |

### Page redesignée

**Fichier** : `src/app/dashboard/page.tsx` — Réécriture complète

**Data fetching** : 5 appels API en parallèle
```typescript
const [subsRes, statsRes, alertsRes, savingsRes, banksRes] = await Promise.all([
  fetch("/api/subscriptions"),
  fetch("/api/subscriptions/stats"),
  fetch("/api/subscriptions/alerts"),
  fetch("/api/savings"),
  fetch("/api/bank/connections"),  // ← Nouveau : pour déterminer l'état d'onboarding
]);
```

### Flux d'onboarding

```
Nouvel utilisateur (0 banque, 0 abonnement)
  → WelcomeBanner : "Bonjour 👋"
  → OnboardingCard :
      Étape 1 : "Connectez votre banque" [EN COURS] ← surligné
      Étape 2 : "Détection automatique" [EN ATTENTE]
      Étape 3 : "Gérez et résiliez" [EN ATTENTE]
      [Connecter ma première banque] ← CTA principal
  → QuickActionsGrid (toujours visible)
  → SubscriptionsPreview (état vide)
  → FooterLinks

Utilisateur avec banque mais sans abonnements
  → WelcomeBanner
  → OnboardingCard :
      Étape 1 : "Connectez votre banque" [TERMINÉ] ✓
      Étape 2 : "Détection automatique" [EN COURS] ← surligné
      Étape 3 : "Gérez et résiliez" [EN ATTENTE]
  → QuickActionsGrid (bouton "Analyser" mis en avant)
  → SubscriptionsPreview (état vide + CTA ajout manuel)

Utilisateur complet (banque + abonnements)
  → WelcomeBanner
  → AlertBanner (si alertes)
  → QuickStatsGrid (4 stats)
  → QuickActionsGrid
  → SubscriptionsPreview (6 abonnements)
  → DashboardCharts
  → FooterLinks
```

### États gérés

| État | Comportement |
|------|-------------|
| **Chargement** | `DashboardSkeleton` — squelette complet avec animations shimmer |
| **Aucune banque** | OnboardingCard avec étape 1 active + CTA "Connecter ma première banque" |
| **Banque sans abos** | OnboardingCard avec étape 2 active + CTA détection |
| **Données complètes** | Stats + Actions + Abonnements + Graphiques |
| **Aucun abonnement** | `SubscriptionsPreview` affiche état vide avec CTA ajout manuel |
| **Aucune alerte** | Section AlertBanner masquée |
| **Aucune donnée graphique** | Section DashboardCharts masquée |

### Responsive design

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 640px) | 1 colonne, sections empilées, bannière compacte |
| Tablette (640-1024px) | 2 colonnes stats, 2 colonnes actions, 2 colonnes abonnements |
| Desktop (> 1024px) | 4 colonnes stats, 4 colonnes actions, 3 colonnes abonnements, 4 colonnes footer |

---

## Build

```
✓ 40 routes, 0 erreurs
✓ Compilation TypeScript sans erreur
✓ Tous les composants fonctionnels
```

## Comment tester

### Dashboard bancaire (`/dashboard/bank`)

1. Vérifier que `.env.local` contient les credentials Bridge
2. `npm run dev`
3. Se connecter et aller sur `/dashboard/bank`
4. **État vide** : Vérifier l'affichage du CTA "Connecter ma première banque"
5. Cliquer sur "Connecter" → `/dashboard/bank/connect`
6. **Banques populaires** : Vérifier la grille de 5 banques
7. **Recherche** : Taper "BNP" → filtrage en temps réel
8. **Demo Bank** : Section sandbox visible en bas
9. Cliquer sur une banque → Redirection vers Bridge Connect
10. Compléter la connexion → Retour sur `/dashboard/bank` avec toast de succès
11. **Dashboard** : Vérifier stats, carte de banque, comptes expandables
12. **Synchroniser** : Cliquer sur l'icône refresh → toast de succès
13. **Déconnecter** : Cliquer sur l'icône unplug → dialog de confirmation → toast

### Dashboard principal (`/dashboard`)

14. **Nouveau utilisateur** : Se connecter avec un compte sans banque
    - Vérifier la bannière de bienvenue avec prénom
    - Vérifier la carte d'onboarding (3 étapes, étape 1 active)
    - Vérifier le CTA "Connecter ma première banque"
    - Vérifier les badges de sécurité (DSP2, RGPD, chiffrement)
15. **Utilisateur avec banque** : Connecter une banque puis revenir sur `/dashboard`
    - Vérifier que l'étape 1 est marquée "Terminé" ✓
    - Vérifier que l'étape 2 est maintenant active
16. **Utilisateur complet** : Lancer la détection d'abonnements
    - Vérifier les 4 cartes de statistiques (coût, actifs, économies, prochain)
    - Vérifier la grille d'abonnements récents (max 6)
    - Vérifier les graphiques (ligne + camembert)
    - Vérifier les alertes si présentes
17. **Actions rapides** : Tester chaque carte d'action
    - "Mes abonnements" → lien vers la liste
    - "Comptes bancaires" → lien vers banques
    - "Détecter" → bouton avec spinner + toast
    - "Résilier" → lien vers guides
18. **Responsive** : Tester sur mobile, tablette et desktop
    - Vérifier l'empilement des colonnes
    - Vérifier la lisibilité de la bannière
19. **Chargement** : Rafraîchir la page et vérifier le squelette animé
