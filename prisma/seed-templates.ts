import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const EMAIL_TEMPLATE = `Objet : Demande de résiliation de mon abonnement

Madame, Monsieur,

Je soussigné(e) {{NOM}}, titulaire du compte associé à l'adresse e-mail {{EMAIL}}, vous prie de bien vouloir procéder à la résiliation de mon abonnement {{SERVICE}} à compter de ce jour.

Conformément aux dispositions légales en vigueur{{LOI}}, je vous demande de confirmer la prise en compte de ma demande et de m'indiquer la date effective de résiliation.

Je vous prie de cesser tout prélèvement sur mon compte à compter de la date de résiliation effective.

Dans l'attente de votre confirmation, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{NOM}}
{{DATE}}`;

const LETTER_TEMPLATE = `{{NOM}}
{{ADRESSE}}
{{CODE_POSTAL}} {{VILLE}}

{{SERVICE_ADRESSE}}

À {{VILLE}}, le {{DATE}}

Objet : Résiliation de mon abonnement — Lettre recommandée avec accusé de réception

Madame, Monsieur,

Par la présente, je vous informe de ma volonté de résilier mon abonnement {{SERVICE}} souscrit à mon nom.

Mes coordonnées :
- Nom : {{NOM}}
- E-mail : {{EMAIL}}
- Numéro client : {{NUM_CLIENT}}

Conformément {{LOI}}, je vous demande de bien vouloir prendre en compte cette résiliation et de me confirmer la date effective de fin de contrat.

Je vous prie de cesser tout prélèvement bancaire lié à cet abonnement à compter de la date de résiliation effective.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Signature : {{NOM}}`;

