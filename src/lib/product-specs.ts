// Milwaukee Product Specifications Database
// Données techniques précises pour chaque référence produit

export interface ProductSpec {
  title: string;           // Titre SEO optimisé court
  power?: string;          // Puissance principale (Nm, J, W, etc.)
  weight?: string;         // Poids pour les grosses machines
  secondary?: string;      // Spec secondaire (mm, cpm, etc.)
}

// ============================================
// M18 FUEL - Perceuses à percussion
// ============================================
export const M18_FUEL_PERCEUSES: Record<string, ProductSpec> = {
  'M18 FPD3': { title: 'Perceuse à percussion', power: '158 Nm' },
  'M18 FPD2': { title: 'Perceuse à percussion', power: '135 Nm' },
  'M18 FPDX': { title: 'Perceuse à percussion', power: '158 Nm' },
  'M18 ONEPD2': { title: 'Perceuse à percussion', power: '135 Nm' },
  'M18 FPD': { title: 'Perceuse à percussion', power: '135 Nm' },
};

// ============================================
// M18 FUEL - Visseuses à chocs
// ============================================
export const M18_FUEL_VISSEUSES_CHOCS: Record<string, ProductSpec> = {
  'M18 FID3': { title: 'Visseuse à chocs', power: '226 Nm' },
  'M18 FID2': { title: 'Visseuse à chocs', power: '203 Nm' },
  'M18 ONEFID': { title: 'Visseuse à chocs', power: '203 Nm' },
  'M18 FID': { title: 'Visseuse à chocs', power: '180 Nm' },
  'M18 FQID': { title: 'Visseuse à chocs', power: '135 Nm' },
};

// ============================================
// M18 FUEL - Boulonneuses
// ============================================
export const M18_FUEL_BOULONNEUSES: Record<string, ProductSpec> = {
  // 1 pouce
  'M18 ONEFHIWF1': { title: 'Boulonneuse 1 pouce', power: '2033 Nm' },
  'M18 FHIWF1': { title: 'Boulonneuse 1 pouce', power: '2033 Nm' },
  // 3/4 pouce
  'M18 ONEFHIWF34': { title: 'Boulonneuse 3/4 de pouce', power: '1627 Nm' },
  'M18 FHIWF34': { title: 'Boulonneuse 3/4 de pouce', power: '1627 Nm' },
  // 1/2 pouce
  'M18 FMTIW2F12': { title: 'Boulonneuse 1/2 pouce', power: '1356 Nm' },
  'M18 FMTIWF12': { title: 'Boulonneuse 1/2 pouce', power: '881 Nm' },
  'M18 FMTIW2P12': { title: 'Boulonneuse 1/2 pouce', power: '745 Nm' },
  'M18 FIW2F12': { title: 'Boulonneuse 1/2 pouce', power: '339 Nm' },
  'M18 FIW2P12': { title: 'Boulonneuse 1/2 pouce', power: '339 Nm' },
  'M18 CHIW': { title: 'Boulonneuse 1/2 pouce', power: '610 Nm' },
  'M18 CHIWF': { title: 'Boulonneuse 1/2 pouce', power: '610 Nm' },
  'M18 CHIWP': { title: 'Boulonneuse 1/2 pouce', power: '480 Nm' },
  // 3/8 pouce
  'M18 FMTIW2F38': { title: 'Boulonneuse 3/8 de pouce', power: '881 Nm' },
  'M18 FIW2F38': { title: 'Boulonneuse 3/8 de pouce', power: '271 Nm' },
};

// ============================================
// M18 FUEL - Clés à cliquet
// ============================================
export const M18_FUEL_CLIQUETS: Record<string, ProductSpec> = {
  'M18 FHIR': { title: 'Clé à cliquet 1/2 pouce', power: '340 Nm' },
  'M18 FIR': { title: 'Clé à cliquet 1/2 pouce', power: '271 Nm' },
  'M18 FTR': { title: 'Clé à cliquet 3/8 de pouce', power: '203 Nm' },
};

// ============================================
// M18 FUEL - Perforateurs SDS-Plus
// ============================================
export const M18_FUEL_PERFO_SDS_PLUS: Record<string, ProductSpec> = {
  'M18 ONEFHPX': { title: 'Perfo-burineur SDS-Plus', power: '3.5 J' },
  'M18 FHPX': { title: 'Perfo-burineur SDS-Plus', power: '3.5 J' },
  'M18 FHP': { title: 'Perfo-burineur SDS-Plus', power: '2.0 J' },
  'M18 FH': { title: 'Perfo-burineur SDS-Plus', power: '2.5 J' },
  'M18 CHX': { title: 'Perfo-burineur SDS-Plus', power: '5.0 J' },
  'M18 CHPX': { title: 'Perfo-burineur SDS-Plus', power: '4.0 J' },
  'M18 CH': { title: 'Perfo-burineur SDS-Plus', power: '2.5 J' },
};

// ============================================
// M18 FUEL - Perforateurs SDS-Max
// ============================================
export const M18_FUEL_PERFO_SDS_MAX: Record<string, ProductSpec> = {
  'M18 ONEFHX': { title: 'Perfo-burineur SDS-Max', power: '12.5 J', weight: '7.4 kg' },
  'M18 FHX': { title: 'Perfo-burineur SDS-Max', power: '12.5 J', weight: '7.4 kg' },
  'M18 FHM': { title: 'Perfo-burineur SDS-Max', power: '9.0 J', weight: '6.5 kg' },
};

// ============================================
// M18 FUEL - Marteaux démolisseurs (Burineurs)
// ============================================
export const M18_FUEL_DEMOLISSEURS: Record<string, ProductSpec> = {
  'M18 FBHX': { title: 'Burineur SDS-Max', power: '8.0 J', weight: '6.8 kg' },
  'M18 FBH': { title: 'Burineur SDS-Max', power: '6.0 J', weight: '5.9 kg' },
};

// ============================================
// M18 FUEL - Meuleuses
// ============================================
export const M18_FUEL_MEULEUSES: Record<string, ProductSpec> = {
  // 230mm
  'M18 FLAG230': { title: 'Meuleuse 230 mm', power: '230 mm' },
  'M18 FSAG230': { title: 'Meuleuse 230 mm', power: '230 mm' },
  // 180mm
  'M18 FLAG180': { title: 'Meuleuse 180 mm', power: '180 mm' },
  // 125mm
  'M18 FSAG125': { title: 'Meuleuse 125 mm', power: '125 mm' },
  'M18 FHSAG125': { title: 'Meuleuse 125 mm', power: '125 mm' },
  'M18 FCAG125XPD': { title: 'Meuleuse 125 mm', power: '125 mm' },
  'M18 CAG125XPD': { title: 'Meuleuse 125 mm', power: '125 mm' },
  'M18 CAG125X': { title: 'Meuleuse 125 mm', power: '125 mm' },
  // 115mm
  'M18 CAG115': { title: 'Meuleuse 115 mm', power: '115 mm' },
  // Droite
  'M18 FDGROVPDX': { title: 'Meuleuse droite', power: '25000 rpm' },
  'M18 FDGRPD': { title: 'Meuleuse droite', power: '25000 rpm' },
};

// ============================================
// M18 FUEL - Scies circulaires
// ============================================
export const M18_FUEL_SCIES_CIRCULAIRES: Record<string, ProductSpec> = {
  'M18 FCS66': { title: 'Scie circulaire', power: '4500 rpm', secondary: '190 mm', weight: '4.1 kg' },
  'M18 FCCS55': { title: 'Scie circulaire compacte', power: '4200 rpm', secondary: '165 mm', weight: '3.4 kg' },
  'M18 CCS55': { title: 'Scie circulaire', power: '4200 rpm', secondary: '165 mm', weight: '3.2 kg' },
  'M18 BLCS66': { title: 'Scie circulaire', power: '4500 rpm', secondary: '190 mm', weight: '4.0 kg' },
  'M18 FPS55': { title: 'Scie plongeante', power: '4400 rpm', secondary: '165 mm', weight: '3.8 kg' },
};

// ============================================
// M18 FUEL - Scies à onglet
// ============================================
export const M18_FUEL_SCIES_ONGLET: Record<string, ProductSpec> = {
  'M18 FMS305': { title: 'Scie à onglet radiale', power: '4000 rpm', secondary: '305 mm', weight: '23 kg' },
  'M18 FMS254': { title: 'Scie à onglet radiale', power: '4500 rpm', secondary: '254 mm', weight: '18 kg' },
  'M18 FMS190': { title: 'Scie à onglet', power: '5000 rpm', secondary: '190 mm', weight: '14 kg' },
};

// ============================================
// M18 FUEL - Scies sabres
// ============================================
export const M18_FUEL_SCIES_SABRES: Record<string, ProductSpec> = {
  'M18 ONEFSZ': { title: 'Scie sabre SAWZALL ONE-KEY', power: '3000 cpm', weight: '4.2 kg' },
  'M18 FSZ': { title: 'Scie sabre SAWZALL', power: '3000 cpm', weight: '4.0 kg' },
  'M18 CSX': { title: 'Scie sabre HACKZALL', power: '3000 cpm', weight: '2.5 kg' },
};

// ============================================
// M18 FUEL - Scies sauteuses
// ============================================
export const M18_FUEL_SCIES_SAUTEUSES: Record<string, ProductSpec> = {
  'M18 FJS': { title: 'Scie sauteuse', power: '3500 cpm', weight: '2.8 kg' },
  'M18 BJS': { title: 'Scie sauteuse', power: '2700 cpm', weight: '2.5 kg' },
};

// ============================================
// M18 FUEL - Scies à ruban
// ============================================
export const M18_FUEL_SCIES_RUBAN: Record<string, ProductSpec> = {
  'M18 FBS': { title: 'Scie à ruban', power: '110 m/min', secondary: '127 mm', weight: '5.5 kg' },
  'M18 CBS': { title: 'Scie à ruban compacte', power: '90 m/min', secondary: '127 mm', weight: '3.8 kg' },
  'M18 DBS': { title: 'Scie à ruban', power: '110 m/min', secondary: '127 mm', weight: '4.2 kg' },
};

// ============================================
// M18 FUEL - Rainureuses
// ============================================
export const M18_FUEL_RAINUREUSES: Record<string, ProductSpec> = {
  'M18 FCSG140': { title: 'Rainureuse', power: '7500 rpm', secondary: '140 mm', weight: '5.8 kg' },
  'M18 FWCS': { title: 'Rainureuse murale', power: '7500 rpm', secondary: '125 mm', weight: '5.2 kg' },
};

// ============================================
// M18 FUEL - Ponceuses
// ============================================
export const M18_FUEL_PONCEUSES: Record<string, ProductSpec> = {
  'M18 FBOS': { title: 'Ponceuse excentrique', power: '12000 opm', secondary: '125 mm', weight: '2.1 kg' },
  'M18 FOR': { title: 'Ponceuse orbitale', power: '10000 opm', secondary: '150 mm', weight: '2.4 kg' },
  'M18 FDOS': { title: 'Ponceuse delta', power: '11000 opm', weight: '1.8 kg' },
  'M18 FBPS': { title: 'Ponceuse à bande', power: '400 m/min', secondary: '76 x 457 mm', weight: '5.2 kg' },
};

// ============================================
// M18 FUEL - Rabots
// ============================================
export const M18_FUEL_RABOTS: Record<string, ProductSpec> = {
  'M18 FBL': { title: 'Rabot', power: '15000 rpm', secondary: '82 mm', weight: '3.5 kg' },
};

// ============================================
// M18 FUEL - Défonceuses / Affleureuses
// ============================================
export const M18_FUEL_DEFONCEUSES: Record<string, ProductSpec> = {
  'M18 FR12': { title: 'Défonceuse 1/2"', power: '25000 rpm', weight: '4.8 kg' },
  'M18 FR': { title: 'Défonceuse', power: '24000 rpm', weight: '4.2 kg' },
  'M18 FTR': { title: 'Affleureuse', power: '31000 rpm', weight: '1.8 kg' },
};

