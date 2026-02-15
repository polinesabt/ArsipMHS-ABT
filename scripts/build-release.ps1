param(
  [string]$Domain = "arsipmhs-abt.com",
  [string]$OutputDir = "release",
  [switch]$SkipInstall,
  [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

function Assert-PathExists {
  param([string]$PathToCheck)
  if (-not (Test-Path $PathToCheck)) {
    throw "Missing required path: $PathToCheck"
  }
}

Push-Location $repoRoot
try {
  if (-not $SkipInstall) {
    Write-Host "Installing dependencies (npm ci)..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
      throw "npm ci failed with exit code $LASTEXITCODE"
    }
  }

  if (-not $SkipBuild) {
    Write-Host "Building production assets (npm run build)..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
      throw "npm run build failed with exit code $LASTEXITCODE"
    }
  }

  Assert-PathExists "dist/index.html"
  Assert-PathExists "dist/.htaccess"
  Assert-PathExists "database/backend/api"
  Assert-PathExists "database/backend/config"
  Assert-PathExists "database/schema.sql"
  Assert-PathExists "database/seed.sql"

  $releaseRoot = Join-Path $repoRoot $OutputDir
  $stagingRoot = Join-Path $releaseRoot "staging-$timestamp"
  $publicRoot = Join-Path $stagingRoot "public_html"
  $backendRoot = Join-Path $publicRoot "database/backend"
  $dbRoot = Join-Path $stagingRoot "database"

  New-Item -ItemType Directory -Path $releaseRoot -Force | Out-Null
  New-Item -ItemType Directory -Path $publicRoot -Force | Out-Null
  New-Item -ItemType Directory -Path $backendRoot -Force | Out-Null
  New-Item -ItemType Directory -Path $dbRoot -Force | Out-Null

  Write-Host "Copying frontend build..."
  Get-ChildItem -Path "dist" -Force | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $publicRoot -Recurse -Force
  }

  Write-Host "Copying backend API/config..."
  Copy-Item -Path "database/backend/api" -Destination $backendRoot -Recurse -Force
  Copy-Item -Path "database/backend/config" -Destination $backendRoot -Recurse -Force

  Write-Host "Pruning local logs and backup artifacts from release..."
  $apiReleasePath = Join-Path $backendRoot "api"
  if (Test-Path $apiReleasePath) {
    Get-ChildItem -Path $apiReleasePath -Recurse -File | Where-Object {
      $_.Extension -in @(".log", ".zip", ".bak", ".backup")
    } | Remove-Item -Force

    $logsDir = Join-Path $apiReleasePath "logs"
    if (Test-Path $logsDir) {
      Remove-Item -Path $logsDir -Recurse -Force
    }
  }

  Write-Host "Copying SQL files..."
  Copy-Item -Path "database/schema.sql" -Destination (Join-Path $dbRoot "schema.sql") -Force
  Copy-Item -Path "database/seed.sql" -Destination (Join-Path $dbRoot "seed.sql") -Force

  $notes = @"
DEPLOYMENT NOTES
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Domain:
https://$Domain

API base URL:
https://$Domain/database/backend/api

Required env file location on server:
public_html/.env.production

Cron schedule:
0 * * * *

Cron command:
curl -sS -X POST "https://$Domain/database/backend/api/evaluations/cron_reminder.php" -H "X-CRON-SECRET: <CRON_SECRET>" -H "Content-Type: application/json" -d "{}" > /dev/null 2>&1
"@

  Set-Content -Path (Join-Path $stagingRoot "DEPLOY_NOTES.txt") -Value $notes

  $zipPath = Join-Path $releaseRoot "arsipmhs2-cpanel-$timestamp.zip"
  if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
  }

  Write-Host "Creating release archive..."
  Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $zipPath -CompressionLevel Optimal

  Remove-Item -Path $stagingRoot -Recurse -Force

  Write-Host "Release bundle created:"
  Write-Host $zipPath
} finally {
  Pop-Location
}
