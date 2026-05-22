param(
  [Parameter(Mandatory = $true)][string]$RequestId,
  [Parameter(Mandatory = $true)][ValidateSet('open','needs_clarification','in_progress','done','wont_do','duplicate','test')][string]$Status,
  [string]$CodexNotes = '',
  [string]$ResolutionNotes = '',
  [string]$TokenPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not $TokenPath) {
  $TokenPath = Join-Path $repoRoot '.codex-local\psych-scheduler-feedback-admin-token.txt'
}

if (-not (Test-Path -LiteralPath $TokenPath)) {
  throw "Feedback admin token file not found: $TokenPath. Run scripts\setup-psych-scheduler-appscript-access.ps1 first."
}

$token = [System.IO.File]::ReadAllText((Resolve-Path $TokenPath)).Trim()
$driveExecUrl = 'https://script.google.com/macros/s/AKfycbyMi0090cG0OpaW8vijCrijox-R1Y_d-4uGBbeg2Jq8KAYmICqctoF3ctZlqheHyEWC/exec'

$payload = @{
  op = 'updateFeedbackStatus'
  token = $token
  requestId = $RequestId
  status = $Status
  codexNotes = $CodexNotes
  resolutionNotes = $ResolutionNotes
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod -Uri $driveExecUrl -Method Post -ContentType 'text/plain;charset=utf-8' -Body $payload
if (-not $result.ok) {
  throw "Feedback status update failed: $($result.error)"
}

$result
