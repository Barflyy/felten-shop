import fs from "fs";
import path from "path";

const IMAGES_DIR = path.resolve(__dirname, "../images");
const BOX_CONTENTS_FILE = path.resolve(
  __dirname,
  "../src/lib/box-contents.ts"
);

const ZERO_WIDTH_REGEX = /[\u200B\u200C\u200D\uFEFF\u00AD\u2060\u180E]/g;

function stripZeroWidth(s: string): string {
  return s.replace(ZERO_WIDTH_REGEX, "");
}

function stemWithoutHash(filename: string): string {
  const ext = path.extname(filename);
  const stem = filename.slice(0, -ext.length);
  const hashMatch = stem.match(/-[0-9a-f]{6}$/);
  if (hashMatch) {
    return stem.slice(0, -7);
  }
  return stem;
}

function normalize(s: string): string {
  let n = stripZeroWidth(s);
  n = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  n = n.replace(/[''ʼ`]/g, "");
  n = n.replace(/[˝″""⌀°&¼½¾]/g, "");
  n = n.replace(/-{2,}/g, "-");
  n = n.replace(/-$/, "").replace(/^-/, "");
  n = n.toLowerCase();
  return n;
}

function depluralize(s: string): string {
  return s.split("-").map(seg => {
    if (seg.length <= 2 || /^\d+$/.test(seg)) return seg;
    if (seg.endsWith("ss")) return seg;
    if (seg.endsWith("s")) return seg.slice(0, -1);
    return seg;
  }).join("-");
}

function longestCommonPrefix(a: string, b: string): number {
  const minLen = Math.min(a.length, b.length);
  let i = 0;
  while (i < minLen && a[i] === b[i]) i++;
  return i;
}

function extractTokens(stem: string): Set<string> {
  const normalized = normalize(stem);
  const parts = normalized.split("-").filter(p => p.length > 0);
  return new Set(parts);
}

function tokenSimilarity(a: Set<string>, b: Set<string>): number {
  let intersectionWeight = 0;
  let unionWeight = 0;

  const allTokens = new Set([...a, ...b]);
  for (const t of allTokens) {
    const weight = t.length;
    const inA = a.has(t) || [...a].some(at => depluralize(at) === depluralize(t));
    const inB = b.has(t) || [...b].some(bt => depluralize(bt) === depluralize(t));
    if (inA && inB) {
      intersectionWeight += weight;
    }
    unionWeight += weight;
  }

  return unionWeight > 0 ? intersectionWeight / unionWeight : 0;
}

/**
 * Manual fallback mappings for paths that automated matching can't resolve.
 * Key: the filename in box-contents (after /box-images/), Value: actual file on disk.
 * Empty string means no match exists on disk.
 */
const MANUAL_MAPPINGS: Record<string, string> = {
  // Polisseuses (typo "polisseusess" with double-s)
  "m18-fuel-polisseusess-orbitale-avec-une-.webp": "polisseuse-orbitale-m18-fuel-a-32863c.webp",
  "m18-fuel-polisseusess-orbitale-aléatoire.webp": "polisseuse-orbitale-aléatoire--43527d.webp",
  "m18-fuel-polisseusess.webp": "polisseuse-m18-fuel-1dfb15.webp",
  "m12-polisseusess-ponceuses-sous-compacte.webp": "polisseuseponceuse-m12-sous-co-5fbe78.webp",
  // Cisailles
  "m18-cisaille-métal---2-mm.webp": "cisaille-métallique-m18-compac-22babf.webp",
  "m18-cisaille-métal---1.2-mm.webp": "cisaille-métallique-m18-compac-d33fce.webp",
  // Scie à ruban
  "m12-scie-à-ruban---41mm.webp": "scie-à-ruban-m12-sous-compacte-8734a7.webp",
  // Pompes à graisse
  "m12-pompe-à-graisse.webp": "pistolet-graisseur-sous-compac-d09076.webp",
  "m18-pompe-à-graisse.webp": "pistolet-graisseur-m18-heavy-d-ba1382.webp",
  // Hydropass
  "m12-hydropass-pompe-à-eau.webp": "m12-hydropasspompe-à-eau-d674cb.webp",
  "m18-hydropass-pompe-à-eau.webp": "m12-hydropasspompe-à-eau-d674cb.webp",
  // ForgeNRG / NRG packs (m18)
  "m18-forgenrg-122dbsc.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-forgenrg-122.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-forgenrg-802dbsc.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-forgenrg-802.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-forgenrg-602dbsc.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-pack-hnrg-high-output-5,5-ah.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-nrg-502.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-nrg-402.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  "m18-pack-hnrg-high-output-3.0-ah.webp": "m18-forge-kit-de-batterie-et-c-ed3d85.webp",
  // Redlithium USB pack
  "pack-redlithium-4v,-usb.webp": "batterie-redlithium-usb-30-ah--2313e2.webp",
  // USB-C cable - no matching file
  "cable-usb-c.webp": "",
  // MX Fuel forge kit batteries
  "mx-fuel-forge-kit-batteriess-et-chargeur.webp": "batterie-mx-fuel-redlithium-60-d091cc.webp",
  // Perche d'élagage
  "m18-fuel-perche-d\u2019élagage-télescopique-3.webp": "perche-délagage-télescopique-3-862614.webp",
  "m18-fuel-perche-d'élagage-télescopique-3.webp": "perche-délagage-télescopique-3-862614.webp",
  // Sécateur sur perche
  "m18-sécateur-sur-perche-télescopique.webp": "sécateur-sur-perche-télescopiq-e462cc.webp",
  // Switch tank - no matching file on disk
  "m18-switch-tank-réservoir-à-eau-15l-.webp": "",
  "m18-switch-tank-réservoir-pour-produits-.webp": "",
  // Quik-lok accessories - map to the one accessoire file we have
  "accessoire-coupe-bordures-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  "accessoire-débroussailleuse-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  "accessoire-élagueuse-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  "accessoire-réciprocateur-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  "accessoire-dresse-bordures-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  "accessoire-tube-d'extension-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  "accessoire-balai-brosse-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  "accessoire-balai-racleur-quik-lok.webp": "accessoire-taille-haies-sur-pe-6565a7.webp",
  // Déboucheurs m12
  "m12-déboucheur-à-spirale-(-⌀-6---8mm).webp": "déboucheur-m12-sous-compact-av-2fd4c0.webp",
  "m12-déboucheur-haute-vitesse.webp": "m12-déboucheur-automatique-hau-faf731.webp",
  // Eclairage de poche aimanté
  "eclairage-de-poche-aimanté-usb-c.webp": "lampe-de-poche-usb-c-rechargea-57639b.webp",
  // Headlamp accessories - map to bolt headlamp
  "support-bolt.webp": "protège-nuque-bolt-5bebba.webp",
  "clips-fixation-casque.webp": "lampe-frontale-bolt-rechargeab-8ca1fb.webp",
  "bandeau-reglable.webp": "lampe-frontale-bolt-rechargeab-8ca1fb.webp",
  // M18 éclairage longue portée
  "m18-éclairage-longue-portée-led.webp": "lampe-torche-rechargeable-usb--449c26.webp",
  // M12 aspirateur autonome pour perforateur
  "m12-aspirateur-autonome-pour-perforateur.webp": "aspirateur-balai-m12-sous-comp-5d85d5.webp",
};

function main() {
  // 1. Read all filenames from images/
  const diskFiles = fs.readdirSync(IMAGES_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".webp", ".jpg", ".jpeg", ".png"].includes(ext);
  });
  console.log(`Found ${diskFiles.length} image files on disk.`);

  const exactLookup = new Set<string>(diskFiles);
  const normalizedStemToFiles = new Map<string, string[]>();
  const depluralizedStemToFiles = new Map<string, string[]>();
  const diskTokens = new Map<string, Set<string>>();

  for (const f of diskFiles) {
    const stem = stemWithoutHash(f);
    const normalizedStem = normalize(stem);
    const depluralizedNormStem = depluralize(normalizedStem);
    
    if (!normalizedStemToFiles.has(normalizedStem)) normalizedStemToFiles.set(normalizedStem, []);
    normalizedStemToFiles.get(normalizedStem)!.push(f);
    
    if (!depluralizedStemToFiles.has(depluralizedNormStem)) depluralizedStemToFiles.set(depluralizedNormStem, []);
    depluralizedStemToFiles.get(depluralizedNormStem)!.push(f);
    
    diskTokens.set(f, extractTokens(stem));
  }

  // 2. Read box-contents.ts
  let content = fs.readFileSync(BOX_CONTENTS_FILE, "utf-8");

  // 3. Extract all unique image paths
  const imagePathRegex = /"image":\s*"(\/box-images\/[^"]+)"/g;
  const allPaths = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = imagePathRegex.exec(content)) !== null) {
    allPaths.add(match[1]);
  }

  console.log(`Found ${allPaths.size} unique image paths in box-contents.ts.`);

  let alreadyCorrect = 0;
  let fixed = 0;
  let unfixable = 0;
  const replacements = new Map<string, string>();
  const unfixableList: string[] = [];

  for (const imgPath of allPaths) {
    const filename = imgPath.replace("/box-images/", "");
    const cleanedFilename = stripZeroWidth(filename);

    // 4a. Exact match on disk
    if (exactLookup.has(cleanedFilename)) {
      if (cleanedFilename !== filename) {
        replacements.set(imgPath, `/box-images/${cleanedFilename}`);
        fixed++;
      } else {
        alreadyCorrect++;
      }
      continue;
    }
    if (exactLookup.has(filename)) {
      alreadyCorrect++;
      continue;
    }

    // 4b. Check manual mappings (try original, cleaned, and stripped variants)
    const manualMatch = MANUAL_MAPPINGS[filename] 
      ?? MANUAL_MAPPINGS[cleanedFilename]
      ?? MANUAL_MAPPINGS[stripZeroWidth(filename)];
    if (manualMatch !== undefined) {
      if (manualMatch === "") {
        unfixable++;
        unfixableList.push(imgPath);
        continue;
      }
      if (exactLookup.has(manualMatch)) {
        const newPath = `/box-images/${manualMatch}`;
        if (newPath !== imgPath) {
          replacements.set(imgPath, newPath);
          fixed++;
          console.log(`  FIXED (manual): ${filename}`);
          console.log(`              -> ${manualMatch}`);
        } else {
          alreadyCorrect++;
        }
        continue;
      } else {
        console.log(`  WARNING: Manual mapping target not found on disk: ${manualMatch}`);
      }
    }

    const ext = path.extname(cleanedFilename);
    const fullStem = ext ? cleanedFilename.slice(0, -ext.length) : cleanedFilename;
    const normalizedFullStem = normalize(fullStem);
    const depluralizedFullStem = depluralize(normalizedFullStem);
    const pathTokens = extractTokens(fullStem);

    let bestMatch: string | null = null;
    let bestScore = 0;

    // Strategy 1: exact normalized stem match
    if (normalizedStemToFiles.has(normalizedFullStem)) {
      const candidates = normalizedStemToFiles.get(normalizedFullStem)!;
      const extMatch = candidates.filter(c => path.extname(c).toLowerCase() === ext.toLowerCase());
      bestMatch = extMatch.length > 0 ? extMatch[0] : candidates[0];
      bestScore = 999;
    }

    // Strategy 2: depluralized normalized stem match
    if (!bestMatch && depluralizedStemToFiles.has(depluralizedFullStem)) {
      const candidates = depluralizedStemToFiles.get(depluralizedFullStem)!;
      const extMatch = candidates.filter(c => path.extname(c).toLowerCase() === ext.toLowerCase());
      bestMatch = extMatch.length > 0 ? extMatch[0] : candidates[0];
      bestScore = 998;
    }

    // Strategy 3: Longest common prefix on normalized stems
    if (!bestMatch) {
      let bestPrefixLen = 0;
      for (const [normStem, files] of normalizedStemToFiles) {
        const prefixLen = longestCommonPrefix(normalizedFullStem, normStem);
        const minLen = Math.min(normalizedFullStem.length, normStem.length);
        const threshold = Math.max(10, Math.floor(minLen * 0.65));
        if (prefixLen >= threshold && prefixLen > bestPrefixLen) {
          const extMatch = files.filter(c => path.extname(c).toLowerCase() === ext.toLowerCase());
          bestMatch = extMatch.length > 0 ? extMatch[0] : files[0];
          bestPrefixLen = prefixLen;
          bestScore = prefixLen;
        }
      }
    }

    // Strategy 4: Longest common prefix on depluralized normalized stems
    if (!bestMatch || bestScore < 15) {
      let bestPrefixLen = bestScore;
      for (const [deplurStem, files] of depluralizedStemToFiles) {
        const prefixLen = longestCommonPrefix(depluralizedFullStem, deplurStem);
        const minLen = Math.min(depluralizedFullStem.length, deplurStem.length);
        const threshold = Math.max(10, Math.floor(minLen * 0.65));
        if (prefixLen >= threshold && prefixLen > bestPrefixLen) {
          const extMatch = files.filter(c => path.extname(c).toLowerCase() === ext.toLowerCase());
          const candidate = extMatch.length > 0 ? extMatch[0] : files[0];
          bestMatch = candidate;
          bestPrefixLen = prefixLen;
          bestScore = prefixLen;
        }
      }
    }

    // Strategy 5: Token-based similarity
    if (!bestMatch || bestScore < 15) {
      let bestTokenScore = 0;
      for (const [diskFile, dTokens] of diskTokens) {
        if (path.extname(diskFile).toLowerCase() !== ext.toLowerCase()) continue;
        const similarity = tokenSimilarity(pathTokens, dTokens);
        if (similarity > 0.45 && similarity > bestTokenScore) {
          bestTokenScore = similarity;
          if (similarity > bestScore / 50) {
            bestMatch = diskFile;
            bestScore = similarity * 50;
          }
        }
      }
    }

    if (bestMatch) {
      const newPath = `/box-images/${bestMatch}`;
      if (newPath !== imgPath) {
        replacements.set(imgPath, newPath);
        fixed++;
        console.log(`  FIXED: ${filename}`);
        console.log(`      -> ${bestMatch}`);
      } else {
        alreadyCorrect++;
      }
    } else {
      unfixable++;
      unfixableList.push(imgPath);
    }
  }

  // 5. Apply replacements
  for (const [oldPath, newPath] of replacements) {
    const escaped = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    content = content.replace(new RegExp(escaped, "g"), newPath);
  }

  // 6. Write back
  fs.writeFileSync(BOX_CONTENTS_FILE, content, "utf-8");

  // 7. Report
  console.log("\n=== REPORT ===");
  console.log(`Total unique paths checked: ${allPaths.size}`);
  console.log(`Already correct:            ${alreadyCorrect}`);
  console.log(`Fixed:                      ${fixed}`);
  console.log(`Unfixable:                  ${unfixable}`);

  if (unfixableList.length > 0) {
    console.log("\nUnfixable paths (no matching file on disk):");
    for (const p of unfixableList) {
      console.log(`  ${p}`);
    }
  }
}

main();
