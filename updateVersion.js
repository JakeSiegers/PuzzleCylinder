let fs = require("fs");
let timestamp = Math.floor(Date.now()/1000);
fs.writeFileSync(process.argv[2]+'/version.html',timestamp);

let html = fs.readFileSync(process.argv[2]+'/index_template.html','utf8');
html = html.replace(/{noCache}/g,'?v='+timestamp);
fs.writeFileSync(process.argv[2]+'/index.html',html);