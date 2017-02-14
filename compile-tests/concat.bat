@echo off
> concat.js (for /r "raw/" %%F in (*.js) do cat "%%F" "spacer.txt")
jsmin.exe <concat.js > min.js
java -jar closure-compiler-v20170124.jar --js concat.js --js_output_file compiled.js