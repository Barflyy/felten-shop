// Servante (tool cabinet) configurator data
// Based on Milwaukee TOOLGUARD™ steel storage lineup

export type DrawerSize = '1/3' | '2/3' | '3/3'

export interface Cabinet {
  id: string
  name: string
  description: string
  image: string
  frontalView: string
  frontalViewExpanded?: string
  drawers: number
  configurableDrawers: number
  width: string
  color: 'red' | 'black'
}

export interface TopChest {
  id: string
  name: string
  ref: string
  image: string
  drawers: number
  compatibleCabinets: string[] // cabinet ids
}

export interface Insert {
  id: string
  name: string
  image: string
  size: DrawerSize
  category: string
}

export interface DrawerConfig {
  drawerId: number
  inserts: Insert[]
  totalSize: number // sum of 1/3 values (max 3)
}

export const cabinets: Cabinet[] = [
  {
    id: 'stc30-red',
    name: 'Servante TOOLGUARD™ 7 tiroirs 30″ / 78 cm',
    description: '7 tiroirs, rouge',
    image: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC30/product-display-img.png?ext=.png',
    frontalView: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC30/frontal-view-default.png?ext=.png',
    frontalViewExpanded: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC30/frontal-view-expanded.png?ext=.png',
    drawers: 7,
    configurableDrawers: 6,
    width: '78 cm',
    color: 'red',
  },
  {
    id: 'stc30-black',
    name: 'Servante TOOLGUARD™ 7 tiroirs 30″ / 78 cm',
    description: '7 tiroirs, noire',
    image: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC-30-7-2/4932500742-Hero_2.png?ext=.png',
    frontalView: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC-30-7-2/4932478851-Hero_4.png?ext=.png',
    drawers: 7,
    configurableDrawers: 6,
    width: '78 cm',
    color: 'black',
  },
  {
    id: 'stc46',
    name: 'Servante TOOLGUARD™ 10 tiroirs grande capacité 46″ / 117 cm',
    description: '10 tiroirs, grande capacité',
    image: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/STC46/product-display-img.png?ext=.png',
    frontalView: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/STC46/frontal-view-default.png?ext=.png',
    drawers: 10,
    configurableDrawers: 5,
    width: '117 cm',
    color: 'red',
  },
  {
    id: 'wtc40',
    name: 'Chariot de travail TOOLGUARD™ en acier 40″ / 102 cm',
    description: 'Chariot de travail mobile',
    image: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SWC40/product-display-img.png?ext=.png',
    frontalView: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SWC40/frontal-view-default.png?ext=.png',
    drawers: 6,
    configurableDrawers: 1,
    width: '102 cm',
    color: 'red',
  },
  {
    id: 'stc27-red',
    name: 'Servante TOOLGUARD™ 7 tiroirs 27″ / 69 cm',
    description: '7 tiroirs, compacte, rouge',
    image: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC27/4932498252-Hero_2.png?ext=.png',
    frontalView: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC27/4932498252-Hero_1.png?ext=.png',
    drawers: 7,
    configurableDrawers: 6,
    width: '69 cm',
    color: 'red',
  },
  {
    id: 'stc27-black',
    name: 'Servante TOOLGUARD™ 7 tiroirs 27″ / 69 cm',
    description: '7 tiroirs, compacte, noire',
    image: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC27-7-2/4932500740-Hero_2.png?ext=.png',
    frontalView: 'https://static.milwaukeetool.eu/NetC.MilwaukeeTools/media/steel-storage/Configurator/SRC27-7-2/4932500740-Hero_2.png?ext=.png',
    drawers: 7,
    configurableDrawers: 6,
    width: '69 cm',
    color: 'black',
  },
]

export const topChests: TopChest[] = [
  {
    id: 'stc30-top',
    name: 'Coffre supérieur 4 tiroirs pour servante 30″ / 78 cm',
    ref: 'STC30-1',
    image: 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi/4932478850--Hero_1.png?v=AB1B4BEEF15D333BDF8F6AA621B67397&width=300',
    drawers: 4,
    compatibleCabinets: ['stc30-red', 'stc30-black'],
  },
]

export const insertCategories = [
  'Tous',
  'Douilles & Cliquets',
  'Clés',
  'Tournevis',
  'Pinces',
  'Outils de frappe',
  'Outils généraux',
  'Modules vides',
] as const

const CDN = 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi'

