import { filterProducts } from '../src/components/homepage/utils/filter.js';

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
