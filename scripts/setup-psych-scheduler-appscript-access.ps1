param(
  [string]$FeedbackAdminToken = '',
  [string]$TokenFile = '',
  [switch]$VerifyOnly,
  [switch]$SkipLogin
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$tokenPath = Join-Path $repoRoot '.codex-local\psych-scheduler-feedback-admin-token.txt'
$driveExecUrl = 'https://script.google.com/macros/s/AKfycbyMi0090cG0OpaW8vijCrijox-R1Y_d-4uGBbeg2Jq8KAYmICqctoF3ctZlqheHyEWC/exec'
$claspCmd = Join-Path $repoRoot 'scripts\clasp.cmd'

function Write-Step {
  param([string]$Message)
  Write-Host ''
  Write-Host "== $Message ==" -ForegroundColor Cyan
}

function Get-PlainSecureString {
  param([securestring]$SecureString)

  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

function Find-Node {
  $candidate = Join-Path $env:ProgramFiles 'nodejs\node.exe'
  if (Test-Path -LiteralPath $candidate) { return $candidate }

  $command = Get-Command node -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  return ''
}

function Find-Npm {
  $candidate = Join-Path $env:ProgramFiles 'nodejs\npm.cmd'
  if (Test-Path -LiteralPath $candidate) { return $candidate }

  $command = Get-Command npm -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  return ''
}

function Install-NodeIfMissing {
  $node = Find-Node
  $npm = Find-Npm
  if ($node -and $npm) {
    Write-Host "Node found: $node"
    Write-Host "npm found: $npm"
    return
  }

  if ($VerifyOnly) {
    throw 'Node.js/npm are missing. Install Node.js LTS or rerun without -VerifyOnly.'
  }

  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) {
    throw 'Node.js/npm are missing and winget was not found. Install Node.js LTS manually, then rerun this script.'
  }

  Write-Host 'Node.js/npm not found. Installing Node.js LTS with winget...'
  & winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) { throw "winget Node.js install failed with exit code $LASTEXITCODE" }

  if (-not (Find-Node) -or -not (Find-Npm)) {
    throw 'Node.js installed, but this PowerShell session cannot see it yet. Close PowerShell, reopen it, and rerun this script.'
  }
}

function Install-ClaspIfMissing {
  $claspJs = Join-Path $env:APPDATA 'npm\node_modules\@google\clasp\build\src\index.js'
  if (Test-Path -LiteralPath $claspJs) {
    Write-Host "clasp found: $claspJs"
    return
  }

  if ($VerifyOnly) {
    throw 'clasp is missing. Rerun without -VerifyOnly to install it.'
  }

  $npm = Find-Npm
  if (-not $npm) { throw 'npm was not found; cannot install clasp.' }

  Write-Host 'Installing Google clasp globally...'
  & $npm install -g @google/clasp
  if ($LASTEXITCODE -ne 0) { throw "npm install -g @google/clasp failed with exit code $LASTEXITCODE" }
}

function Invoke-Clasp {
  param([string[]]$Arguments)

  if (-not (Test-Path -LiteralPath $claspCmd)) {
    throw "clasp wrapper not found: $claspCmd"
  }

  & $claspCmd @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "clasp $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Ensure-ClaspLogin {
  if ($SkipLogin) {
    Write-Host 'Skipping clasp login by request.'
    return
  }

  $clasprc = Join-Path $HOME '.clasprc.json'
  if (Test-Path -LiteralPath $clasprc) {
    Write-Host "clasp login file exists: $clasprc"
    return
  }

  if ($VerifyOnly) {
    throw 'clasp is not logged in. Rerun without -VerifyOnly and approve the browser login.'
  }

  Write-Host 'Starting clasp Google login. Use the Google account that owns the Psych Scheduler Apps Script.'
  Invoke-Clasp -Arguments @('login')
}

function Ensure-FeedbackToken {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $tokenPath) | Out-Null

  if (Test-Path -LiteralPath $tokenPath) {
    Write-Host "Feedback admin token file exists: $tokenPath"
    return
  }

  if ($TokenFile) {
    $fromFile = [System.IO.File]::ReadAllText((Resolve-Path $TokenFile))
    Set-Content -Path $tokenPath -Value $fromFile.Trim() -NoNewline
    Write-Host "Feedback admin token imported to: $tokenPath"
    return
  }

  if ($FeedbackAdminToken) {
    Set-Content -Path $tokenPath -Value $FeedbackAdminToken.Trim() -NoNewline
    Write-Host "Feedback admin token saved to: $tokenPath"
    return
  }

  if ($VerifyOnly) {
    throw "Feedback admin token file is missing: $tokenPath"
  }

  Write-Host 'Paste the Psych Scheduler feedback admin token. Input is hidden.' -ForegroundColor Yellow
  Write-Host 'You can copy it from the same .codex-local file on the already-configured workstation.'
  $secure = Read-Host 'Feedback admin token' -AsSecureString
  $plain = (Get-PlainSecureString $secure).Trim()
  if (-not $plain) {
    throw 'No token was entered. Request status updates will not work on this workstation.'
  }
  Set-Content -Path $tokenPath -Value $plain -NoNewline
  Write-Host "Feedback admin token saved to: $tokenPath"
}

function Test-FeedbackToken {
  $token = [System.IO.File]::ReadAllText((Resolve-Path $tokenPath)).Trim()
  $payload = @{ op = 'checkFeedbackAdminToken'; token = $token } | ConvertTo-Json -Compress
  $result = Invoke-RestMethod -Uri $driveExecUrl -Method Post -ContentType 'text/plain;charset=utf-8' -Body $payload

  if (-not $result.ok -or -not $result.authorized) {
    throw 'Feedback admin token check failed.'
  }

  Write-Host 'Feedback admin token verified.'
}

Write-Step 'Node.js and clasp'
Install-NodeIfMissing
Install-ClaspIfMissing
Invoke-Clasp -Arguments @('--version')

Write-Step 'Google Apps Script login'
Ensure-ClaspLogin
Invoke-Clasp -Arguments @('deployments')

Write-Step 'Feedback admin token'
Ensure-FeedbackToken
Test-FeedbackToken

Write-Host ''
Write-Host 'Psych Scheduler Apps Script access is ready on this workstation.' -ForegroundColor Green
