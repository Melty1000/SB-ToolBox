const pako = require('pako');
const json = JSON.stringify({ name: 'test' });
const compressed = pako.gzip(json);
const header = Buffer.from('SBAE');
const finalData = Buffer.concat([header, compressed]);
const base64 = finalData.toString('base64');
console.log('Base64:', base64);
console.log('Decoded start:', finalData.slice(0, 4).toString());
console.log('Compressed start:', compressed[0].toString(16), compressed[1].toString(16));