export const inserts: Insert[] = [
  // --- Douilles & Cliquets ---
  {
    id: '4932479824',
    name: 'Jeu de clés à cliquet et de douilles 1/4″ avec mousse intégré',
    image: `${CDN}/4932479824--Hero_1.jpg?v=0D724291035D2D349F479DB736905C10&width=300`,
    size: '1/3',
    category: 'Douilles & Cliquets',
  },
  {
    id: '4932479825',
    name: 'Jeu de clés à cliquet et de douilles 3/8″ avec mousse intégré',
    image: `${CDN}/4932479825--Hero_1.jpg?v=1D757932E188EEF457D30EB83105FB3A&width=300`,
    size: '1/3',
    category: 'Douilles & Cliquets',
  },
  {
    id: '4932479826',
    name: 'Jeu de clés à cliquet et de douilles 1/2″ avec mousse intégré',
    image: `${CDN}/4932479826--Hero_1.jpg?v=56F5954CF3ECA588EE8FC323D8E86978&width=300`,
    size: '1/3',
    category: 'Douilles & Cliquets',
  },
  {
    id: '4932493396',
    name: 'Module douille à choc 3/4″ - 12 pcs',
    image: `${CDN}/4932493396--Hero_1.jpg?v=8D5EB0EF8A12B107A8C3368DB6A6428B&width=300`,
    size: '3/3',
    category: 'Douilles & Cliquets',
  },
  {
    id: '4932493398',
    name: 'Module douille à choc longue 3/4″ - 12 pcs',
    image: `${CDN}/4932493398--Hero_1.jpg?v=D2DF47AF3C8FC2B8095CAA6B32133085&width=300`,
    size: '3/3',
    category: 'Douilles & Cliquets',
  },
  // --- Clés ---
  {
    id: '4932479827',
    name: 'Module mousse clés mixtes MAX BITE™',
    image: `${CDN}/4932479827--Hero_1.jpg?v=5E00C6CA62FA11928017EDB1D1BC76EE&width=300`,
    size: '1/3',
    category: 'Clés',
  },
  {
    id: '4932479828',
    name: 'Module mousse clés à cliquet MAX BITE™',
    image: `${CDN}/4932479828--Hero_1.jpg?v=17CA7AD75D6AFFCD9D562AB6CC32DA60&width=300`,
    size: '1/3',
    category: 'Clés',
  },
  {
    id: '4932479829',
    name: 'Module mousse clés à cliquet tête flexible MAX BITE™',
    image: `${CDN}/4932479829--Hero_1.jpg?v=8718EB0BBE3F46F7C3A1F9D469B1E39D&width=300`,
    size: '1/3',
    category: 'Clés',
  },
  {
    id: '4932493247',
    name: 'Module servante clés MAX BITE™ (27 pc)',
    image: `${CDN}/4932493247--Hero_1.jpg?v=8E08F2975B78E3508172968ECEDAF1C2&width=300`,
    size: '3/3',
    category: 'Clés',
  },
  {
    id: '4932493248',
    name: 'Module servante clé à cliquets MAXBITE™ 22pc',
    image: `${CDN}/4932493248--Hero_1.jpg?v=870337E731FD500587C42A5384DB96C0&width=300`,
    size: '3/3',
    category: 'Clés',
  },
  {
    id: '4932492397',
    name: 'Module servante clés à molette',
    image: `${CDN}/4932492397--Hero_1.jpg?v=902DDEA810DF45D94C3C7CCF37B215A7&width=300`,
    size: '1/3',
    category: 'Clés',
  },
  {
    id: '4932493628',
    name: 'Module clé à tuyauter 6 pcs',
    image: `${CDN}/4932493628--Hero_1.jpg?v=FC958343E173B0B4E2D02D5C06720A78&width=300`,
    size: '1/3',
    category: 'Clés',
  },
  {
    id: '4932493629',
    name: 'Module clé plate 10 pcs',
    image: `${CDN}/4932493629--Hero_1.jpg?v=0D44846324E5D564F6D17B4A79CBD88C&width=300`,
    size: '1/3',
    category: 'Clés',
  },
  {
    id: '4932493630',
    name: 'Module clé plate 4 pc',
    image: `${CDN}/4932493630--Hero_1.jpg?v=889ECBA9EE527FA1A99DFE9B371B7089&width=300`,
    size: '1/3',
    category: 'Clés',
  },
  // --- Tournevis ---
  {
    id: '4932479830',
    name: 'Module mousse tournevis Trilobe',
    image: `${CDN}/4932479830--Hero_1.jpg?v=6F410BEEA5E199BB8E8416438224C484&width=300`,
    size: '3/3',
    category: 'Tournevis',
  },
  {
    id: '4932492391',
    name: 'Module servante tournevis Torx 7 pièces',
    image: `${CDN}/4932492391--Hero_1.jpg?v=D32CCEBA6EFDD32AF5A19E345691328D&width=300`,
    size: '1/3',
    category: 'Tournevis',
  },
  {
    id: '4932492392',
    name: 'Module servante tournevis Torx 6 pièces',
    image: `${CDN}/4932492392--Hero_1.jpg?v=3B1D4B4F0E335DF5ACFBA30CC0C20873&width=300`,
    size: '1/3',
    category: 'Tournevis',
  },
  {
    id: '4932492393',
    name: 'Module servante tournevis PH 5 pièces',
    image: `${CDN}/4932492393--Hero_1.jpg?v=FDEF66B60740A4BCCD7819E07570ECAB&width=300`,
    size: '1/3',
    category: 'Tournevis',
  },
  {
    id: '4932492395',
    name: 'Module servante tournevis SL 7 pièces',
    image: `${CDN}/4932492395--Hero_1.jpg?v=90E3562AFD99DC845352E917505AB374&width=300`,
    size: '1/3',
    category: 'Tournevis',
  },
  {
    id: '4932492394',
    name: 'Module servante tournevis SL & PH 7 pièces',
    image: `${CDN}/4932492394--Hero_1.jpg?v=40CEA043FA94202EFB8673B0C30B3B9F&width=300`,
    size: '1/3',
    category: 'Tournevis',
  },
  {
    id: '4932493249',
    name: 'Module servante tournevis VDE Tri-lobe (8pc)',
    image: `${CDN}/4932493249--Hero_1.jpg?v=FCDCFF9933B4B5B625E1A6D9F956A6DB&width=300`,
    size: '1/3',
    category: 'Tournevis',
  },
  // --- Pinces ---
  {
    id: '4932493251',
    name: 'Module servante pince-étau (11pc)',
    image: `${CDN}/4932493251--Hero_1.jpg?v=5E8F2C3F29EEDE974108B1B760FB1811&width=300`,
    size: '3/3',
    category: 'Pinces',
  },
  {
    id: '4932493255',
    name: 'Module pinces étau et pince multi 2 pcs',
    image: `${CDN}/4932493255--Hero_1.jpg?v=8D2A22FBE8F7DEBB49913110A1EAA127&width=300`,
    size: '1/3',
    category: 'Pinces',
  },
  {
    id: '4932493256',
    name: 'Module servante set 3 pinces',
    image: `${CDN}/4932493256--Hero_1.jpg?v=E2DE655FDF83FBD6E19B222BF6D764EB&width=300`,
    size: '1/3',
    category: 'Pinces',
  },
  {
    id: '4932493631',
    name: 'Module pince 4pc',
    image: `${CDN}/4932493631--Hero_1.jpg?v=46B573727E5889A1E4E3448939E34B71&width=300`,
    size: '1/3',
    category: 'Pinces',
  },
  {
    id: '4932493632',
    name: 'Module pince circlip 3pc',
    image: `${CDN}/4932493632--Hero_1.jpg?v=7310447EC92FC7B2AE236D2EF0E1726F&width=300`,
    size: '1/3',
    category: 'Pinces',
  },
  {
    id: '4932493633',
    name: 'Module pince circlip 6pcs',
    image: `${CDN}/4932493633--Hero_1.jpg?v=C66F1C22CA3FE41FE27F90E67B1B5875&width=300`,
    size: '2/3',
    category: 'Pinces',
  },
  {
    id: '4932493634',
    name: 'Module pince étau 5pc',
    image: `${CDN}/4932493634--Hero_1.jpg?v=0045C2C7E9C5AE882C6FF596E13A742B&width=300`,
    size: '2/3',
    category: 'Pinces',
  },
  // --- Outils de frappe ---
  {
    id: '4932493253',
    name: 'Module marteau rivoir et maillet de carrossier (2pcs)',
    image: `${CDN}/4932493253--Hero_1.jpg?v=A79E3CEBD97E1084B193EA0129F91B16&width=300`,
    size: '1/3',
    category: 'Outils de frappe',
  },
  {
    id: '4932493254',
    name: 'Module marteau SHOCKSHIELD et maillet anti rebond (2pcs)',
    image: `${CDN}/4932493254--Hero_1.jpg?v=122220D98ED364AFE9C99740167A12A0&width=300`,
    size: '1/3',
    category: 'Outils de frappe',
  },
  // --- Outils généraux ---
  {
    id: '4932493252',
    name: 'Module servante mesure et découpe (3pc)',
    image: `${CDN}/4932493252--Hero_1.jpg?v=8220A06354319040DA0C1137C79FC564&width=300`,
    size: '1/3',
    category: 'Outils généraux',
  },
  {
    id: '4932493257',
    name: 'Module servante outillage générale - 15 pcs',
    image: `${CDN}/4932493257--Hero_1.jpg?v=3C3AF5D59FD261F4B148177992FE1E7D&width=300`,
    size: '3/3',
    category: 'Outils généraux',
  },
  // --- Modules vides ---
  {
    id: '4932493662',
    name: 'Module vide cliquet et douilles 28 pcs',
    image: `${CDN}/4932493662--Hero_1.jpg?v=0D2D05A534B920406635EC2A253317C9&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493663',
    name: 'Module vide cliquet et douilles 32 pcs',
    image: `${CDN}/4932493663--Hero_1.jpg?v=B84CBE63375233E543A9CA574989C4F2&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493664',
    name: 'Module vide cliquet et douille 1/2″ 28 pcs',
    image: `${CDN}/4932493664--Hero_1.jpg?v=E8AFEFA5670FB391075264FF6EFA8784&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493665',
    name: 'Module vide clé mixte MaxBite 15 pcs',
    image: `${CDN}/4932493665--Hero_1.jpg?v=EFA3C5E387E7E22733E3329248E09E21&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493666',
    name: 'Module vide set clé à cliquet MaxBite 15 pcs',
    image: `${CDN}/4932493666--Hero_1.jpg?v=0C20C09526F953DFB76EE4D4B4FB376C&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493667',
    name: 'Module vide clés à cliquet MaxBite tête flexible 15 pcs',
    image: `${CDN}/4932493667--Hero_1.jpg?v=A8A4C4F3DB2D0063B725DCA51C7F9E82&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493669',
    name: 'Module vide tournevis Torx 7 pcs',
    image: `${CDN}/4932493669--Hero_1.jpg?v=4BBB6D229384E8E1ED76433998B14FE9&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493671',
    name: 'Module vide tournevis PH 5 pcs',
    image: `${CDN}/4932493671--Hero_1.jpg?v=3FD3B22672A64B0DD291443C14C0D886&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493672',
    name: 'Module vide tournevis PH & SL 7 pcs',
    image: `${CDN}/4932493672--Hero_1.jpg?v=8BABEE2DA36697F30986BDD52018EC74&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493673',
    name: 'Module vide set tournevis SL 7 pcs',
    image: `${CDN}/4932493673--Hero_1.jpg?v=126A6839B00566DACE0ACFB344180364&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493674',
    name: 'Module vide pince multiprise 3 pcs',
    image: `${CDN}/4932493674--Hero_1.jpg?v=9F79515A9490C9B7220F6854DA78A731&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493675',
    name: 'Module vide pince VDE 4 pcs',
    image: `${CDN}/4932493675--Hero_1.jpg?v=0549B93CE29B7E579141972A665EE86E&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493676',
    name: 'Module vide clés mixtes MaxBite 27 pc',
    image: `${CDN}/4932493676--Hero_1.jpg?v=7DAF954A1F4081B51D2E26D7CA1C7463&width=300`,
    size: '3/3',
    category: 'Modules vides',
  },
  {
    id: '4932493677',
    name: 'Module vide clés à cliquet MaxBite tête flexible 22 pcs',
    image: `${CDN}/4932493677--Hero_1.jpg?v=88FAA8867AF243A3E8D0163D3A5DFCE2&width=300`,
    size: '3/3',
    category: 'Modules vides',
  },
  {
    id: '4932493678',
    name: 'Module vide set tournevis isolés 8 pcs',
    image: `${CDN}/4932493678--Hero_1.jpg?v=B56E6328D7475EE4F72C2B022ED7A537&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493680',
    name: 'Module vide pince à bougie antiparasite 11 pcs',
    image: `${CDN}/4932493680--Hero_1.jpg?v=628E973037944FCBE2400D58AF956C13&width=300`,
    size: '3/3',
    category: 'Modules vides',
  },
  {
    id: '4932493681',
    name: 'Module vide coupe et mesure 3 pc',
    image: `${CDN}/4932493681--Hero_1.jpg?v=F4731425A269B2E757ED1FFC36A0D0AA&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493682',
    name: 'Module vide marteau rivoir et maillet carrossier',
    image: `${CDN}/4932493682--Hero_1.jpg?v=3038F537B9DFD0321FD2658A3F5BBAC9&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493683',
    name: 'Module vide marteau SHOCKSHIELD et maillet anti rebond 2 pc',
    image: `${CDN}/4932493683--Hero_1.jpg?v=B9A2EE1CF94E16A38672A3644D2FB1D8&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493684',
    name: 'Module vide pince étau et pince multi 2 pcs',
    image: `${CDN}/4932493684--Hero_1.jpg?v=6DF09398EC3B641E82D4CEB1D7508807&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
  {
    id: '4932493685',
    name: 'Module vide set pinces 3 pcs',
    image: `${CDN}/4932493685--Hero_1.jpg?v=2E9818D78EFA62F8C9303664460DE3CB&width=300`,
    size: '1/3',
    category: 'Modules vides',
  },
]

export function sizeToNumber(size: DrawerSize): number {
  switch (size) {
    case '1/3': return 1
    case '2/3': return 2
    case '3/3': return 3
  }
}

export function canFitInDrawer(currentTotal: number, insertSize: DrawerSize): boolean {
  return currentTotal + sizeToNumber(insertSize) <= 3
}
