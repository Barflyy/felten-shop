const filterProducts = (products, tab) => {
  if (tab === 'tous') return products;

  // Extended keywords to match more Milwaukee tools
  const keywords = {
    perceuses: ['perceuse', 'perforateur', 'carotteuse', 'fraiseuse', 'perçage'],
    visseuses: ['visseuse', 'boulonneuse', 'cliquet', 'tournevis', 'vissage'],
    meuleuses: ['meuleuse', 'tronconneuse', 'decoupeuse', 'polisseuse', 'meulage'],
    batteries: ['batterie', 'chargeur', 'pack nrg', 'm18b', 'm18hb', 'm12b', 'energie'],
  };

  const terms = keywords[tab];

  return products.filter((p) => {
    // Combine all relevant searchable fields
    const textToSearch = [
      p.title,
      p.productType,
      ...(p.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    // Normalize text to remove accents (e.g. "perceuse" matches "perçage", "meuleuse" matches "découpeuse")
    const normalizedText = textToSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return terms.some((t) => {
      const normalizedTerm = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedText.includes(normalizedTerm);
    });
  });
}

const mockProducts = [
  {
    title: "M18 FPD2-502X",
    productType: "Perceuse visseuse à percussion",
    tags: ["M18", "FUEL", "Perceuse"]
  },
  {
    title: "M18 ONEFHIWF1D-121C",
    productType: "Boulonneuse à chocs",
    tags: ["M18", "ONE-KEY", "Boulonneuse"]
  },
  {
    title: "M18 CAG125X-0",
    productType: "Meuleuse d'angle",
    tags: ["M18", "Meuleuse"]
  },
  {
    title: "AG 800-115E",
    productType: "",
    tags: ["Meuleuse", "Filaire"]
  }
];

console.log("Perceuses:", filterProducts(mockProducts, "perceuses").length);
console.log("Visseuses:", filterProducts(mockProducts, "visseuses").length);
console.log("Meuleuses:", filterProducts(mockProducts, "meuleuses").length);