// ============================================
// M18 FUEL - Cloueuses / Agrafeuses
// ============================================
export const M18_FUEL_CLOUEUSES: Record<string, ProductSpec> = {
  // Cloueuses à rouleaux (charpente)
  'M18 FFN21': { title: 'Cloueuse à rouleaux', power: '21° | 50-90 mm' },
  'M18 FFN': { title: 'Cloueuse à rouleaux', power: '21° | 50-90 mm' },
  // Cloueuses de finition
  'M18 FN18GS': { title: 'Cloueuse de finition', power: '18 Ga | 16-57 mm' },
  'M18 FN15GA': { title: 'Cloueuse de finition', power: '15 Ga | 32-65 mm' },
  'M18 FN15G': { title: 'Cloueuse de finition', power: '15 Ga | 32-65 mm' },
  // Cloueuse à broches
  'M18 FBPN': { title: 'Cloueuse de finition', power: '23 Ga | 12-50 mm' },
  // Agrafeuses
  'M18 FNCS': { title: 'Agrafeuse clôture', power: '9 Ga | 38 mm' },
  'M18 FST': { title: 'Agrafeuse', power: '18 Ga | 19-38 mm' },
  // Cloueur duplex
  'M18 FDSN': { title: 'Cloueur duplex', power: '8d-16d' },
};

// ============================================
// M18 FUEL - Riveteuses / Sertisseuses
// ============================================
export const M18_FUEL_RIVETEUSES: Record<string, ProductSpec> = {
  'M18 FMPR': { title: 'Riveteuse', power: '22 kN', secondary: 'Ø6.4 mm', weight: '3.1 kg' },
  'M18 BPRT': { title: 'Riveteuse', power: '14 kN', secondary: 'Ø4.8 mm', weight: '2.6 kg' },
  'M18 BLHPT': { title: 'Sertisseuse', power: '53 kN', weight: '3.8 kg' },
  'M18 ONEBLHPT': { title: 'Sertisseuse ONE-KEY', power: '53 kN', weight: '3.9 kg' },
};

// ============================================
// M18 FUEL - Coupe-tubes / Coupe-câbles
// ============================================
export const M18_FUEL_COUPES: Record<string, ProductSpec> = {
  'M18 FHCSC': { title: 'Coupe-câble', power: '53 kN', secondary: 'Ø55 mm', weight: '4.5 kg' },
  'M18 HCC': { title: 'Coupe-câble hydraulique', power: '120 kN', secondary: 'Ø85 mm', weight: '7.2 kg' },
  'M18 BLTRC': { title: 'Coupe-tube', power: 'Ø75 mm', weight: '3.8 kg' },
  'M18 FHIWF12RC': { title: 'Coupe fer à béton', power: 'Ø16 mm', weight: '5.2 kg' },
  'M18 ONEHCC': { title: 'Coupe-câble ONE-KEY', power: '120 kN', secondary: 'Ø85 mm', weight: '7.5 kg' },
};

// ============================================
// M18 FUEL - Outils multifonctions
// ============================================
export const M18_FUEL_MULTIFONCTIONS: Record<string, ProductSpec> = {
  'M18 FMT': { title: 'Outil multifonction', power: '20000 opm', weight: '1.8 kg' },
  'M18 BMT': { title: 'Outil multifonction', power: '18000 opm', weight: '1.6 kg' },
};

// ============================================
// M18 FUEL - Polisseuses
// ============================================
export const M18_FUEL_POLISSEUSES: Record<string, ProductSpec> = {
  'M18 FAP180': { title: 'Polisseuse rotative', power: '2800 rpm', secondary: '180 mm', weight: '3.2 kg' },
  'M18 FROP': { title: 'Polisseuse orbitale', power: '2200 rpm', secondary: '150 mm', weight: '2.8 kg' },
};

// ============================================
// M18 FUEL - Carotteuses
// ============================================
export const M18_FUEL_CAROTTEUSES: Record<string, ProductSpec> = {
  'M18 FDDEL': { title: 'Carotteuse diamant', power: 'Ø152 mm' },
  'M18 FDDEXL': { title: 'Carotteuse diamant', power: 'Ø202 mm' },
};

// ============================================
// M18 FUEL - Perceuses magnétiques
// ============================================
export const M18_FUEL_PERCEUSES_MAGNETIQUES: Record<string, ProductSpec> = {
  'M18 FMDP': { title: 'Perceuse magnétique', power: 'Aimant permanent' },
};

// ============================================
// M18 FUEL - Pompes / Pulvérisateurs
// ============================================
export const M18_FUEL_POMPES: Record<string, ProductSpec> = {
  'M18 FCFN': { title: 'Pompe à graisse', power: '690 bar', weight: '4.2 kg' },
  'M18 GG': { title: 'Pistolet graisse', power: '690 bar', weight: '3.8 kg' },
  'M18 BFWS': { title: 'Pulvérisateur', power: '1.5 bar', secondary: '15 L', weight: '5.2 kg' },
  'M18 FBPV': { title: 'Pompe à vide', power: '71 L/min', weight: '4.8 kg' },
};

// ============================================
// M18 FUEL - Décapeurs / Pistolets à chaleur
// ============================================
export const M18_FUEL_DECAPEURS: Record<string, ProductSpec> = {
  'M18 BHG': { title: 'Décapeur thermique', power: '550°C', weight: '1.2 kg' },
};

// ============================================
// M18 FUEL - Visseuses spéciales
// ============================================
export const M18_FUEL_VISSEUSES_SPECIALES: Record<string, ProductSpec> = {
  // Visseuses placo
  'M18 FSG': { title: 'Visseuse placo', power: '26 Nm' },
  'M18 FSGC': { title: 'Visseuse placo', power: '26 Nm' },
  // Visseuses d'angle
  'M18 FRAD': { title: 'Visseuse d\'angle', power: '135 Nm' },
  'M18 BRAID': { title: 'Visseuse d\'angle', power: '110 Nm' },
  // Visseuses d'angle à chocs
  'M18 FRADID': { title: 'Visseuse d\'angle à chocs', power: '203 Nm' },
  // Visseuses autoforeuses
  'M18 ONEFLTBD': { title: 'Visseuse autoforeuse', power: '7 Nm' },
  'M18 FLTBD': { title: 'Visseuse autoforeuse', power: '7 Nm' },
};

// ============================================
// M18 Brushless (non-FUEL)
// ============================================
export const M18_BRUSHLESS: Record<string, ProductSpec> = {
  'M18 BLPD2': { title: 'Perceuse à percussion', power: '82 Nm' },
  'M18 BLDD2': { title: 'Perceuse-visseuse', power: '60 Nm' },
  'M18 BLPD': { title: 'Perceuse à percussion', power: '82 Nm' },
  'M18 BLDD': { title: 'Perceuse-visseuse', power: '60 Nm' },
  'M18 BLID2': { title: 'Visseuse à chocs', power: '180 Nm' },
  'M18 BLID': { title: 'Visseuse à chocs', power: '180 Nm' },
};

// ============================================
// M12 FUEL - Perceuses
// ============================================
export const M12_FUEL_PERCEUSES: Record<string, ProductSpec> = {
  'M12 FPDX': { title: 'Perceuse à percussion', power: '45 Nm' },
  'M12 FPD': { title: 'Perceuse à percussion', power: '45 Nm' },
  'M12 FDD': { title: 'Perceuse-visseuse', power: '35 Nm' },
  'M12 FDDX': { title: 'Perceuse-visseuse', power: '35 Nm' },
};

// ============================================
// M12 FUEL - Visseuses à chocs
// ============================================
export const M12_FUEL_VISSEUSES_CHOCS: Record<string, ProductSpec> = {
  'M12 FID2': { title: 'Visseuse à chocs', power: '163 Nm' },
  'M12 FID': { title: 'Visseuse à chocs', power: '163 Nm' },
  'M12 FQID': { title: 'Visseuse à chocs', power: '135 Nm' },
};

// ============================================
// M12 FUEL - Boulonneuses / Clés à cliquet
// ============================================
export const M12_FUEL_BOULONNEUSES: Record<string, ProductSpec> = {
  'M12 FIWF12': { title: 'Boulonneuse 1/2 pouce', power: '339 Nm' },
  'M12 FHIR': { title: 'Clé à cliquet 1/2 pouce', power: '102 Nm' },
  'M12 FIR': { title: 'Clé à cliquet 3/8 de pouce', power: '68 Nm' },
  'M12 FIR14': { title: 'Clé à cliquet 1/4 de pouce', power: '47 Nm' },
};

// ============================================
// M12 FUEL - Perforateurs
// ============================================
export const M12_FUEL_PERFORATEURS: Record<string, ProductSpec> = {
  'M12 FH': { title: 'Perfo-burineur SDS-Plus', power: '1.4 J' },
  'M12 CH': { title: 'Perfo-burineur SDS-Plus', power: '1.1 J' },
};

// ============================================
// M12 FUEL - Meuleuses
// ============================================
export const M12_FUEL_MEULEUSES: Record<string, ProductSpec> = {
  'M12 FCOT': { title: 'Meuleuse droite', power: '20000 rpm', secondary: '76 mm', weight: '1.0 kg' },
  'M12 FDGA': { title: 'Meuleuse droite', power: '25000 rpm', weight: '1.1 kg' },
};

// ============================================
// M12 FUEL - Scies
// ============================================
export const M12_FUEL_SCIES: Record<string, ProductSpec> = {
  'M12 FJS': { title: 'Scie sauteuse', power: '3000 cpm', weight: '1.5 kg' },
  'M12 FHS': { title: 'Scie sabre HACKZALL', power: '3000 cpm', weight: '1.3 kg' },
  'M12 FBS64': { title: 'Scie à ruban', power: '90 m/min', secondary: '64 mm', weight: '3.2 kg' },
  'M12 FCCS': { title: 'Scie circulaire', power: '3400 rpm', secondary: '140 mm', weight: '2.6 kg' },
  'M12 FMCS': { title: 'Scie à métaux', power: '3400 rpm', secondary: '57 mm', weight: '2.3 kg' },
};

// ============================================
// M12 FUEL - Outils spéciaux
// ============================================
export const M12_FUEL_OUTILS_SPECIAUX: Record<string, ProductSpec> = {
  'M12 FMT': { title: 'Outil multifonction', power: '20000 opm', weight: '1.1 kg' },
  'M12 FTR': { title: 'Affleureuse', power: '31000 rpm', weight: '1.3 kg' },
  'M12 FBS': { title: 'Ponceuse à bande', power: '370 m/min', secondary: '9 x 533 mm', weight: '1.4 kg' },
  'M12 BOS': { title: 'Ponceuse excentrique', power: '11000 opm', secondary: '125 mm', weight: '1.2 kg' },
  'M12 BPRT': { title: 'Riveteuse', power: '10 kN', secondary: 'Ø4.8 mm', weight: '1.8 kg' },
  'M12 BST': { title: 'Agrafeuse', power: '16 Ga', weight: '1.5 kg' },
  'M12 PCG': { title: 'Pistolet à colle', power: '310 ml', weight: '1.4 kg' },
};

// ============================================
// M12 Brushless (non-FUEL)
// ============================================
export const M12_BRUSHLESS: Record<string, ProductSpec> = {
  'M12 BLPD': { title: 'Perceuse à percussion', power: '40 Nm' },
  'M12 BLDD': { title: 'Perceuse-visseuse', power: '30 Nm' },
  'M12 BAID': { title: 'Visseuse d\'angle', power: '75 Nm' },
};

// ============================================
// MX FUEL - Gros outillage
// ============================================
export const MX_FUEL: Record<string, ProductSpec> = {
  // Perforateurs / Démolisseurs
  'MX FUEL DH': { title: 'Perfo-burineur SDS-Max', power: '9.0 J', weight: '11.5 kg' },
  'MX FUEL DHB': { title: 'Perfo-burineur SDS-Max', power: '20.0 J', weight: '14.8 kg' },
  'MX FUEL DB': { title: 'Burineur grande puissance', power: '25.0 J', weight: '16.2 kg' },
  // Carotteuse
  'MX FUEL DCD150': { title: 'Carotteuse diamant', power: 'Ø150 mm', weight: '18.5 kg' },
  'MX FUEL DCD250': { title: 'Carotteuse diamant', power: 'Ø250 mm', weight: '22.0 kg' },
  // Découpeuse
  'MX FUEL COS': { title: 'Découpeuse', power: '6700 rpm', secondary: '355 mm', weight: '9.8 kg' },
  // Tronçonneuse béton
  'MX FUEL CCS': { title: 'Tronçonneuse béton', power: 'Ø350 mm', weight: '10.5 kg' },
  // Vibrateur béton
  'MX FUEL CVBC': { title: 'Vibrateur béton', power: '12000 vpm', secondary: 'Ø45 mm', weight: '8.2 kg' },
  // Scie
  'MX FUEL MCS': { title: 'Scie à métaux', power: '120 m/min', secondary: '360 mm', weight: '14.2 kg' },
  // Générateur
  'MX FUEL CARRY ON': { title: 'Station énergie', power: '3600 W', weight: '26 kg' },
  // Compresseur
  'MX FUEL MAC': { title: 'Compresseur', power: '7 bar', secondary: '23 L', weight: '38 kg' },
  // Chariot
  'MX FUEL PRB': { title: 'Brouette motorisée', power: '130 kg', weight: '85 kg' },
  // Éclairage
  'MX FUEL TL': { title: 'Tour d\'éclairage', power: '27000 lm', weight: '45 kg' },
  // Pompe
  'MX FUEL SWP': { title: 'Pompe submersible', power: '340 L/min', weight: '12 kg' },
};

