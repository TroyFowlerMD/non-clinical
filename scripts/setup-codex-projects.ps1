param(
  [string]$ProjectsRoot = (Join-Path $HOME 'Documents\Codex\Projects'),
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repos = @(
  @{ Folder = 'non-clinical'; FullName = 'TroyFowlerMD/non-clinical'; Url = 'https://github.com/TroyFowlerMD/non-clinical.git' },
  @{ Folder = 'my-dashboard'; FullName = 'TroyFowlerMD/my-dashboard'; Url = 'https://github.com/TroyFowlerMD/my-dashboard.git' },
  @{ Folder = 'troyfowlermd.github.io'; FullName = 'TroyFowlerMD/troyfowlermd.github.io'; Url = 'https://github.com/TroyFowlerMD/troyfowlermd.github.io.git' },
  @{ Folder = 'IVC-Suite'; FullName = 'TroyFowlerMD/IVC-Suite'; Url = 'https://github.com/TroyFowlerMD/IVC-Suite.git' },
  @{ Folder = 'journal-club-hub'; FullName = 'TroyFowlerMD/journal-club-hub'; Url = 'https://github.com/TroyFowlerMD/journal-club-hub.git' },
  @{ Folder = 'psychometrics-hub'; FullName = 'TroyFowlerMD/psychometrics-hub'; Url = 'https://github.com/TroyFowlerMD/psychometrics-hub.git' },
  @{ Folder = 'sud-education-hub'; FullName = 'TroyFowlerMD/sud-education-hub'; Url = 'https://github.com/TroyFowlerMD/sud-education-hub.git' },
  @{ Folder = 'sud-patient-education'; FullName = 'TroyFowlerMD/sud-patient-education'; Url = 'https://github.com/TroyFowlerMD/sud-patient-education.git' },
  @{ Folder = 'cocm-pediatrico-honduras'; FullName = 'cocm-camasca/cocm-pediatrico-honduras'; Url = 'https://github.com/cocm-camasca/cocm-pediatrico-honduras.git' }
)

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "== $Message ==" -ForegroundColor Cyan
}

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [string]$WorkingDirectory = $PWD.Path
  )

  if ($DryRun) {
    Write-Host "DRY RUN: git $($Arguments -join ' ') [$WorkingDirectory]"
    return
  }

  Push-Location $WorkingDirectory
  try {
    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
  } finally {
    Pop-Location
  }
}

Write-Step "Checking Git"
$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCommand) {
  throw "Git was not found on PATH. Install GitHub Desktop or Git for Windows, then reopen PowerShell."
}
Write-Host "Using Git: $($gitCommand.Source)"
Invoke-Git -Arguments @('--version')

Write-Step "Configuring Git Credential Manager"
Invoke-Git -Arguments @('credential-manager', 'configure')
$accounts = ''
try {
  $accounts = (& git credential-manager github list 2>$null) -join "`n"
} catch {
  $accounts = ''
}

if ($accounts -notmatch 'TroyFowlerMD') {
  Write-Host "GitHub login is not saved for command-line Git yet." -ForegroundColor Yellow
  Write-Host "Run this once, then rerun this setup script:"
  Write-Host "git credential-manager github login --username TroyFowlerMD --device" -ForegroundColor Yellow
  if (-not $DryRun) {
    & git credential-manager github login --username TroyFowlerMD --device
  }
} else {
  Write-Host "GitHub credential found for TroyFowlerMD."
}

Write-Step "Preparing projects folder"
if ($DryRun) {
  Write-Host "DRY RUN: create folder $ProjectsRoot if needed"
} else {
  New-Item -ItemType Directory -Path $ProjectsRoot -Force | Out-Null
}

$summary = New-Object System.Collections.Generic.List[object]

foreach ($repo in $repos) {
  $target = Join-Path $ProjectsRoot $repo.Folder
  $gitDir = Join-Path $target '.git'

  Write-Step $repo.FullName

  if (Test-Path -LiteralPath $gitDir) {
    Push-Location $target
    try {
      $origin = (& git remote get-url origin 2>$null) -join ''
      $status = (& git status --short --branch) -join ' '
      Write-Host "Existing repo: $target"
      Write-Host "Origin: $origin"
      Write-Host "Status: $status"

      $dirty = (& git status --porcelain) -join ''
      if ([string]::IsNullOrWhiteSpace($dirty)) {
        Invoke-Git -Arguments @('pull', '--ff-only') -WorkingDirectory $target
        $finalStatus = (& git status --short --branch) -join ' '
        $summary.Add([pscustomobject]@{ Repo = $repo.Folder; Result = 'pulled or already current'; Status = $finalStatus }) | Out-Null
      } else {
        Write-Host "Working tree has local changes; skipping pull to avoid overwriting work." -ForegroundColor Yellow
        $summary.Add([pscustomobject]@{ Repo = $repo.Folder; Result = 'local changes, pull skipped'; Status = $status }) | Out-Null
      }
    } finally {
      Pop-Location
    }
    continue
  }

  if (Test-Path -LiteralPath $target) {
    Write-Host "Folder exists but is not a Git repo; leaving it untouched: $target" -ForegroundColor Yellow
    $summary.Add([pscustomobject]@{ Repo = $repo.Folder; Result = 'folder exists, not cloned'; Status = 'not a git repo' }) | Out-Null
    continue
  }

  Write-Host "Cloning to $target"
  Invoke-Git -Arguments @('clone', $repo.Url, $target) -WorkingDirectory $ProjectsRoot
  if (Test-Path -LiteralPath $gitDir) {
    Push-Location $target
    try {
      $status = (& git status --short --branch) -join ' '
      $summary.Add([pscustomobject]@{ Repo = $repo.Folder; Result = 'cloned'; Status = $status }) | Out-Null
    } finally {
      Pop-Location
    }
  }
}

Write-Step "Summary"
$summary | Format-Table -AutoSize

Write-Host ""
Write-Host "Next in GitHub Desktop:" -ForegroundColor Cyan
Write-Host "1. Set default clone directory to: $ProjectsRoot"
Write-Host "2. Use File > Add local repository for any repo that is not already listed."
Write-Host "3. Add the folders under $ProjectsRoot, not OneDrive."

Write-Host ""
Write-Host "Next in Codex Desktop:" -ForegroundColor Cyan
Write-Host "Open/start chats from the same local repo folders under $ProjectsRoot."
