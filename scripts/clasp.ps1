$nodeCandidates = @(
  (Join-Path $env:ProgramFiles 'nodejs\node.exe'),
  ((Get-Command node -ErrorAction SilentlyContinue).Source)
) | Where-Object { $_ -and (Test-Path $_) }

if (-not $nodeCandidates.Count) {
  Write-Error 'Node.js was not found. Install Node.js LTS before running clasp.'
  exit 1
}

$claspJs = Join-Path $env:APPDATA 'npm\node_modules\@google\clasp\build\src\index.js'
if (-not (Test-Path $claspJs)) {
  Write-Error 'clasp was not found. Install it with: npm install -g @google/clasp'
  exit 1
}

& $nodeCandidates[0] $claspJs @args
exit $LASTEXITCODE