// ============================================
// FILAIRES - Perforateurs
// ============================================
export const FILAIRE_PERFORATEURS: Record<string, ProductSpec> = {
  // SDS-Plus (juste les Joules)
  'PH 30 POWER X': { title: 'Perfo-burineur SDS-Plus', power: '6.1 J' },
  'PH 28': { title: 'Perfo-burineur SDS-Plus', power: '4.8 J' },
  'PH 28 X': { title: 'Perfo-burineur SDS-Plus', power: '4.8 J' },
  'PH 27': { title: 'Perfo-burineur SDS-Plus', power: '3.8 J' },
  'PH 27 X': { title: 'Perfo-burineur SDS-Plus', power: '3.8 J' },
  'PH 26': { title: 'Perfo-burineur SDS-Plus', power: '3.0 J' },
  'PH 26 X': { title: 'Perfo-burineur SDS-Plus', power: '3.0 J' },
  'PLH 32': { title: 'Perfo-burineur SDS-Plus', power: '4.8 J' },
  'PLH 32 XE': { title: 'Perfo-burineur SDS-Plus', power: '4.8 J' },
  // SDS-Max / Kango (Joules + kg)
  'K 850 S': { title: 'Perfo-burineur SDS-Max', power: '10.0 J', weight: '8.5 kg' },
  'K 750 S': { title: 'Perfo-burineur SDS-Max', power: '7.5 J', weight: '6.8 kg' },
  'K 545 S': { title: 'Perfo-burineur SDS-Max', power: '6.0 J', weight: '5.9 kg' },
  'K 500 ST': { title: 'Perfo-burineur SDS-Max', power: '5.5 J', weight: '5.6 kg' },
  'KANGO 900 S': { title: 'Burineur SDS-Max', power: '14.3 J', weight: '10.2 kg' },
  'KANGO 900 K': { title: 'Burineur SDS-Max', power: '14.3 J', weight: '10.2 kg' },
  'KANGO 950 S': { title: 'Burineur SDS-Max', power: '16.5 J', weight: '11.0 kg' },
};

// ============================================
// FILAIRES - Meuleuses
// ============================================
export const FILAIRE_MEULEUSES: Record<string, ProductSpec> = {
  // 230mm
  'AGV 26-230 GEX': { title: 'Meuleuse 230 mm', power: '2600 W' },
  'AGV 24-230 GE': { title: 'Meuleuse 230 mm', power: '2400 W' },
  'AGV 22-230 DMS': { title: 'Meuleuse 230 mm', power: '2200 W' },
  'AGV 22-230 E': { title: 'Meuleuse 230 mm', power: '2200 W' },
  'AG 22-230 DMS': { title: 'Meuleuse 230 mm', power: '2200 W' },
  'AG 22-230 E': { title: 'Meuleuse 230 mm', power: '2200 W' },
  // 180mm
  'AGV 21-180 GEX': { title: 'Meuleuse 180 mm', power: '2100 W' },
  'AGV 17-180 XC': { title: 'Meuleuse 180 mm', power: '1750 W' },
  // 150mm
  'AGV 15-150 XC': { title: 'Meuleuse 150 mm', power: '1550 W' },
  'AG 16-150 XC': { title: 'Meuleuse 150 mm', power: '1600 W' },
  // 125mm
  'AGV 15-125 XE': { title: 'Meuleuse 125 mm', power: '1550 W' },
  'AGV 13-125 XE': { title: 'Meuleuse 125 mm', power: '1250 W' },
  'AGV 12-125 X': { title: 'Meuleuse 125 mm', power: '1200 W' },
  'AGV 10-125 EK': { title: 'Meuleuse 125 mm', power: '1000 W' },
  'AG 800-125 E': { title: 'Meuleuse 125 mm', power: '800 W' },
  // 115mm
  'AG 800-115 E': { title: 'Meuleuse 115 mm', power: '800 W' },
};

// ============================================
// FILAIRES - Perceuses
// ============================================
export const FILAIRE_PERCEUSES: Record<string, ProductSpec> = {
  'PD2E 24 R': { title: 'Perceuse à percussion', power: '1020 W' },
  'PD2E 24 RST': { title: 'Perceuse à percussion', power: '1020 W' },
  'PD2E 22 R': { title: 'Perceuse à percussion', power: '850 W' },
  'PD2E 22 RST': { title: 'Perceuse à percussion', power: '850 W' },
  'PD2E 16 R': { title: 'Perceuse à percussion', power: '630 W' },
  'DE 12': { title: 'Perceuse', power: '545 W' },
  'DE 14 RQX': { title: 'Perceuse', power: '710 W' },
};

// ============================================
// FILAIRES - Scies
// ============================================
export const FILAIRE_SCIES: Record<string, ProductSpec> = {
  // Scies sabres
  'SSPE 1500 X': { title: 'Scie sabre SAWZALL', power: '1500 W', secondary: '3000 cpm', weight: '4.8 kg' },
  'SSPE 1300': { title: 'Scie sabre SAWZALL', power: '1300 W', secondary: '2800 cpm', weight: '4.2 kg' },
  // Scies circulaires
  'SCS 65 Q': { title: 'Scie circulaire', power: '1400 W', secondary: '190 mm', weight: '4.5 kg' },
  'CS 60': { title: 'Scie circulaire', power: '1400 W', secondary: '184 mm', weight: '4.2 kg' },
  // Scies sauteuses
  'JS 120 X': { title: 'Scie sauteuse', power: '710 W', secondary: '3500 cpm', weight: '2.8 kg' },
  // Scies à onglet
  'MS 305 DB': { title: 'Scie à onglet', power: '1800 W', secondary: '305 mm', weight: '25 kg' },
  'MS 216 SB': { title: 'Scie à onglet', power: '1650 W', secondary: '216 mm', weight: '18 kg' },
  // Scie sur table
  'TS 2004': { title: 'Scie sur table', power: '2000 W', secondary: '254 mm', weight: '35 kg' },
};

// ============================================
// FILAIRES - Carotteuses
// ============================================
export const FILAIRE_CAROTTEUSES: Record<string, ProductSpec> = {
  'DCE 94': { title: 'Carotteuse diamant', power: 'Ø152 mm' },
  'DD 2-160 XE': { title: 'Carotteuse diamant', power: 'Ø162 mm' },
  'DCE 120': { title: 'Carotteuse diamant', power: 'Ø200 mm' },
};

// ============================================
// ASPIRATEURS
// ============================================
export const ASPIRATEURS: Record<string, ProductSpec> = {
  // M18 FUEL - Aspirateurs cuve
  'M18 FPOVCL': { title: 'Aspirateur PACKOUT™', power: '1416 L/min', secondary: '9.5 L', weight: '5.15 kg' },
  'M18 VC2': { title: 'Aspirateur eau & poussières', power: '1300 L/min', secondary: '7.5 L', weight: '5.3 kg' },
  'M18 F2VC23L': { title: 'Aspirateur 23 L classe L', power: '3086 L/min', secondary: '23 L', weight: '11.5 kg' },
  'M18 F2VC23LG2': { title: 'Aspirateur NEXUS™ 23 L', power: '3267 L/min', secondary: '23 L', weight: '12 kg' },
  'M18 FVC23L': { title: 'Aspirateur 23 L classe L', power: '2700 L/min', secondary: '23 L', weight: '11.5 kg' },
  'M18 ONEF2VC34M': { title: 'Aspirateur ONE-KEY™ 34 L', power: '2550 L/min', secondary: '34 L', weight: '14 kg' },
  // M18 FUEL - Aspirateurs dorsaux
  'M18 FBPV': { title: 'Aspirateur dorsal', power: '1557 L/min', secondary: '3.8 L', weight: '8 kg' },
  'M18 FBPV2': { title: 'Aspirateur dorsal Gen 2', power: '1980 L/min', secondary: '3.8 L', weight: '8 kg' },
  // M18 - Aspirateur compact
  'M18 CV': { title: 'Aspirateur compact', power: '1019 L/min', secondary: '1.35 L', weight: '1.2 kg' },
  // M18 FUEL - Systèmes d'aspiration
  'M18 FCDDEXL': { title: 'Extraction SDS+ AUTOPULSE™', power: 'Ø26 mm', weight: '1.9 kg' },
  'M18 FPDDEXL': { title: 'Extraction SDS+ AUTOPULSE™', power: 'Ø32 mm', weight: '2 kg' },
  'M18 FDDEL32': { title: 'Extraction SDS+ Ø32 mm', power: 'Ø32 mm', weight: '1.9 kg' },
  'M18 FDDEC': { title: 'Extraction SDS+ compacte', power: 'Ø16 mm', weight: '0.9 kg' },
  // M18 Brushless - Système d'aspiration
  'M18 CDEX': { title: 'Extraction SDS-Plus', power: '90 mm prof.', weight: '1.6 kg' },
  // M12 FUEL
  'M12 FVCL': { title: 'Aspirateur eau & poussière', power: '1275 L/min', secondary: '6.1 L', weight: '5 kg' },
  // M12
  'M12 HV': { title: 'Aspirateur compact', power: '934 L/min', weight: '1.2 kg' },
  'M12 UDEL': { title: 'Extraction perforateur SDS', power: 'Ø30 mm', weight: '2.2 kg' },
  // Filaires - Aspirateurs cuve
  'AS 2-250 ELCP': { title: 'Aspirateur 25 L classe L', power: '1000 W', secondary: '25 L', weight: '10.4 kg' },
  'AS 2-250EH': { title: 'Aspirateur 25 L classe H', power: '1200 W', secondary: '25 L', weight: '8 kg' },
  'AS 2-250EM': { title: 'Aspirateur 25 L classe M', power: '1200 W', secondary: '25 L', weight: '8 kg' },
  'AS 30 LAC': { title: 'Aspirateur 30 L classe L', power: '1200 W', secondary: '30 L', weight: '14.5 kg' },
  'AS 30 MAC': { title: 'Aspirateur 30 L classe M', power: '1200 W', secondary: '30 L', weight: '14.5 kg' },
  'AS 300 ELCP': { title: 'Aspirateur 30 L classe L', power: '1500 W', secondary: '30 L', weight: '10 kg' },
  'AS 42 MAC': { title: 'Aspirateur 42 L classe M', power: '1200 W', secondary: '42 L', weight: '17.5 kg' },
  'AS 500': { title: 'Aspirateur', power: '1500 W', secondary: '50 L', weight: '15 kg' },
  'AS 300 EMAC': { title: 'Aspirateur classe M', power: '1500 W', secondary: '30 L', weight: '12 kg' },
  'AS 300 ELAC': { title: 'Aspirateur classe L', power: '1500 W', secondary: '30 L', weight: '11 kg' },
};

// ============================================
// ECLAIRAGE
// ============================================
export const ECLAIRAGE: Record<string, ProductSpec> = {
  // Projecteurs M18
  'M18 ONESLSP': { title: 'Projecteur trépied ONE-KEY', power: '4500 lm', weight: '2.5 kg' },
  'M18 SLSP': { title: 'Projecteur trépied', power: '4500 lm', weight: '2.4 kg' },
  'M18 HOAL': { title: 'Projecteur zone', power: '10000 lm', weight: '4.5 kg' },
  'M18 HAL': { title: 'Projecteur zone', power: '4000 lm', weight: '2.2 kg' },
  'M18 PAL': { title: 'Projecteur pivotant', power: '2500 lm', weight: '1.8 kg' },
  'M18 UBL': { title: 'Projecteur compact', power: '1200 lm', weight: '0.8 kg' },
  // M18 Tours
  'M18 HSAL': { title: 'Tour d\'éclairage', power: '6000 lm', weight: '8.5 kg' },
  'M18 ONETL': { title: 'Tour d\'éclairage ONE-KEY', power: '6000 lm', weight: '8.8 kg' },
  // M18 Lampes
  'M18 TLED': { title: 'Lampe tube LED', power: '700 lm', weight: '0.6 kg' },
  'M18 IL': { title: 'Lampe d\'inspection', power: '450 lm', weight: '0.3 kg' },
  // M12
  'M12 SL': { title: 'Projecteur', power: '800 lm', weight: '0.5 kg' },
  'M12 LL': { title: 'Lanterne', power: '400 lm', weight: '0.4 kg' },
  'M12 FL': { title: 'Lampe de poche', power: '700 lm', weight: '0.3 kg' },
  'M12 MLED': { title: 'Lampe stylo', power: '250 lm', weight: '0.1 kg' },
  // Lampes frontales
  'L4 HLRP': { title: 'Lampe frontale rechargeable', power: '650 lm', weight: '0.2 kg' },
  'L4 HL2': { title: 'Lampe frontale', power: '600 lm', weight: '0.18 kg' },
  'L4 HLVIS': { title: 'Lampe frontale', power: '475 lm', weight: '0.15 kg' },
};

