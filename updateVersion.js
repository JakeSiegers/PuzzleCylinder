var fs = require("fs");
fs.writeFileSync(process.argv[2]+'/version.html',Math.floor(Date.now() / 1000));