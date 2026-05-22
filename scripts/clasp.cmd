@echo off
setlocal

set "NODE=%ProgramFiles%\nodejs\node.exe"
if not exist "%NODE%" set "NODE=node"

set "CLASP=%APPDATA%\npm\node_modules\@google\clasp\build\src\index.js"
if not exist "%CLASP%" (
  echo clasp was not found. Install it with: npm install -g @google/clasp
  exit /b 1
)

"%NODE%" "%CLASP%" %*
exit /b %ERRORLEVEL%
