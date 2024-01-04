const fs = require('fs');
const zlib = require('zlib');

const src = fs.createReadStream('./QiniuManager.js');
const writeDesc = fs.createWriteStream('./QiniuManager.gz');
src.pipe(zlib.createGzip()).pipe(writeDesc);
