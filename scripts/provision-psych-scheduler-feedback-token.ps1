param(
  [string]$Label = '',
  [string]$OutputFile = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$existingTokenPath = Join-Path $repoRoot '.codex-local\psych-scheduler-feedback-admin-token.txt'
if (-not (Test-Path -LiteralPath $existingTokenPath)) {
  throw "Existing feedback admin token not found: $existingTokenPath"
}

if (-not $Label) {
  $machine = $env:COMPUTERNAME
  $Label = "workstation-$machine-$(Get-Date -Format yyyyMMdd-HHmmss)"
}

if (-not $OutputFile) {
  $safeLabel = ($Label -replace '[^A-Za-z0-9_.-]', '-')
  $OutputFile = Join-Path $repoRoot ".codex-local\psych-scheduler-feedback-admin-token-$safeLabel.txt"
}

$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$rng.Dispose()
$newToken = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')

$existingToken = [System.IO.File]::ReadAllText((Resolve-Path $existingTokenPath)).Trim()
$driveExecUrl = 'https://script.google.com/macros/s/AKfycbyMi0090cG0OpaW8vijCrijox-R1Y_d-4uGBbeg2Jq8KAYmICqctoF3ctZlqheHyEWC/exec'
$payload = @{
  op = 'registerFeedbackAdminToken'
  token = $existingToken
  label = $Label
  newToken = $newToken
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod -Uri $driveExecUrl -Method Post -ContentType 'text/plain;charset=utf-8' -Body $payload
if (-not $result.ok -or -not $result.registered) {
  throw "Feedback token registration failed: $($result.error)"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputFile) | Out-Null
Set-Content -Path $OutputFile -Value $newToken -NoNewline

[pscustomobject]@{
  Registered = $true
  Label = $Label
  OutputFile = (Resolve-Path $OutputFile).Path
  CopyToOtherComputerAs = '.codex-local\psych-scheduler-feedback-admin-token.txt'
}