const templates = [
  {
    merchantName: "Netflix",
    displayName: "Netflix France",
    category: "streaming",
    onlineUrl: "https://www.netflix.com/cancelplan",
    difficulty: "EASY",
    steps: [
      "Connectez-vous à votre compte Netflix",
      "Cliquez sur votre profil en haut à droite",
      "Sélectionnez « Compte »",
      "Cliquez sur « Annuler l'abonnement »",
      "Confirmez l'annulation",
    ],
    requirements: ["Accès à votre compte Netflix"],
    tips: [
      "Vous conservez l'accès jusqu'à la fin de la période payée",
      "Aucun frais de résiliation",
      "Vous pouvez vous réabonner à tout moment",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Spotify",
    displayName: "Spotify",
    category: "streaming",
    onlineUrl: "https://www.spotify.com/account/subscription/",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur spotify.com/account",
      "Dans la section « Votre abonnement », cliquez sur « Modifier l'abonnement »",
      "Sélectionnez « Annuler Premium »",
      "Confirmez l'annulation",
    ],
    requirements: ["Accès à votre compte Spotify"],
    tips: [
      "Vous passez en version gratuite à la fin de la période",
      "Vos playlists sont conservées",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Amazon Prime",
    displayName: "Amazon Prime",
    category: "streaming",
    onlineUrl: "https://www.amazon.fr/gp/primecentral",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur amazon.fr",
      "Allez dans « Compte et listes » → « Abonnement Prime »",
      "Cliquez sur « Gérer mon abonnement »",
      "Sélectionnez « Mettre fin à l'abonnement et aux avantages »",
      "Confirmez l'annulation",
    ],
    requirements: ["Accès à votre compte Amazon"],
    tips: [
      "Amazon peut proposer un remboursement partiel si vous n'avez pas utilisé les avantages",
      "Vous perdez l'accès à Prime Video, livraison gratuite, etc.",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Disney+",
    displayName: "Disney+",
    category: "streaming",
    onlineUrl: "https://www.disneyplus.com/account",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur disneyplus.com",
      "Cliquez sur votre avatar → « Compte »",
      "Dans « Abonnement », cliquez sur le nom de votre forfait",
      "Sélectionnez « Annuler l'abonnement »",
      "Confirmez",
    ],
    requirements: ["Accès à votre compte Disney+"],
    tips: [
      "L'accès reste actif jusqu'à la fin de la période de facturation",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Canal+",
    displayName: "Canal+",
    category: "streaming",
    onlineUrl: "https://www.canalplus.com/mon-compte/",
    emailAddress: "resiliation@canal-plus.com",
    phoneNumber: "09 70 82 08 15",
    postalAddress: "Canal+ Résiliations, TSA 86712, 95905 Cergy-Pontoise Cedex 9",
    difficulty: "HARD",
    requiresCall: false,
    requiresLetter: true,
    noticeRequired: 30,
    steps: [
      "Vérifiez votre date de fin d'engagement dans votre espace client",
      "Si hors engagement : envoyez une lettre recommandée AR ou résiliez en ligne",
      "Si sous engagement : attendez la date de fin ou invoquez la Loi Chatel",
      "Canal+ doit vous notifier 1 mois avant le renouvellement (Loi Chatel)",
      "Conservez l'accusé de réception comme preuve",
    ],
    requirements: [
      "Numéro d'abonné Canal+",
      "Lettre recommandée avec AR (si par courrier)",
    ],
    tips: [
      "Invoquez la Loi Chatel si Canal+ ne vous a pas prévenu du renouvellement",
      "Le préavis est de 30 jours",
      "Vous pouvez aussi résilier via votre espace client en ligne",
    ],
    lawReference: "Loi Chatel / Loi Hamon",
    contractType: "Avec engagement possible",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "Deezer",
    displayName: "Deezer",
    category: "streaming",
    onlineUrl: "https://www.deezer.com/account/subscription",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur deezer.com",
      "Allez dans « Gérer mon abonnement »",
      "Cliquez sur « Résilier mon abonnement »",
      "Confirmez",
    ],
    requirements: ["Accès à votre compte Deezer"],
    tips: ["Vous passez en version gratuite avec publicités"],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Apple",
    displayName: "Apple (iCloud+, Apple Music, Apple TV+)",
    category: "software",
    onlineUrl: "https://support.apple.com/fr-fr/HT202039",
    difficulty: "EASY",
    steps: [
      "Sur iPhone/iPad : Réglages → [votre nom] → Abonnements",
      "Sur Mac : App Store → cliquez sur votre nom → Réglages du compte → Abonnements",
      "Sélectionnez l'abonnement à résilier",
      "Cliquez sur « Annuler l'abonnement »",
    ],
    requirements: ["Appareil Apple ou accès à appleid.apple.com"],
    tips: [
      "Vous pouvez aussi gérer vos abonnements sur appleid.apple.com",
      "L'accès reste actif jusqu'à la fin de la période payée",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Microsoft 365",
    displayName: "Microsoft 365",
    category: "software",
    onlineUrl: "https://account.microsoft.com/services/",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur account.microsoft.com",
      "Allez dans « Services et abonnements »",
      "Trouvez Microsoft 365 et cliquez sur « Gérer »",
      "Sélectionnez « Annuler » ou « Désactiver la facturation récurrente »",
    ],
    requirements: ["Accès à votre compte Microsoft"],
    tips: [
      "Vous conservez l'accès jusqu'à la fin de la période",
      "Vos fichiers OneDrive restent accessibles (dans la limite du stockage gratuit)",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Adobe Creative Cloud",
    displayName: "Adobe Creative Cloud",
    category: "software",
    onlineUrl: "https://account.adobe.com/plans",
    phoneNumber: "0805 540 462",
    difficulty: "MEDIUM",
    requiresCall: false,
    noticeRequired: 14,
    steps: [
      "Connectez-vous sur account.adobe.com",
      "Allez dans « Forfaits et paiement »",
      "Cliquez sur « Gérer le forfait » puis « Annuler le forfait »",
      "Suivez les étapes (Adobe proposera des offres de rétention)",
      "Confirmez l'annulation",
    ],
    requirements: ["Accès à votre compte Adobe"],
    tips: [
      "Attention : des frais de résiliation anticipée peuvent s'appliquer sur les forfaits annuels",
      "Le forfait annuel payé mensuellement entraîne 50% du reste dû en frais",
      "Préférez le forfait mensuel pour plus de flexibilité",
    ],
    lawReference: "Loi Hamon",
    contractType: "Avec engagement annuel possible",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "Free Mobile",
    displayName: "Free Mobile",
    category: "telecom",
    onlineUrl: "https://mobile.free.fr/account/",
    postalAddress: "Free Mobile, 75371 Paris Cedex 08",
    difficulty: "MEDIUM",
    requiresLetter: false,
    noticeRequired: 10,
    steps: [
      "Connectez-vous sur votre espace abonné mobile.free.fr",
      "Allez dans « Mon forfait » → « Résilier »",
      "Ou envoyez une lettre recommandée AR à Free Mobile",
      "Le préavis est de 10 jours",
    ],
    requirements: [
      "Numéro de ligne Free Mobile",
      "RIO (si portabilité vers un autre opérateur)",
    ],
    tips: [
      "Si vous changez d'opérateur, demandez votre code RIO au 3179",
      "La portabilité du numéro entraîne la résiliation automatique",
      "Forfait sans engagement : résiliation à tout moment",
    ],
    lawReference: "Loi Chatel",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "Free",
    displayName: "Free (Freebox)",
    category: "telecom",
    onlineUrl: "https://subscribe.free.fr/login/",
    postalAddress: "Free Résiliation, 75371 Paris Cedex 08",
    difficulty: "MEDIUM",
    requiresLetter: true,
    noticeRequired: 10,
    steps: [
      "Connectez-vous sur votre espace abonné",
      "Allez dans « Mon abonnement » → « Résilier »",
      "Ou envoyez une lettre recommandée AR",
      "Retournez la Freebox et ses accessoires dans les 15 jours",
    ],
    requirements: [
      "Numéro d'abonné Freebox",
      "Lettre recommandée AR (si par courrier)",
    ],
    tips: [
      "Pensez à retourner le matériel pour éviter des frais",
      "Frais de résiliation de 49€ si engagement en cours",
      "Hors engagement : résiliation gratuite avec 10 jours de préavis",
    ],
    lawReference: "Loi Chatel",
    contractType: "Avec engagement possible (12 mois)",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "Orange",
    displayName: "Orange (mobile et internet)",
    category: "telecom",
    onlineUrl: "https://espace-client.orange.fr/",
    phoneNumber: "3900",
    postalAddress: "Orange Service Résiliation, 33732 Bordeaux Cedex 9",
    difficulty: "MEDIUM",
    requiresCall: false,
    requiresLetter: false,
    noticeRequired: 10,
    steps: [
      "Connectez-vous sur votre espace client Orange",
      "Allez dans « Contrats et options »",
      "Sélectionnez « Résilier » sur le contrat souhaité",
      "Ou appelez le 3900 (service client)",
      "Ou envoyez une lettre recommandée AR",
    ],
    requirements: ["Numéro de ligne ou numéro client Orange"],
    tips: [
      "Vérifiez votre date de fin d'engagement",
      "Frais de résiliation anticipée si engagement en cours",
      "Demandez votre RIO au 3179 pour la portabilité",
    ],
    lawReference: "Loi Chatel",
    contractType: "Avec engagement possible",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "SFR",
    displayName: "SFR",
    category: "telecom",
    onlineUrl: "https://www.sfr.fr/mon-espace-client/",
    phoneNumber: "1023",
    postalAddress: "SFR Service Résiliation, TSA 73917, 62978 Arras Cedex 9",
    difficulty: "MEDIUM",
    requiresLetter: false,
    noticeRequired: 10,
    steps: [
      "Connectez-vous sur votre espace client SFR",
      "Allez dans « Mon offre » → « Résilier »",
      "Ou appelez le 1023",
      "Ou envoyez une lettre recommandée AR",
    ],
    requirements: ["Numéro client SFR"],
    tips: [
      "SFR doit vous notifier avant le renouvellement (Loi Chatel)",
      "Frais de résiliation si engagement en cours",
    ],
    lawReference: "Loi Chatel",
    contractType: "Avec engagement possible",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "Bouygues Telecom",
    displayName: "Bouygues Telecom",
    category: "telecom",
    onlineUrl: "https://www.bouyguestelecom.fr/mon-compte",
    phoneNumber: "1064",
    postalAddress: "Bouygues Telecom Service Résiliation, 60436 Noailles Cedex",
    difficulty: "MEDIUM",
    noticeRequired: 10,
    steps: [
      "Connectez-vous sur votre espace client Bouygues",
      "Allez dans « Mon offre » → « Résilier mon offre »",
      "Ou appelez le 1064",
      "Ou envoyez une lettre recommandée AR",
    ],
    requirements: ["Numéro client Bouygues Telecom"],
    tips: [
      "Demandez votre RIO au 3179 pour la portabilité",
      "La portabilité entraîne la résiliation automatique",
    ],
    lawReference: "Loi Chatel",
    contractType: "Avec engagement possible",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "Basic-Fit",
    displayName: "Basic-Fit",
    category: "health",
    onlineUrl: "https://www.basic-fit.com/fr-fr/mon-basic-fit/",
    emailAddress: "serviceclient@basic-fit.fr",
    postalAddress: "Basic-Fit France, 2 rue Berthelot, 92150 Suresnes",
    difficulty: "HARD",
    requiresLetter: true,
    noticeRequired: 30,
    steps: [
      "Vérifiez votre période d'engagement (souvent 12 mois)",
      "Envoyez une lettre recommandée AR à Basic-Fit au moins 1 mois avant la date souhaitée",
      "Ou résiliez via votre espace client en ligne (si disponible)",
      "Conservez l'accusé de réception",
      "Continuez à payer jusqu'à la date effective de résiliation",
    ],
    requirements: [
      "Numéro de membre Basic-Fit",
      "Lettre recommandée avec AR",
    ],
    tips: [
      "L'engagement initial est souvent de 12 mois",
      "Après l'engagement, le préavis est de 1 mois",
      "En cas de déménagement > 30km, résiliation possible sans frais (justificatif requis)",
    ],
    lawReference: "Loi Hamon (après engagement)",
    contractType: "Avec engagement (12 mois)",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "Fitness Park",
    displayName: "Fitness Park",
    category: "health",
    postalAddress: "Fitness Park — adresse de votre club",
    difficulty: "HARD",
    requiresLetter: true,
    noticeRequired: 30,
    steps: [
      "Rendez-vous à l'accueil de votre club Fitness Park",
      "Ou envoyez une lettre recommandée AR à l'adresse de votre club",
      "Respectez le préavis de 30 jours",
      "Conservez l'accusé de réception",
    ],
    requirements: [
      "Numéro de membre",
      "Lettre recommandée AR ou passage en club",
    ],
    tips: [
      "Vérifiez la durée d'engagement sur votre contrat",
      "Motifs légitimes de résiliation anticipée : déménagement, maladie longue durée",
    ],
    lawReference: "Loi Hamon (après engagement)",
    contractType: "Avec engagement possible",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "EDF",
    displayName: "EDF",
    category: "housing",
    onlineUrl: "https://particulier.edf.fr/fr/accueil/espace-client.html",
    phoneNumber: "09 69 32 15 15",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur votre espace client EDF",
      "Allez dans « Mon contrat » → « Résilier »",
      "Ou appelez le 09 69 32 15 15",
      "Indiquez la date souhaitée et le relevé de compteur",
    ],
    requirements: [
      "Numéro de contrat EDF",
      "Relevé de compteur au jour de la résiliation",
      "Nouvelle adresse (si déménagement)",
    ],
    tips: [
      "Aucun frais de résiliation",
      "Résiliez le jour de votre déménagement",
      "Pensez à souscrire chez votre nouveau fournisseur avant de résilier",
    ],
    lawReference: "Sans engagement",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "NordVPN",
    displayName: "NordVPN",
    category: "software",
    onlineUrl: "https://my.nordaccount.com/fr/billing/",
    emailAddress: "support@nordvpn.com",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur my.nordaccount.com",
      "Allez dans « Facturation »",
      "Cliquez sur « Annuler le renouvellement automatique »",
      "Confirmez l'annulation",
    ],
    requirements: ["Accès à votre compte NordVPN"],
    tips: [
      "Garantie satisfait ou remboursé de 30 jours",
      "L'accès reste actif jusqu'à la fin de la période payée",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "YouTube Premium",
    displayName: "YouTube Premium",
    category: "streaming",
    onlineUrl: "https://www.youtube.com/paid_memberships",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur youtube.com",
      "Allez dans « Abonnements payants »",
      "Cliquez sur « Gérer l'abonnement »",
      "Sélectionnez « Annuler l'abonnement »",
    ],
    requirements: ["Accès à votre compte Google"],
    tips: [
      "Vous perdez YouTube Music Premium également",
      "L'accès reste actif jusqu'à la fin de la période",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "ChatGPT Plus",
    displayName: "ChatGPT Plus (OpenAI)",
    category: "software",
    onlineUrl: "https://chat.openai.com/#settings/subscription",
    difficulty: "EASY",
    steps: [
      "Connectez-vous sur chat.openai.com",
      "Cliquez sur votre nom en bas à gauche → « Mon abonnement »",
      "Cliquez sur « Gérer mon abonnement »",
      "Sélectionnez « Annuler le forfait »",
    ],
    requirements: ["Accès à votre compte OpenAI"],
    tips: [
      "Vous repassez en version gratuite",
      "L'accès Plus reste actif jusqu'à la fin de la période",
    ],
    lawReference: "Loi Hamon (sans engagement)",
    contractType: "Sans engagement",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: null,
  },
  {
    merchantName: "MAIF",
    displayName: "MAIF Assurance",
    category: "insurance",
    emailAddress: "sociétaire@maif.fr",
    phoneNumber: "05 49 73 75 00",
    postalAddress: "MAIF, 79038 Niort Cedex 9",
    difficulty: "MEDIUM",
    requiresLetter: true,
    noticeRequired: 60,
    steps: [
      "Vérifiez votre date d'échéance annuelle",
      "Envoyez une lettre recommandée AR au moins 2 mois avant l'échéance",
      "Ou contactez votre conseiller MAIF",
      "Après 1 an : résiliation possible à tout moment (Loi Hamon pour auto/habitation)",
    ],
    requirements: [
      "Numéro de sociétaire MAIF",
      "Lettre recommandée AR",
    ],
    tips: [
      "Loi Hamon : résiliation à tout moment après 1 an pour assurance auto/habitation",
      "Le nouveau assureur peut gérer la résiliation pour vous",
      "Conservez une copie de la lettre et l'AR",
    ],
    lawReference: "Loi Hamon / Loi Chatel",
    contractType: "Avec engagement annuel",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
  {
    merchantName: "AXA",
    displayName: "AXA Assurance",
    category: "insurance",
    phoneNumber: "09 70 80 80 88",
    postalAddress: "AXA France, 313 Terrasses de l'Arche, 92727 Nanterre Cedex",
    difficulty: "MEDIUM",
    requiresLetter: true,
    noticeRequired: 60,
    steps: [
      "Vérifiez votre date d'échéance sur votre contrat",
      "Envoyez une lettre recommandée AR 2 mois avant l'échéance",
      "Ou invoquez la Loi Hamon (après 1 an, pour auto/habitation)",
      "Votre nouvel assureur peut gérer la résiliation",
    ],
    requirements: [
      "Numéro de contrat AXA",
      "Lettre recommandée AR",
    ],
    tips: [
      "Après 1 an : résiliation Loi Hamon sans frais pour auto/habitation",
      "Pour les autres contrats : respectez le préavis de 2 mois avant échéance",
    ],
    lawReference: "Loi Hamon / Loi Chatel",
    contractType: "Avec engagement annuel",
    emailTemplate: EMAIL_TEMPLATE,
    letterTemplate: LETTER_TEMPLATE,
  },
];

async function seed() {
  console.log("Seeding cancellation templates...");

  for (const tpl of templates) {
    await prisma.cancellationTemplate.upsert({
      where: { merchantName: tpl.merchantName },
      update: {
        displayName: tpl.displayName,
        category: tpl.category,
        onlineUrl: tpl.onlineUrl ?? null,
        emailAddress: tpl.emailAddress ?? null,
        phoneNumber: tpl.phoneNumber ?? null,
        postalAddress: tpl.postalAddress ?? null,
        difficulty: tpl.difficulty,
        requiresCall: tpl.requiresCall ?? false,
        requiresLetter: tpl.requiresLetter ?? false,
        noticeRequired: tpl.noticeRequired ?? null,
        emailTemplate: tpl.emailTemplate ?? null,
        letterTemplate: tpl.letterTemplate ?? null,
        steps: tpl.steps,
        requirements: tpl.requirements,
        tips: tpl.tips,
        lawReference: tpl.lawReference ?? null,
        contractType: tpl.contractType ?? null,
      },
      create: {
        merchantName: tpl.merchantName,
        displayName: tpl.displayName,
        category: tpl.category,
        onlineUrl: tpl.onlineUrl ?? null,
        emailAddress: tpl.emailAddress ?? null,
        phoneNumber: tpl.phoneNumber ?? null,
        postalAddress: tpl.postalAddress ?? null,
        difficulty: tpl.difficulty,
        requiresCall: tpl.requiresCall ?? false,
        requiresLetter: tpl.requiresLetter ?? false,
        noticeRequired: tpl.noticeRequired ?? null,
        emailTemplate: tpl.emailTemplate ?? null,
        letterTemplate: tpl.letterTemplate ?? null,
        steps: tpl.steps,
        requirements: tpl.requirements,
        tips: tpl.tips,
        lawReference: tpl.lawReference ?? null,
        contractType: tpl.contractType ?? null,
      },
    });
    console.log(`  ✓ ${tpl.merchantName}`);
  }

  console.log(`\nDone! ${templates.length} templates seeded.`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