// ============================================
// INSTRUMENTS DE MESURE
// ============================================
export const INSTRUMENTS_MESURE: Record<string, ProductSpec> = {
  // Lasers rotatifs
  'M18 LRR': { title: 'Laser rotatif rouge', power: '350 m', weight: '3.2 kg' },
  'M18 ONELRR': { title: 'Laser rotatif ONE-KEY', power: '350 m', weight: '3.4 kg' },
  'M12 LR': { title: 'Laser rotatif', power: '300 m', weight: '2.8 kg' },
  // Lasers lignes
  'M12 3PL': { title: 'Laser 3 plans', power: '35 m', weight: '1.2 kg' },
  'M12 CLLP': { title: 'Laser croix', power: '30 m', weight: '0.8 kg' },
  'L4 CLLP': { title: 'Laser lignes', power: '25 m', weight: '0.5 kg' },
  // Télémètres
  'LDM 100': { title: 'Télémètre laser', power: '100 m', weight: '0.15 kg' },
  'LDM 50': { title: 'Télémètre laser', power: '50 m', weight: '0.12 kg' },
  'LDM 30': { title: 'Télémètre laser', power: '30 m', weight: '0.1 kg' },
  // Détecteurs
  'M12 DT': { title: 'Détecteur', power: '150 mm', weight: '0.5 kg' },
  'C12 RD': { title: 'Détecteur radar', power: '300 mm', weight: '0.6 kg' },
  // Caméras thermiques
  'M12 TI': { title: 'Caméra thermique', power: '-20°C à +400°C', weight: '0.8 kg' },
  // Caméras d'inspection
  'M12 IC': { title: 'Caméra d\'inspection', power: 'Ø12 mm', weight: '0.9 kg' },
  'M12 ICAV': { title: 'Caméra d\'inspection', power: 'Ø8.5 mm', weight: '1.1 kg' },
  'M18 SIC': { title: 'Caméra d\'inspection rotative', power: 'Ø40 mm', weight: '2.5 kg' },
};

// ============================================
// JARDIN / EXTERIEUR
// ============================================
export const JARDIN: Record<string, ProductSpec> = {
  // Tondeuses
  'M18 FMOW': { title: 'Tondeuse', power: '53 cm', weight: '28 kg' },
  'M18 F2LM533': { title: 'Tondeuse autotractée', power: '53 cm', weight: '32 kg' },
  'M18 F2LM460': { title: 'Tondeuse autotractée', power: '46 cm', weight: '26 kg' },
  'M18 FLM533': { title: 'Tondeuse', power: '53 cm', weight: '25 kg' },
  'M18 FLM460': { title: 'Tondeuse', power: '46 cm', weight: '22 kg' },
  // Tailles-haies
  'M18 FHET60': { title: 'Taille-haie télescopique', power: '60 cm', weight: '4.8 kg' },
  'M18 FHT55': { title: 'Taille-haie', power: '55 cm', weight: '3.8 kg' },
  'M18 FHT45': { title: 'Taille-haie', power: '45 cm', weight: '3.2 kg' },
  'M12 FHT20': { title: 'Taille-haie', power: '20 cm', weight: '1.5 kg' },
  // Débroussailleuses
  'M18 FBCU': { title: 'Débroussailleuse', power: '40 cm', weight: '5.5 kg' },
  'M18 FOPHLTKIT': { title: 'Débroussailleuse 4 têtes', power: '38 cm', weight: '6.2 kg' },
  // Coupe-bordures
  'M18 FSTC': { title: 'Coupe-bordure', power: '38 cm', weight: '3.2 kg' },
  'M18 FDCPT': { title: 'Coupe-bordure', power: '35 cm', weight: '2.8 kg' },
  // Souffleurs
  'M18 F2BL': { title: 'Souffleur dorsal', power: '270 km/h', weight: '5.5 kg' },
  'M18 FBL': { title: 'Souffleur', power: '177 km/h', weight: '2.5 kg' },
  'M12 BL': { title: 'Souffleur compact', power: '90 km/h', weight: '1.2 kg' },
  // Élagueuses
  'M18 FCHS': { title: 'Élagueuse', power: '25 cm', weight: '3.8 kg' },
  'M18 FCHSC': { title: 'Élagueuse', power: '35 cm', weight: '4.2 kg' },
  'M12 FHS': { title: 'Élagueuse', power: '15 cm', weight: '1.8 kg' },
  // Tronçonneuses
  'M18 FCHS35': { title: 'Tronçonneuse', power: '35 cm', weight: '4.5 kg' },
  'M18 FCHS40': { title: 'Tronçonneuse', power: '40 cm', weight: '4.8 kg' },
  'M18 FHS': { title: 'Tronçonneuse télesco.', power: '30 cm', weight: '5.5 kg' },
};

// ============================================
// RADIOS / ENCEINTES
// ============================================
export const AUDIO: Record<string, ProductSpec> = {
  'M18 JSRDAB': { title: 'Radio de chantier DAB+', power: '18 W', weight: '5.2 kg' },
  'M18 PRCDAB': { title: 'Radio/Chargeur DAB+', power: '18 W', weight: '6.8 kg' },
  'M12 RCDAB': { title: 'Radio/Chargeur', power: '6 W', weight: '4.5 kg' },
  'M18 PORC': { title: 'Radio PACKOUT', power: '20 W', weight: '7.5 kg' },
  'M12-18 JSSP': { title: 'Enceinte Bluetooth', power: '4 W', weight: '1.2 kg' },
  'M18 BTM': { title: 'Module Bluetooth', power: 'Bluetooth 5.0', weight: '0.3 kg' },
};

// ============================================
// VETEMENTS CHAUFFANTS
// ============================================
export const VETEMENTS_CHAUFFANTS: Record<string, ProductSpec> = {
  // Vestes
  'M12 HJP': { title: 'Veste chauffante', power: '3 zones', weight: '1.1 kg' },
  'M12 HJ': { title: 'Veste chauffante', power: '4 zones', weight: '1.2 kg' },
  'M12 HJ CAMO': { title: 'Veste chauffante camo', power: '4 zones', weight: '1.2 kg' },
  'M12 AXIS': { title: 'Veste chauffante Axis', power: '5 zones', weight: '1.3 kg' },
  // Sweats
  'M12 HH': { title: 'Sweat chauffant', power: '3 zones', weight: '0.9 kg' },
  'M12 HH CREW': { title: 'Sweat chauffant', power: '3 zones', weight: '0.85 kg' },
  // Gilets
  'M12 HVEST': { title: 'Gilet chauffant', power: '3 zones', weight: '0.7 kg' },
};

// ============================================
// CHARGEURS
// ============================================
export const CHARGEURS: Record<string, ProductSpec> = {
  // M18 Chargeurs
  'M18 DC': { title: 'Chargeur voiture', power: '12V DC', weight: '0.8 kg' },
  'M12-18 FC': { title: 'Chargeur rapide', power: '60 min (M18)', weight: '0.9 kg' },
  'M12-18 SC': { title: 'Chargeur séquentiel', power: '2 batteries', weight: '1.2 kg' },
  'M18 DFC': { title: 'Chargeur double rapide', power: '40 min', weight: '1.8 kg' },
  'M18 PC6': { title: 'Chargeur 6 ports', power: '6 batteries', weight: '4.5 kg' },
  // M12 Chargeurs
  'M12 C': { title: 'Chargeur M12', power: '30 min (2.0 Ah)', weight: '0.4 kg' },
  'M12 TC': { title: 'Chargeur voyage', power: 'USB', weight: '0.2 kg' },
  // MX FUEL
  'MX FUEL CC': { title: 'Chargeur MX FUEL', power: '3h (CP203)', weight: '5.2 kg' },
  'MX FUEL SFC': { title: 'Chargeur rapide MX', power: '1h (CP203)', weight: '8.5 kg' },
};

// ============================================
// BATTERIES
// ============================================
export const BATTERIES: Record<string, ProductSpec> = {
  // M18 FORGE
  'M18 FB8': { title: 'Batterie FORGE', power: '8.0 Ah', weight: '0.73 kg' },
  'M18 FB6': { title: 'Batterie FORGE', power: '6.0 Ah', weight: '0.63 kg' },
  'M18 FB5': { title: 'Batterie FORGE', power: '5.0 Ah', weight: '0.53 kg' },
  // M18 High Output
  'M18 HB12': { title: 'Batterie High Output', power: '12.0 Ah', weight: '1.15 kg' },
  'M18 HB8': { title: 'Batterie High Output', power: '8.0 Ah', weight: '0.88 kg' },
  'M18 HB6': { title: 'Batterie High Output', power: '6.0 Ah', weight: '0.73 kg' },
  'M18 HB5.5': { title: 'Batterie High Output', power: '5.5 Ah', weight: '0.63 kg' },
  // M18 Standard
  'M18 B5': { title: 'Batterie Red Lithium', power: '5.0 Ah', weight: '0.68 kg' },
  'M18 B4': { title: 'Batterie Red Lithium', power: '4.0 Ah', weight: '0.58 kg' },
  'M18 B3': { title: 'Batterie Red Lithium', power: '3.0 Ah', weight: '0.53 kg' },
  'M18 B2': { title: 'Batterie Red Lithium', power: '2.0 Ah', weight: '0.38 kg' },
  // M12
  'M12 HB6': { title: 'Batterie High Output', power: '6.0 Ah', weight: '0.38 kg' },
  'M12 HB4': { title: 'Batterie High Output', power: '4.0 Ah', weight: '0.28 kg' },
  'M12 HB3': { title: 'Batterie High Output', power: '3.0 Ah', weight: '0.23 kg' },
  'M12 B6': { title: 'Batterie Red Lithium', power: '6.0 Ah', weight: '0.35 kg' },
  'M12 B4': { title: 'Batterie Red Lithium', power: '4.0 Ah', weight: '0.25 kg' },
  'M12 B3': { title: 'Batterie Red Lithium', power: '3.0 Ah', weight: '0.20 kg' },
  'M12 B2': { title: 'Batterie Red Lithium', power: '2.0 Ah', weight: '0.16 kg' },
  // MX FUEL
  'MX FUEL XC406': { title: 'Batterie MX FUEL', power: '6.0 Ah', weight: '5.2 kg' },
  'MX FUEL CP203': { title: 'Batterie MX FUEL CP', power: '3.0 Ah', weight: '3.5 kg' },
};

// ============================================
// Correspondance par mots-clés (fallback quand le code modèle n'est pas présent)
// ============================================
interface KeywordMatch {
  keywords: string[];      // Mots-clés requis (tous doivent être présents)
  excludeKeywords?: string[]; // Mots-clés à exclure
  spec: ProductSpec;
}

