const fs = require('fs');

const csvPath = '/Users/nathan/Downloads/Produits.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Show first 2000 chars to understand format
console.log('=== First 2000 chars of CSV ===');
console.log(csvContent.substring(0, 2000));

console.log('\n\n=== Lines breakdown ===');
const lines = csvContent.split('\n');
console.log('Total lines:', lines.length);
console.log('First line (headers):', lines[0]);
console.log('\nSecond line (first data):');
console.log(lines[1]);
console.log('\nThird line:');
console.log(lines[2]);
