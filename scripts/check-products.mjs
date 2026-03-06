import fs from 'fs';

async function main() {
  try {
    const productsRes = await fetch('http://localhost:3000/api/products');
    const data = await productsRes.json();
    console.log("Total length:", data.length);
    if(data.length > 0) {
      console.log(data[0]);
    }
  } catch(e) {
    console.log("Not running local dev server I assume or no API route.");
  }
}
main();