const KEYWORD_MATCHES: KeywordMatch[] = [
  // M18 FUEL Visseuses placo
  { keywords: ['m18', 'fuel', 'visseuse', 'placo', 'chargeur'], spec: { title: 'Visseuse placo', power: '26 Nm' } },
  { keywords: ['m18', 'fuel', 'visseuse', 'placo'], excludeKeywords: ['chargeur'], spec: { title: 'Visseuse placo', power: '26 Nm' } },
  { keywords: ['m18', 'visseuse', 'placo'], spec: { title: 'Visseuse placo', power: '26 Nm' } },

  // M18 FUEL Perceuses à percussion
  { keywords: ['m18', 'fuel', 'perceuse', 'percussion'], spec: { title: 'Perceuse à percussion', power: '158 Nm' } },
  { keywords: ['m18', 'fuel', 'perceuse', 'visseuse'], excludeKeywords: ['percussion'], spec: { title: 'Perceuse-visseuse', power: '135 Nm' } },

  // M18 FUEL Visseuses à chocs
  { keywords: ['m18', 'fuel', 'visseuse', 'chocs'], spec: { title: 'Visseuse à chocs', power: '226 Nm' } },
  { keywords: ['m18', 'fuel', 'visseuse', 'impact'], spec: { title: 'Visseuse à chocs', power: '226 Nm' } },

  // M18 FUEL Boulonneuses
  { keywords: ['m18', 'fuel', 'boulonneuse', '1"'], spec: { title: 'Boulonneuse 1 pouce', power: '2033 Nm' } },
  { keywords: ['m18', 'fuel', 'boulonneuse', '1 pouce'], spec: { title: 'Boulonneuse 1 pouce', power: '2033 Nm' } },
  { keywords: ['m18', 'fuel', 'boulonneuse', '3/4'], spec: { title: 'Boulonneuse 3/4 de pouce', power: '1627 Nm' } },
  { keywords: ['m18', 'fuel', 'boulonneuse', '1/2'], spec: { title: 'Boulonneuse 1/2 pouce', power: '1356 Nm' } },
  { keywords: ['m18', 'fuel', 'boulonneuse', '3/8'], spec: { title: 'Boulonneuse 3/8 de pouce', power: '881 Nm' } },
  { keywords: ['m18', 'fuel', 'boulonneuse', '1/4'], spec: { title: 'Boulonneuse 1/4 de pouce', power: '135 Nm' } },
  { keywords: ['m18', 'fuel', 'boulonneuse'], spec: { title: 'Boulonneuse 1/2 pouce', power: '1356 Nm' } },

  // M18 FUEL Clés à cliquet
  { keywords: ['m18', 'fuel', 'cliquet', '1/2'], spec: { title: 'Clé à cliquet 1/2 pouce', power: '271 Nm' } },
  { keywords: ['m18', 'fuel', 'cliquet', '3/8'], spec: { title: 'Clé à cliquet 3/8 de pouce', power: '203 Nm' } },
  { keywords: ['m18', 'fuel', 'cliquet'], spec: { title: 'Clé à cliquet 1/2 pouce', power: '271 Nm' } },

  // M18 FUEL Perforateurs SDS-Max (Joules + kg)
  { keywords: ['m18', 'fuel', 'perforateur', 'sds-max'], spec: { title: 'Perfo-burineur SDS-Max', power: '12.5 J', weight: '7.4 kg' } },
  { keywords: ['m18', 'fuel', 'perforateur', 'sds max'], spec: { title: 'Perfo-burineur SDS-Max', power: '12.5 J', weight: '7.4 kg' } },
  { keywords: ['m18', 'fuel', 'perfo', 'sds-max'], spec: { title: 'Perfo-burineur SDS-Max', power: '12.5 J', weight: '7.4 kg' } },
  { keywords: ['m18', 'fuel', 'perfo', 'sds max'], spec: { title: 'Perfo-burineur SDS-Max', power: '12.5 J', weight: '7.4 kg' } },

  // M18 FUEL Perforateurs SDS-Plus (juste Joules)
  { keywords: ['m18', 'fuel', 'perforateur', 'sds-plus'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.5 J' } },
  { keywords: ['m18', 'fuel', 'perforateur', 'sds plus'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.5 J' } },
  { keywords: ['m18', 'fuel', 'perfo', 'sds-plus'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.5 J' } },
  { keywords: ['m18', 'fuel', 'perfo', 'sds plus'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.5 J' } },
  { keywords: ['m18', 'fuel', 'perforateur'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.5 J' } },

  // M18 FUEL Burineurs SDS-Max (Joules + kg)
  { keywords: ['m18', 'fuel', 'burineur', 'sds-max'], spec: { title: 'Burineur SDS-Max', power: '8.0 J', weight: '6.8 kg' } },
  { keywords: ['m18', 'fuel', 'burineur'], spec: { title: 'Burineur SDS-Max', power: '8.0 J', weight: '6.8 kg' } },
  { keywords: ['m18', 'fuel', 'démolisseur'], spec: { title: 'Burineur SDS-Max', power: '8.0 J', weight: '6.8 kg' } },

  // M18 FUEL Meuleuses (juste mm)
  { keywords: ['m18', 'fuel', 'meuleuse', '230'], spec: { title: 'Meuleuse 230 mm', power: '230 mm' } },
  { keywords: ['m18', 'fuel', 'meuleuse', '180'], spec: { title: 'Meuleuse 180 mm', power: '180 mm' } },
  { keywords: ['m18', 'fuel', 'meuleuse', '125'], spec: { title: 'Meuleuse 125 mm', power: '125 mm' } },
  { keywords: ['m18', 'fuel', 'meuleuse', '115'], spec: { title: 'Meuleuse 115 mm', power: '115 mm' } },
  { keywords: ['m18', 'fuel', 'meuleuse'], spec: { title: 'Meuleuse 125 mm', power: '125 mm' } },

  // M18 FUEL Scies
  { keywords: ['m18', 'fuel', 'scie', 'circulaire'], spec: { title: 'Scie circulaire', power: '4500 rpm', secondary: '190 mm', weight: '4.1 kg' } },
  { keywords: ['m18', 'fuel', 'scie', 'sabre'], spec: { title: 'Scie sabre SAWZALL', power: '3000 cpm', weight: '4.0 kg' } },
  { keywords: ['m18', 'fuel', 'sawzall'], spec: { title: 'Scie sabre SAWZALL', power: '3000 cpm', weight: '4.0 kg' } },
  { keywords: ['m18', 'fuel', 'scie', 'sauteuse'], spec: { title: 'Scie sauteuse', power: '3500 cpm', weight: '2.8 kg' } },
  { keywords: ['m18', 'fuel', 'scie', 'ruban'], spec: { title: 'Scie à ruban', power: '110 m/min', secondary: '127 mm', weight: '5.5 kg' } },
  { keywords: ['m18', 'fuel', 'scie', 'onglet'], spec: { title: 'Scie à onglet radiale', power: '4000 rpm', secondary: '305 mm', weight: '23 kg' } },
  { keywords: ['m18', 'fuel', 'scie', 'plongeante'], spec: { title: 'Scie plongeante', power: '4400 rpm', secondary: '165 mm', weight: '3.8 kg' } },

  // M18 FUEL Rainureuse
  { keywords: ['m18', 'fuel', 'rainureuse'], spec: { title: 'Rainureuse', power: '7500 rpm', secondary: '140 mm', weight: '5.8 kg' } },

  // M18 FUEL Ponceuses
  { keywords: ['m18', 'fuel', 'ponceuse', 'excentrique'], spec: { title: 'Ponceuse excentrique', power: '12000 opm', secondary: '125 mm', weight: '2.1 kg' } },
  { keywords: ['m18', 'fuel', 'ponceuse', 'orbitale'], spec: { title: 'Ponceuse orbitale', power: '10000 opm', secondary: '150 mm', weight: '2.4 kg' } },
  { keywords: ['m18', 'fuel', 'ponceuse', 'bande'], spec: { title: 'Ponceuse à bande', power: '400 m/min', secondary: '76 x 457 mm', weight: '5.2 kg' } },
  { keywords: ['m18', 'fuel', 'ponceuse'], spec: { title: 'Ponceuse excentrique', power: '12000 opm', secondary: '125 mm', weight: '2.1 kg' } },

  // M18 FUEL Rabot
  { keywords: ['m18', 'fuel', 'rabot'], spec: { title: 'Rabot', power: '15000 rpm', secondary: '82 mm', weight: '3.5 kg' } },

  // M18 FUEL Défonceuse / Affleureuse
  { keywords: ['m18', 'fuel', 'défonceuse'], spec: { title: 'Défonceuse', power: '24000 rpm', weight: '4.2 kg' } },
  { keywords: ['m18', 'fuel', 'defonceuse'], spec: { title: 'Défonceuse', power: '24000 rpm', weight: '4.2 kg' } },
  { keywords: ['m18', 'fuel', 'affleureuse'], spec: { title: 'Affleureuse', power: '31000 rpm', weight: '1.8 kg' } },

  // M18 FUEL Cloueuses / Agrafeuses
  { keywords: ['m18', 'fuel', 'cloueuse', 'rouleaux'], spec: { title: 'Cloueuse à rouleaux', power: '21° | 50-90 mm' } },
  { keywords: ['m18', 'fuel', 'cloueuse', 'charpente'], spec: { title: 'Cloueuse à rouleaux', power: '21° | 50-90 mm' } },
  { keywords: ['m18', 'fuel', 'cloueuse', 'finition', '15'], spec: { title: 'Cloueuse de finition', power: '15 Ga | 32-65 mm' } },
  { keywords: ['m18', 'fuel', 'cloueuse', 'finition', '18'], spec: { title: 'Cloueuse de finition', power: '18 Ga | 16-57 mm' } },
  { keywords: ['m18', 'fuel', 'cloueuse', 'finition', '23'], spec: { title: 'Cloueuse de finition', power: '23 Ga | 12-50 mm' } },
  { keywords: ['m18', 'fuel', 'cloueuse', 'finition'], spec: { title: 'Cloueuse de finition', power: '18 Ga | 16-57 mm' } },
  { keywords: ['m18', 'fuel', 'cloueur', 'duplex'], spec: { title: 'Cloueur duplex', power: '8d-16d' } },
  { keywords: ['m18', 'fuel', 'agrafeuse', 'clôture'], spec: { title: 'Agrafeuse clôture', power: '9 Ga | 38 mm' } },
  { keywords: ['m18', 'fuel', 'agrafeuse', 'cloture'], spec: { title: 'Agrafeuse clôture', power: '9 Ga | 38 mm' } },
  { keywords: ['m18', 'fuel', 'agrafeuse', 'électricien'], spec: { title: 'Agrafeuse électricien', power: 'T50' } },
  { keywords: ['m18', 'fuel', 'agrafeuse', 'electricien'], spec: { title: 'Agrafeuse électricien', power: 'T50' } },
  { keywords: ['m18', 'fuel', 'agrafeuse'], spec: { title: 'Agrafeuse', power: '18 Ga | 19-38 mm' } },
  { keywords: ['m18', 'fuel', 'cloueuse'], spec: { title: 'Cloueuse de finition', power: '18 Ga | 16-57 mm' } },
  { keywords: ['m18', 'cloueuse'], spec: { title: 'Cloueuse de finition', power: '18 Ga | 16-57 mm' } },
  { keywords: ['m18', 'agrafeuse'], spec: { title: 'Agrafeuse', power: '18 Ga | 19-38 mm' } },
  { keywords: ['m12', 'agrafeuse'], spec: { title: 'Agrafeuse', power: '16 Ga' } },

  // M18 FUEL Riveteuse
  { keywords: ['m18', 'fuel', 'riveteuse'], spec: { title: 'Riveteuse', power: '22 kN', secondary: 'Ø6.4 mm', weight: '3.1 kg' } },

  // M18 FUEL Sertisseuse
  { keywords: ['m18', 'fuel', 'sertisseuse'], spec: { title: 'Sertisseuse', power: '53 kN', weight: '3.8 kg' } },

  // M18 FUEL Coupe-câble
  { keywords: ['m18', 'fuel', 'coupe-câble'], spec: { title: 'Coupe-câble', power: '53 kN', secondary: 'Ø55 mm', weight: '4.5 kg' } },
  { keywords: ['m18', 'fuel', 'coupe câble'], spec: { title: 'Coupe-câble', power: '53 kN', secondary: 'Ø55 mm', weight: '4.5 kg' } },

  // M18 FUEL Outil multifonction
  { keywords: ['m18', 'fuel', 'multifonction'], spec: { title: 'Outil multifonction', power: '20000 opm', weight: '1.8 kg' } },
  { keywords: ['m18', 'fuel', 'multi-outil'], spec: { title: 'Outil multifonction', power: '20000 opm', weight: '1.8 kg' } },

  // M18 FUEL Polisseuse
  { keywords: ['m18', 'fuel', 'polisseuse'], spec: { title: 'Polisseuse', power: '2800 rpm', secondary: '180 mm', weight: '3.2 kg' } },

  // M18 FUEL Carotteuse (juste diamètre)
  { keywords: ['m18', 'fuel', 'carotteuse', 'diamant'], spec: { title: 'Carotteuse diamant', power: 'Ø152 mm' } },
  { keywords: ['m18', 'fuel', 'carotteuse'], spec: { title: 'Carotteuse', power: 'Ø152 mm' } },
  { keywords: ['m18', 'carotteuse', 'diamant'], spec: { title: 'Carotteuse diamant', power: 'Ø152 mm' } },
  { keywords: ['m18', 'carotteuse'], spec: { title: 'Carotteuse', power: 'Ø152 mm' } },

  // M18 FUEL Perceuse magnétique (Aimant permanent)
  { keywords: ['m18', 'fuel', 'perceuse', 'magnétique'], spec: { title: 'Perceuse magnétique', power: 'Aimant permanent' } },
  { keywords: ['m18', 'perceuse', 'magnétique'], spec: { title: 'Perceuse magnétique', power: 'Aimant permanent' } },
  { keywords: ['perceuse', 'magnétique'], spec: { title: 'Perceuse magnétique', power: 'Aimant permanent' } },

  // M18 FUEL Pompe à graisse
  { keywords: ['m18', 'fuel', 'pompe', 'graisse'], spec: { title: 'Pompe à graisse', power: '690 bar', weight: '4.2 kg' } },
  { keywords: ['m18', 'fuel', 'pistolet', 'graisse'], spec: { title: 'Pistolet graisse', power: '690 bar', weight: '3.8 kg' } },

  // M18 FUEL Pulvérisateur
  { keywords: ['m18', 'fuel', 'pulvérisateur'], spec: { title: 'Pulvérisateur', power: '1.5 bar', secondary: '15 L', weight: '5.2 kg' } },

  // M18 FUEL Décapeur
  { keywords: ['m18', 'décapeur'], spec: { title: 'Décapeur thermique', power: '550°C', weight: '1.2 kg' } },
  { keywords: ['m18', 'decapeur'], spec: { title: 'Décapeur thermique', power: '550°C', weight: '1.2 kg' } },

  // M18 FUEL Visseuse d'angle
  { keywords: ['m18', 'fuel', 'visseuse', 'angle', 'chocs'], spec: { title: 'Visseuse d\'angle à chocs', power: '203 Nm' } },
  { keywords: ['m18', 'fuel', 'visseuse', 'angle', 'impact'], spec: { title: 'Visseuse d\'angle à chocs', power: '203 Nm' } },
  { keywords: ['m18', 'fuel', 'visseuse', 'angle'], spec: { title: 'Visseuse d\'angle', power: '135 Nm' } },
  { keywords: ['m18', 'visseuse', 'angle', 'chocs'], spec: { title: 'Visseuse d\'angle à chocs', power: '110 Nm' } },
  { keywords: ['m18', 'visseuse', 'angle'], spec: { title: 'Visseuse d\'angle', power: '110 Nm' } },
  { keywords: ['m12', 'visseuse', 'angle'], spec: { title: 'Visseuse d\'angle', power: '75 Nm' } },

  // M18 Standard (non-FUEL)
  { keywords: ['m18', 'perceuse', 'percussion'], excludeKeywords: ['fuel'], spec: { title: 'Perceuse à percussion', power: '82 Nm' } },
  { keywords: ['m18', 'visseuse', 'chocs'], excludeKeywords: ['fuel'], spec: { title: 'Visseuse à chocs', power: '180 Nm' } },

  // M12 FUEL
  { keywords: ['m12', 'fuel', 'perceuse', 'percussion'], spec: { title: 'Perceuse à percussion', power: '45 Nm' } },
  { keywords: ['m12', 'fuel', 'perceuse', 'visseuse'], spec: { title: 'Perceuse-visseuse', power: '35 Nm' } },
  { keywords: ['m12', 'fuel', 'visseuse', 'chocs'], spec: { title: 'Visseuse à chocs', power: '163 Nm' } },
  { keywords: ['m12', 'fuel', 'boulonneuse'], spec: { title: 'Boulonneuse 1/2 pouce', power: '339 Nm' } },
  { keywords: ['m12', 'fuel', 'cliquet', '1/2'], spec: { title: 'Clé à cliquet 1/2 pouce', power: '102 Nm' } },
  { keywords: ['m12', 'fuel', 'cliquet', '3/8'], spec: { title: 'Clé à cliquet 3/8 de pouce', power: '68 Nm' } },
  { keywords: ['m12', 'fuel', 'cliquet', '1/4'], spec: { title: 'Clé à cliquet 1/4 de pouce', power: '47 Nm' } },
  { keywords: ['m12', 'fuel', 'cliquet'], spec: { title: 'Clé à cliquet 3/8 de pouce', power: '68 Nm' } },
  { keywords: ['m12', 'fuel', 'perforateur'], spec: { title: 'Perfo-burineur SDS-Plus', power: '1.4 J' } },
  { keywords: ['m12', 'fuel', 'meuleuse'], spec: { title: 'Meuleuse droite', power: '76 mm' } },
  { keywords: ['m12', 'fuel', 'scie', 'sauteuse'], spec: { title: 'Scie sauteuse', power: '3000 cpm' } },
  { keywords: ['m12', 'fuel', 'scie', 'sabre'], spec: { title: 'Scie sabre', power: '3000 cpm' } },
  { keywords: ['m12', 'fuel', 'scie', 'ruban'], spec: { title: 'Scie à ruban', power: '64 mm' } },
  { keywords: ['m12', 'fuel', 'scie', 'circulaire'], spec: { title: 'Scie circulaire', power: '140 mm' } },
  { keywords: ['m12', 'fuel', 'multifonction'], spec: { title: 'Outil multifonction', power: '20000 opm' } },
  { keywords: ['m12', 'fuel', 'affleureuse'], spec: { title: 'Affleureuse', power: '31000 rpm' } },

  // M12 Standard
  { keywords: ['m12', 'perceuse'], excludeKeywords: ['fuel'], spec: { title: 'Perceuse', power: '30 Nm' } },
  { keywords: ['m12', 'visseuse', 'chocs'], excludeKeywords: ['fuel'], spec: { title: 'Visseuse à chocs', power: '135 Nm' } },

  // MX FUEL (grosses machines - Joules + kg pour perfo/burineur)
  { keywords: ['mx', 'fuel', 'perforateur'], spec: { title: 'Perfo-burineur SDS-Max', power: '20 J', weight: '14.8 kg' } },
  { keywords: ['mx', 'fuel', 'perfo'], spec: { title: 'Perfo-burineur SDS-Max', power: '20 J', weight: '14.8 kg' } },
  { keywords: ['mx', 'fuel', 'burineur'], spec: { title: 'Burineur SDS-Max', power: '25 J', weight: '16.2 kg' } },
  { keywords: ['mx', 'fuel', 'démolisseur'], spec: { title: 'Burineur SDS-Max', power: '25 J', weight: '16.2 kg' } },
  { keywords: ['mx', 'fuel', 'carotteuse'], spec: { title: 'Carotteuse diamant', power: 'Ø250 mm' } },
  { keywords: ['mx', 'fuel', 'découpeuse'], spec: { title: 'Découpeuse', power: '355 mm' } },
  { keywords: ['mx', 'fuel', 'tronçonneuse'], spec: { title: 'Tronçonneuse béton', power: 'Ø350 mm' } },
  { keywords: ['mx', 'fuel', 'vibrateur'], spec: { title: 'Vibrateur béton', power: 'Ø45 mm' } },
  { keywords: ['mx', 'fuel', 'générateur'], spec: { title: 'Station énergie', power: '3600 W' } },
  { keywords: ['mx', 'fuel', 'compresseur'], spec: { title: 'Compresseur', power: '7 bar | 23 L' } },

  // Aspirateurs M18
  { keywords: ['m18', 'aspirateur', 'packout'], spec: { title: 'Aspirateur PACKOUT', power: '30 L', weight: '6.5 kg' } },
  { keywords: ['m18', 'aspirateur', 'dorsal'], spec: { title: 'Aspirateur dorsal', power: '1.1 m³/min', weight: '5.8 kg' } },
  { keywords: ['m18', 'aspirateur'], spec: { title: 'Aspirateur eau & poussières', power: '7.5 L', weight: '4.2 kg' } },

  // Souffleurs
  { keywords: ['m18', 'fuel', 'souffleur', 'dorsal'], spec: { title: 'Souffleur dorsal', power: '270 km/h', weight: '5.5 kg' } },
  { keywords: ['m18', 'fuel', 'souffleur'], spec: { title: 'Souffleur', power: '177 km/h', weight: '2.5 kg' } },
  { keywords: ['m12', 'souffleur'], spec: { title: 'Souffleur compact', power: '90 km/h', weight: '1.2 kg' } },

  // Éclairage
  { keywords: ['m18', 'projecteur', 'trépied'], spec: { title: 'Projecteur trépied', power: '4500 lm', weight: '2.4 kg' } },
  { keywords: ['m18', 'projecteur', 'tour'], spec: { title: 'Tour d\'éclairage', power: '6000 lm', weight: '8.5 kg' } },
  { keywords: ['m18', 'projecteur'], spec: { title: 'Projecteur zone', power: '4000 lm', weight: '2.2 kg' } },
  { keywords: ['m12', 'projecteur'], spec: { title: 'Projecteur', power: '800 lm', weight: '0.5 kg' } },
  { keywords: ['lampe', 'frontale'], spec: { title: 'Lampe frontale', power: '650 lm', weight: '0.2 kg' } },

  // Jardin
  { keywords: ['m18', 'fuel', 'tondeuse'], spec: { title: 'Tondeuse', power: '53 cm', weight: '28 kg' } },
  { keywords: ['m18', 'fuel', 'taille-haie'], spec: { title: 'Taille-haie', power: '55 cm', weight: '3.8 kg' } },
  { keywords: ['m18', 'fuel', 'débroussailleuse'], spec: { title: 'Débroussailleuse', power: '40 cm', weight: '5.5 kg' } },
  { keywords: ['m18', 'fuel', 'coupe-bordure'], spec: { title: 'Coupe-bordure', power: '38 cm', weight: '3.2 kg' } },
  { keywords: ['m18', 'fuel', 'élagueuse'], spec: { title: 'Élagueuse', power: '25 cm', weight: '3.8 kg' } },
  { keywords: ['m18', 'fuel', 'tronçonneuse'], spec: { title: 'Tronçonneuse', power: '40 cm', weight: '4.8 kg' } },

  // Radios
  { keywords: ['m18', 'radio'], spec: { title: 'Radio de chantier DAB+', power: '18 W', weight: '5.2 kg' } },
  { keywords: ['m12', 'radio'], spec: { title: 'Radio/Chargeur', power: '6 W', weight: '4.5 kg' } },
  { keywords: ['enceinte', 'bluetooth'], spec: { title: 'Enceinte Bluetooth', power: '4 W', weight: '1.2 kg' } },

  // Instruments de mesure
  { keywords: ['m18', 'laser', 'rotatif'], spec: { title: 'Laser rotatif', power: '350 m', weight: '3.2 kg' } },
  { keywords: ['m12', 'laser', 'rotatif'], spec: { title: 'Laser rotatif', power: '300 m', weight: '2.8 kg' } },
  { keywords: ['m12', 'laser', 'croix'], spec: { title: 'Laser croix', power: '30 m', weight: '0.8 kg' } },
  { keywords: ['télémètre'], spec: { title: 'Télémètre laser', power: '100 m', weight: '0.15 kg' } },
  { keywords: ['m12', 'caméra', 'inspection'], spec: { title: 'Caméra d\'inspection', power: 'Ø12 mm', weight: '0.9 kg' } },
  { keywords: ['m12', 'caméra', 'thermique'], spec: { title: 'Caméra thermique', power: '-20°C à +400°C', weight: '0.8 kg' } },

  // Vêtements chauffants
  { keywords: ['m12', 'veste', 'chauffant'], spec: { title: 'Veste chauffante', power: '4 zones', weight: '1.2 kg' } },
  { keywords: ['m12', 'sweat', 'chauffant'], spec: { title: 'Sweat chauffant', power: '3 zones', weight: '0.9 kg' } },
  { keywords: ['m12', 'gilet', 'chauffant'], spec: { title: 'Gilet chauffant', power: '3 zones', weight: '0.7 kg' } },
  { keywords: ['veste', 'chauffant'], spec: { title: 'Veste chauffante', power: '4 zones', weight: '1.2 kg' } },
  { keywords: ['sweat', 'chauffant'], spec: { title: 'Sweat chauffant', power: '3 zones', weight: '0.9 kg' } },
  { keywords: ['gilet', 'chauffant'], spec: { title: 'Gilet chauffant', power: '3 zones', weight: '0.7 kg' } },

  // Agrafeuses
  { keywords: ['m18', 'agrafeuse'], spec: { title: 'Agrafeuse', power: '16 Ga', weight: '2.5 kg' } },
  { keywords: ['m12', 'agrafeuse'], spec: { title: 'Agrafeuse', power: '16 Ga', weight: '1.5 kg' } },

  // Pistolets à mastic/colle
  { keywords: ['m18', 'pistolet', 'mastic'], spec: { title: 'Pistolet à mastic', power: '600 ml', weight: '3.2 kg' } },
  { keywords: ['m18', 'pistolet', 'silicone'], spec: { title: 'Pistolet à mastic', power: '600 ml', weight: '3.2 kg' } },
  { keywords: ['m18', 'pistolet', 'colle'], spec: { title: 'Pistolet à colle', power: '310 ml', weight: '2.8 kg' } },
  { keywords: ['m12', 'pistolet', 'mastic'], spec: { title: 'Pistolet à mastic', power: '310 ml', weight: '1.4 kg' } },
  { keywords: ['m12', 'pistolet', 'colle'], spec: { title: 'Pistolet à colle', power: '310 ml', weight: '1.4 kg' } },

  // Coupe-tubes
  { keywords: ['m18', 'coupe-tube'], spec: { title: 'Coupe-tube', power: 'Ø75 mm', weight: '3.8 kg' } },
  { keywords: ['m18', 'coupe tube'], spec: { title: 'Coupe-tube', power: 'Ø75 mm', weight: '3.8 kg' } },
  { keywords: ['m12', 'coupe-tube'], spec: { title: 'Coupe-tube', power: 'Ø28 mm', weight: '1.5 kg' } },
  { keywords: ['m12', 'coupe tube'], spec: { title: 'Coupe-tube', power: 'Ø28 mm', weight: '1.5 kg' } },

  // Coupe fer à béton
  { keywords: ['m18', 'coupe', 'fer', 'béton'], spec: { title: 'Coupe fer à béton', power: 'Ø16 mm', weight: '5.2 kg' } },
  { keywords: ['m18', 'coupe', 'tige'], spec: { title: 'Coupe-tige filetée', power: 'M12', weight: '3.5 kg' } },

  // Expandeurs / Presses
  { keywords: ['m18', 'expandeur'], spec: { title: 'Expandeur', power: '53 kN', weight: '3.5 kg' } },
  { keywords: ['m18', 'presse', 'expansion'], spec: { title: 'Presse à expansion', power: '53 kN', weight: '3.8 kg' } },
  { keywords: ['m12', 'expandeur'], spec: { title: 'Expandeur', power: '32 kN', weight: '2.0 kg' } },

  // Déboucheurs
  { keywords: ['m18', 'déboucheur'], spec: { title: 'Déboucheur', power: 'Ø75 mm', weight: '5.5 kg' } },
  { keywords: ['m18', 'deboucheur'], spec: { title: 'Déboucheur', power: 'Ø75 mm', weight: '5.5 kg' } },
  { keywords: ['m12', 'déboucheur'], spec: { title: 'Déboucheur', power: 'Ø38 mm', weight: '2.5 kg' } },

  // Cisailles / Grignoteuses
  { keywords: ['m18', 'cisaille'], spec: { title: 'Cisaille', power: '1.6 mm acier', weight: '2.8 kg' } },
  { keywords: ['m18', 'grignoteuse'], spec: { title: 'Grignoteuse', power: '1.6 mm acier', weight: '2.5 kg' } },
  { keywords: ['m12', 'cisaille'], spec: { title: 'Cisaille', power: '1.0 mm acier', weight: '1.5 kg' } },

  // PACKOUT
  { keywords: ['packout', 'coffret'], spec: { title: 'PACKOUT Coffret', power: 'Modulaire' } },
  { keywords: ['packout', 'boîte'], spec: { title: 'PACKOUT Coffret', power: 'Modulaire' } },
  { keywords: ['packout', 'organiseur'], spec: { title: 'PACKOUT Organiseur', power: 'Modulaire' } },
  { keywords: ['packout', 'sac'], spec: { title: 'PACKOUT Sac', power: 'Modulaire' } },
  { keywords: ['packout', 'chariot'], spec: { title: 'PACKOUT Chariot', power: 'Modulaire', weight: '12 kg' } },
  { keywords: ['packout', 'trolley'], spec: { title: 'PACKOUT Chariot', power: 'Modulaire', weight: '12 kg' } },
  { keywords: ['packout', 'glacière'], spec: { title: 'PACKOUT Glacière', power: '16 L' } },
  { keywords: ['packout', 'cooler'], spec: { title: 'PACKOUT Glacière', power: '16 L' } },
  { keywords: ['packout', 'radio'], spec: { title: 'PACKOUT Radio', power: '20 W', weight: '7.5 kg' } },

  // Chargeurs
  { keywords: ['chargeur', 'rapide', 'm18'], spec: { title: 'Chargeur rapide', power: '60 min (M18)' } },
  { keywords: ['chargeur', 'rapide', 'm12'], spec: { title: 'Chargeur rapide', power: '30 min (M12)' } },
  { keywords: ['chargeur', 'double'], spec: { title: 'Chargeur double', power: '2 batteries' } },
  { keywords: ['chargeur', 'séquentiel'], spec: { title: 'Chargeur séquentiel', power: '6 batteries' } },
  { keywords: ['chargeur', 'voiture'], spec: { title: 'Chargeur voiture', power: '12V DC' } },
  { keywords: ['mx', 'fuel', 'chargeur'], spec: { title: 'Chargeur MX FUEL', power: '3h (CP203)', weight: '5.2 kg' } },

  // Batteries (fallback si pas détecté comme batterie)
  { keywords: ['batterie', 'forge'], spec: { title: 'Batterie FORGE', power: '8.0 Ah' } },
  { keywords: ['batterie', 'high', 'output'], spec: { title: 'Batterie High Output', power: '12.0 Ah' } },
  { keywords: ['batterie', 'red', 'lithium'], spec: { title: 'Batterie Red Lithium', power: '5.0 Ah' } },
  { keywords: ['mx', 'fuel', 'batterie'], spec: { title: 'Batterie MX FUEL', power: '6.0 Ah', weight: '5.2 kg' } },

  // Ventilateurs / Chauffage
  { keywords: ['m18', 'ventilateur'], spec: { title: 'Ventilateur', power: '1180 m³/h', weight: '3.2 kg' } },
  { keywords: ['m18', 'chauffage'], spec: { title: 'Chauffage', power: '36000 BTU' } },
  { keywords: ['m18', 'radiateur'], spec: { title: 'Chauffage', power: '36000 BTU' } },

  // Générateurs / Stations énergie
  { keywords: ['m18', 'générateur'], spec: { title: 'Générateur portable', power: '1800 W' } },
  { keywords: ['m18', 'station', 'énergie'], spec: { title: 'Station énergie', power: '1800 W' } },
  { keywords: ['m18', 'onduleur'], spec: { title: 'Onduleur', power: '2400 W' } },

  // Pompes eau
  { keywords: ['m18', 'pompe', 'eau'], spec: { title: 'Pompe à eau', power: '1817 L/h', weight: '2.5 kg' } },
  { keywords: ['m18', 'pompe', 'transfert'], spec: { title: 'Pompe de transfert', power: '1817 L/h', weight: '2.5 kg' } },
  { keywords: ['mx', 'fuel', 'pompe'], spec: { title: 'Pompe submersible', power: '340 L/min', weight: '12 kg' } },

  // Filaires - Perforateurs Kango (SDS-Max: Joules + kg)
  { keywords: ['kango', '950'], spec: { title: 'Burineur SDS-Max', power: '16.5 J', weight: '11 kg' } },
  { keywords: ['kango', '900'], spec: { title: 'Burineur SDS-Max', power: '14.3 J', weight: '10.2 kg' } },
  { keywords: ['kango', '850'], spec: { title: 'Perfo-burineur SDS-Max', power: '10.0 J', weight: '8.5 kg' } },
  { keywords: ['kango', '750'], spec: { title: 'Perfo-burineur SDS-Max', power: '7.5 J', weight: '6.8 kg' } },
  { keywords: ['kango', '545'], spec: { title: 'Perfo-burineur SDS-Max', power: '6.0 J', weight: '5.9 kg' } },
  { keywords: ['kango', '500'], spec: { title: 'Perfo-burineur SDS-Max', power: '5.5 J', weight: '5.6 kg' } },
  { keywords: ['kango'], spec: { title: 'Perfo-burineur SDS-Max', power: '7.5 J', weight: '6.8 kg' } },

  // Filaires - Perforateurs PH/PLH (SDS-Plus: juste Joules)
  { keywords: ['ph', '30', 'power'], spec: { title: 'Perfo-burineur SDS-Plus', power: '6.1 J' } },
  { keywords: ['ph', '28'], spec: { title: 'Perfo-burineur SDS-Plus', power: '4.8 J' } },
  { keywords: ['ph', '27'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.8 J' } },
  { keywords: ['ph', '26'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.0 J' } },
  { keywords: ['plh', '32'], spec: { title: 'Perfo-burineur SDS-Plus', power: '4.8 J' } },

  // Filaires - Meuleuses AGV (juste Watts)
  { keywords: ['agv', '26', '230'], spec: { title: 'Meuleuse 230 mm', power: '2600 W' } },
  { keywords: ['agv', '24', '230'], spec: { title: 'Meuleuse 230 mm', power: '2400 W' } },
  { keywords: ['agv', '22', '230'], spec: { title: 'Meuleuse 230 mm', power: '2200 W' } },
  { keywords: ['agv', '21', '180'], spec: { title: 'Meuleuse 180 mm', power: '2100 W' } },
  { keywords: ['agv', '17', '180'], spec: { title: 'Meuleuse 180 mm', power: '1750 W' } },
  { keywords: ['agv', '15', '150'], spec: { title: 'Meuleuse 150 mm', power: '1550 W' } },
  { keywords: ['agv', '15', '125'], spec: { title: 'Meuleuse 125 mm', power: '1550 W' } },
  { keywords: ['agv', '13', '125'], spec: { title: 'Meuleuse 125 mm', power: '1250 W' } },
  { keywords: ['agv', '12', '125'], spec: { title: 'Meuleuse 125 mm', power: '1200 W' } },
  { keywords: ['agv', '10', '125'], spec: { title: 'Meuleuse 125 mm', power: '1000 W' } },
  { keywords: ['ag', '800', '125'], spec: { title: 'Meuleuse 125 mm', power: '800 W' } },
  { keywords: ['ag', '800', '115'], spec: { title: 'Meuleuse 115 mm', power: '800 W' } },

  // Filaires - Perceuses PD2E
  { keywords: ['pd2e', '24'], spec: { title: 'Perceuse à percussion', power: '1020 W' } },
  { keywords: ['pd2e', '22'], spec: { title: 'Perceuse à percussion', power: '850 W' } },
  { keywords: ['pd2e', '16'], spec: { title: 'Perceuse à percussion', power: '630 W' } },

  // Filaires - Scies SSPE
  { keywords: ['sspe', '1500'], spec: { title: 'Scie sabre SAWZALL', power: '1500 W', secondary: '3000 cpm', weight: '4.8 kg' } },
  { keywords: ['sspe', '1300'], spec: { title: 'Scie sabre SAWZALL', power: '1300 W', secondary: '2800 cpm', weight: '4.2 kg' } },
  { keywords: ['sspe'], spec: { title: 'Scie sabre SAWZALL', power: '1500 W', secondary: '3000 cpm', weight: '4.8 kg' } },

  // Filaires - Scies circulaires
  { keywords: ['scs', '65'], spec: { title: 'Scie circulaire', power: '1400 W', secondary: '190 mm', weight: '4.5 kg' } },
  { keywords: ['cs', '60'], spec: { title: 'Scie circulaire', power: '1400 W', secondary: '184 mm', weight: '4.2 kg' } },

  // Filaires - Scies sauteuses
  { keywords: ['js', '120'], spec: { title: 'Scie sauteuse', power: '710 W', secondary: '3500 cpm', weight: '2.8 kg' } },

  // Filaires - Scies à onglet
  { keywords: ['ms', '305'], spec: { title: 'Scie à onglet', power: '1800 W', secondary: '305 mm', weight: '25 kg' } },
  { keywords: ['ms', '216'], spec: { title: 'Scie à onglet', power: '1650 W', secondary: '216 mm', weight: '18 kg' } },

  // Filaires - Carotteuses (juste diamètre)
  { keywords: ['dce', '94'], spec: { title: 'Carotteuse diamant', power: 'Ø152 mm' } },
  { keywords: ['dce', '120'], spec: { title: 'Carotteuse diamant', power: 'Ø200 mm' } },
  { keywords: ['dd', '160'], spec: { title: 'Carotteuse diamant', power: 'Ø162 mm' } },
  { keywords: ['carotteuse', 'diamant', 'filaire'], spec: { title: 'Carotteuse diamant', power: 'Ø152 mm' } },
  { keywords: ['carotteuse', 'filaire'], spec: { title: 'Carotteuse', power: 'Ø152 mm' } },

  // Filaires - Aspirateurs
  { keywords: ['as', '30', 'mac'], spec: { title: 'Aspirateur classe M', power: '1200 W', secondary: '30 L', weight: '12 kg' } },
  { keywords: ['as', '30', 'lac'], spec: { title: 'Aspirateur classe L', power: '1200 W', secondary: '30 L', weight: '11 kg' } },
  { keywords: ['as', '300', 'emac'], spec: { title: 'Aspirateur classe M', power: '1500 W', secondary: '30 L', weight: '12 kg' } },
  { keywords: ['as', '300', 'elac'], spec: { title: 'Aspirateur classe L', power: '1500 W', secondary: '30 L', weight: '11 kg' } },
  { keywords: ['as', '500'], spec: { title: 'Aspirateur', power: '1500 W', secondary: '50 L', weight: '15 kg' } },

  // Génériques par type d'outil (fallback ultime)
  { keywords: ['perceuse', 'percussion', 'filaire'], spec: { title: 'Perceuse à percussion', power: '850 W' } },
  { keywords: ['perceuse', 'visseuse'], spec: { title: 'Perceuse-visseuse', power: '60 Nm' } },
  { keywords: ['perceuse', 'filaire'], spec: { title: 'Perceuse', power: '545 W' } },
  { keywords: ['meuleuse', '230', 'filaire'], spec: { title: 'Meuleuse 230 mm', power: '2200 W' } },
  { keywords: ['meuleuse', '180', 'filaire'], spec: { title: 'Meuleuse 180 mm', power: '1750 W' } },
  { keywords: ['meuleuse', '125', 'filaire'], spec: { title: 'Meuleuse 125 mm', power: '1000 W' } },
  { keywords: ['meuleuse', 'filaire'], spec: { title: 'Meuleuse 125 mm', power: '1000 W' } },
  { keywords: ['perforateur', 'sds-max', 'filaire'], spec: { title: 'Perfo-burineur SDS-Max', power: '7.5 J', weight: '6.8 kg' } },
  { keywords: ['perforateur', 'sds max', 'filaire'], spec: { title: 'Perfo-burineur SDS-Max', power: '7.5 J', weight: '6.8 kg' } },
  { keywords: ['perforateur', 'sds-plus', 'filaire'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.8 J' } },
  { keywords: ['perforateur', 'sds plus', 'filaire'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.8 J' } },
  { keywords: ['perforateur', 'filaire'], spec: { title: 'Perfo-burineur SDS-Plus', power: '3.8 J' } },
  { keywords: ['burineur', 'sds-max', 'filaire'], spec: { title: 'Burineur SDS-Max', power: '14.3 J', weight: '10.2 kg' } },
  { keywords: ['burineur', 'sds max', 'filaire'], spec: { title: 'Burineur SDS-Max', power: '14.3 J', weight: '10.2 kg' } },
  { keywords: ['burineur', 'filaire'], spec: { title: 'Burineur SDS-Max', power: '14.3 J', weight: '10.2 kg' } },
  { keywords: ['scie', 'sabre', 'filaire'], spec: { title: 'Scie sabre', power: '1500 W' } },
  { keywords: ['scie', 'circulaire', 'filaire'], spec: { title: 'Scie circulaire', power: '190 mm' } },
  { keywords: ['aspirateur', 'filaire'], spec: { title: 'Aspirateur', power: '1200 W | 30 L' } },
];

// Fonction pour trouver specs par mots-clés
function findByKeywords(title: string): ProductSpec | null {
  const titleLower = title.toLowerCase();

  for (const match of KEYWORD_MATCHES) {
    const allKeywordsPresent = match.keywords.every(kw => titleLower.includes(kw.toLowerCase()));
    const noExcludedKeywords = !match.excludeKeywords || !match.excludeKeywords.some(kw => titleLower.includes(kw.toLowerCase()));

    if (allKeywordsPresent && noExcludedKeywords) {
      return match.spec;
    }
  }

  return null;
}

// ============================================
// Fonction pour trouver les specs d'un produit
// ============================================
const ALL_SPECS: Record<string, ProductSpec> = {
  ...M18_FUEL_PERCEUSES,
  ...M18_FUEL_VISSEUSES_CHOCS,
  ...M18_FUEL_BOULONNEUSES,
  ...M18_FUEL_CLIQUETS,
  ...M18_FUEL_PERFO_SDS_PLUS,
  ...M18_FUEL_PERFO_SDS_MAX,
  ...M18_FUEL_DEMOLISSEURS,
  ...M18_FUEL_MEULEUSES,
  ...M18_FUEL_SCIES_CIRCULAIRES,
  ...M18_FUEL_SCIES_ONGLET,
  ...M18_FUEL_SCIES_SABRES,
  ...M18_FUEL_SCIES_SAUTEUSES,
  ...M18_FUEL_SCIES_RUBAN,
  ...M18_FUEL_RAINUREUSES,
  ...M18_FUEL_PONCEUSES,
  ...M18_FUEL_RABOTS,
  ...M18_FUEL_DEFONCEUSES,
  ...M18_FUEL_CLOUEUSES,
  ...M18_FUEL_RIVETEUSES,
  ...M18_FUEL_COUPES,
  ...M18_FUEL_MULTIFONCTIONS,
  ...M18_FUEL_POLISSEUSES,
  ...M18_FUEL_CAROTTEUSES,
  ...M18_FUEL_PERCEUSES_MAGNETIQUES,
  ...M18_FUEL_POMPES,
  ...M18_FUEL_DECAPEURS,
  ...M18_FUEL_VISSEUSES_SPECIALES,
  ...M18_BRUSHLESS,
  ...M12_FUEL_PERCEUSES,
  ...M12_FUEL_VISSEUSES_CHOCS,
  ...M12_FUEL_BOULONNEUSES,
  ...M12_FUEL_PERFORATEURS,
  ...M12_FUEL_MEULEUSES,
  ...M12_FUEL_SCIES,
  ...M12_FUEL_OUTILS_SPECIAUX,
  ...M12_BRUSHLESS,
  ...MX_FUEL,
  ...FILAIRE_PERFORATEURS,
  ...FILAIRE_MEULEUSES,
  ...FILAIRE_PERCEUSES,
  ...FILAIRE_SCIES,
  ...FILAIRE_CAROTTEUSES,
  ...ASPIRATEURS,
  ...ECLAIRAGE,
  ...INSTRUMENTS_MESURE,
  ...JARDIN,
  ...AUDIO,
  ...VETEMENTS_CHAUFFANTS,
  ...CHARGEURS,
  ...BATTERIES,
};

export function getProductSpecs(title: string, reference: string): ProductSpec | null {
  const titleUpper = title.toUpperCase();
  const refUpper = reference.toUpperCase();

  // Recherche exacte d'abord (par code modèle)
  for (const [key, spec] of Object.entries(ALL_SPECS)) {
    const keyUpper = key.toUpperCase();
    if (refUpper.includes(keyUpper) || titleUpper.includes(keyUpper)) {
      return spec;
    }
  }

  // Recherche partielle (sans espaces)
  const titleNoSpace = titleUpper.replace(/\s+/g, '');
  const refNoSpace = refUpper.replace(/\s+/g, '');

  for (const [key, spec] of Object.entries(ALL_SPECS)) {
    const keyNoSpace = key.toUpperCase().replace(/\s+/g, '');
    if (refNoSpace.includes(keyNoSpace) || titleNoSpace.includes(keyNoSpace)) {
      return spec;
    }
  }

  // Fallback: recherche par mots-clés dans le titre
  const keywordMatch = findByKeywords(title);
  if (keywordMatch) {
    return keywordMatch;
  }

  return null;
}

// Fonction pour formater les specs pour l'affichage
export function formatProductSpecs(spec: ProductSpec): string {
  const parts: string[] = [];

  if (spec.power) parts.push(spec.power);
  if (spec.secondary) parts.push(spec.secondary);
  if (spec.weight) parts.push(spec.weight);

  return parts.join(' | ');
}

// ============================================
// Specs détaillées pour la page produit
// ============================================
export function getProductDetailSpecs(
  title: string,
  reference: string,
  productType: string,
  tags: string[]
): { label: string; value: string }[] {
  const tagsUpper = tags.map(t => t.toUpperCase());

  // Déterminer le voltage depuis les tags
  let voltage: string | undefined;
  if (tagsUpper.some(t => t === 'MX FUEL')) {
    voltage = 'MX FUEL (72V)';
  } else if (tagsUpper.some(t => t === 'M18')) {
    voltage = 'M18 (18V)';
  } else if (tagsUpper.some(t => t === 'M12')) {
    voltage = 'M12 (12V)';
  } else if (tagsUpper.some(t => t.includes('230V') || t.includes('FILAIRE'))) {
    voltage = '230V';
  }

  // Déterminer le type de moteur depuis les tags
  let moteur: string | undefined;
  if (tagsUpper.some(t => t === 'FUEL')) {
    moteur = 'Brushless POWERSTATE™';
  } else if (tagsUpper.some(t => t === 'BRUSHLESS')) {
    moteur = 'Brushless';
  }
  // Pas de moteur pour les filaires

  // Lookup spec via la fonction existante
  const spec = getProductSpecs(title, reference);

  // Classe de filtration pour aspirateurs (depuis les tags)
  let classeFiltration: string | undefined;
  if (tagsUpper.some(t => t === 'CLASSE H')) classeFiltration = 'Classe H';
  else if (tagsUpper.some(t => t === 'CLASSE M')) classeFiltration = 'Classe M';
  else if (tagsUpper.some(t => t === 'CLASSE L')) classeFiltration = 'Classe L';

  const type = productType.toLowerCase();
  const specs: { label: string; value: string | undefined }[] = [];

  if (type.includes('aspirateur')) {
    specs.push(
      { label: 'Tension', value: voltage },
      { label: 'Débit d\'air', value: spec?.power },
      { label: 'Capacité cuve', value: spec?.secondary },
      { label: 'Classe de filtration', value: classeFiltration },
      { label: 'Poids (sans batterie)', value: spec?.weight },
    );
  } else if (type.includes('perceuse') || type.includes('visseuse') || type.includes('perforateur') || type.includes('démolisseur') || type.includes('burineur')) {
    specs.push(
      { label: 'Tension', value: voltage },
      { label: 'Type de moteur', value: moteur },
      { label: type.includes('perforateur') || type.includes('démolisseur') || type.includes('burineur') ? 'Énergie de frappe' : 'Couple max', value: spec?.power },
      { label: 'Spec secondaire', value: spec?.secondary },
      { label: 'Poids', value: spec?.weight },
    );
  } else if (type.includes('meuleuse')) {
    specs.push(
      { label: 'Tension', value: voltage },
      { label: 'Type de moteur', value: moteur },
      { label: 'Diamètre disque', value: spec?.power },
      { label: 'Poids', value: spec?.weight },
    );
  } else if (type.includes('scie')) {
    specs.push(
      { label: 'Tension', value: voltage },
      { label: 'Type de moteur', value: moteur },
      { label: 'Vitesse', value: spec?.power },
      { label: 'Capacité de coupe', value: spec?.secondary },
      { label: 'Poids', value: spec?.weight },
    );
  } else if (type.includes('éclairage') || type.includes('eclairage') || type.includes('lampe') || type.includes('projecteur')) {
    specs.push(
      { label: 'Tension', value: voltage },
      { label: 'Luminosité', value: spec?.power },
      { label: 'Poids', value: spec?.weight },
    );
  } else if (type.includes('batterie') || type.includes('chargeur')) {
    specs.push(
      { label: 'Plateforme', value: voltage },
      { label: 'Capacité', value: spec?.power },
      { label: 'Poids', value: spec?.weight },
    );
  } else {
    // Fallback pour tout type inconnu
    specs.push(
      { label: 'Tension', value: voltage },
      { label: 'Type de moteur', value: moteur },
      { label: 'Caractéristique', value: spec?.power },
      { label: 'Poids', value: spec?.weight },
    );
  }

  // Filtrer les lignes sans valeur
  return specs.filter((s): s is { label: string; value: string } => !!s.value);
}
