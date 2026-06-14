export const SERVICES_CATALOG = [
  {
    category: 'Intérieur',
    items: [
      {
        id: 'int-standard',
        label: 'Nettoyage Intérieur / Standard',
        price: 55,
        details: 'Aspiration · Dépoussiérage · Dégraissage vitres & écrans',
        duration: '≈ 1h15',
      },
      {
        id: 'int-intensif',
        label: 'Nettoyage Intérieur / Intensif',
        price: 85,
        details: 'Nettoyage Standard + Plastiques + Tapis + Sièges + Cuirs',
        duration: '≈ 2h30',
      },
      {
        id: 'int-prestige',
        label: 'Nettoyage Intérieur / Prestige',
        price: 135,
        details: 'Nettoyage Intensif + Vapeur + Moquettes + Soins cuirs',
        duration: '≈ 4h',
      },
    ],
  },
  {
    category: 'Extérieur',
    items: [
      {
        id: 'ext-standard',
        label: 'Nettoyage Extérieur / Standard',
        price: 45,
        details: 'Rinçage HP · Lavage main · Jantes · Séchage microfibre · Brillant pneu',
        duration: '≈ 45 min',
      },
      {
        id: 'ext-intensif',
        label: 'Nettoyage Extérieur / Intensif',
        price: 65,
        details: 'Nettoyage Standard + Prélavage + Plastiques + Vitres + Lavage pinceaux',
        duration: '≈ 1h30',
      },
      {
        id: 'ext-prestige',
        label: 'Nettoyage Extérieur / Prestige',
        price: 85,
        details: 'Nettoyage Intensif + Hydrophobe plastiques & carrosserie + Séchage microfibre',
        duration: '≈ 2h15',
      },
    ],
  },
  {
    category: 'Intérieur & Extérieur',
    items: [
      {
        id: 'intext-standard',
        label: 'Nettoyage Intérieur & Extérieur / Standard',
        price: 75,
        details: 'Nettoyage Intérieur Standard + Nettoyage Extérieur Standard',
        duration: '≈ 1h30',
      },
      {
        id: 'intext-intensif',
        label: 'Nettoyage Intérieur & Extérieur / Intensif',
        price: 145,
        details: 'Nettoyage Intérieur Intensif + Nettoyage Extérieur Intensif',
        duration: '≈ 3h30',
      },
      {
        id: 'intext-prestige',
        label: 'Nettoyage Intérieur & Extérieur / Prestige',
        price: 215,
        details: 'Nettoyage Intérieur Prestige + Nettoyage Extérieur Prestige',
        duration: '≈ 5h',
      },
    ],
  },
  {
    category: 'Autres Prestations',
    items: [
      {
        id: 'deux-roues',
        label: 'Nettoyage Deux-Roues',
        price: 65,
        details: 'Lavage complet main · Dégraissage moteur · Séchage souffleur + microfibre · Brillant pneus',
        duration: '≈ 2h',
      },
      {
        id: 'securite',
        label: 'Contrôle Sécurité',
        price: 25,
        details: 'Pression pneus · Contrôle niveaux · Nettoyage et graissage charnières',
        duration: '',
      },
      {
        id: 'anti-pluie-pare-brise',
        label: 'Anti-pluie / Pare-brise seul',
        price: 10,
        details: 'Traitement hydrophobe pare-brise uniquement',
        duration: '',
      },
      {
        id: 'anti-pluie-complet',
        label: 'Anti-pluie / Vitrage complet',
        price: 15,
        details: 'Traitement hydrophobe tous les vitrages',
        duration: '',
      },
      {
        id: 'traitement-cuirs',
        label: 'Traitement Cuirs',
        price: 25,
        details: 'Nettoyage vapeur + Soins nourrissant — prolonge la durée de vie du cuir',
        duration: '',
      },
      {
        id: 'shampooing-sieges',
        label: 'Shampooing Sièges',
        price: 65,
        details: 'Injection / Extraction complet · Traitement Vapeur · Élimine taches, odeurs et saletés incrustées',
        duration: '≈ 1h30',
      },
      {
        id: 'moteur',
        label: 'Nettoyage Moteur',
        price: 45,
        details: 'Nettoyage compartiment moteur · Facilite la vente · Dégraisse / Prévient les fuites',
        duration: '',
      },
    ],
  },
  {
    category: 'Sur Mesure',
    items: [
      {
        id: 'sur-mesure',
        label: 'Prestation Sur Mesure',
        price: 0,
        details: 'Prestation personnalisée — prix défini après évaluation',
        duration: '',
        custom: true,
      },
    ],
  },
]

export const EMETTEUR = {
  name: "CLEAN'IK",
  siret: '92792725100011',
  email: 'cleanik.contact@gmail.com',
  phone: '06 22 77 20 11',
}

export const PAYMENT_INFO = {
  titulaire: 'RAPHAEL KERMOUDI',
  banque: 'Revolut Bank',
  iban: 'FR76 2823 3000 0190 9645 2100 515',
  bic: 'REVOFRP2',
}
