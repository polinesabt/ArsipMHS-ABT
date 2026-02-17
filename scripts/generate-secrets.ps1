param(
  [int]$HexBytes = 32,
  [int]$DbPasswordLength = 24,
  [switch]$WriteEnvSnippet,
  [string]$OutFile = ".env.secrets"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-HexSecret {
  param([int]$Bytes)
  if ($Bytes -lt 16) {
    throw "HexBytes must be >= 16"
  }
  $buffer = New-Object byte[] $Bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buffer)
  return ($buffer | ForEach-Object { $_.ToString("x2") }) -join ""
}

function New-StrongPassword {
  param([int]$Length)
  if ($Length -lt 16) {
    throw "DbPasswordLength must be >= 16"
  }

  $upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  $lower = "abcdefghijkmnopqrstuvwxyz"
  $digits = "23456789"
  $symbols = "!@#$%^&*_-+=?"
  $all = ($upper + $lower + $digits + $symbols).ToCharArray()

  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $chars = New-Object System.Collections.Generic.List[char]

  $seedPools = @($upper.ToCharArray(), $lower.ToCharArray(), $digits.ToCharArray(), $symbols.ToCharArray())
  foreach ($pool in $seedPools) {
    $b = New-Object byte[] 4
    $rng.GetBytes($b)
    $idx = [BitConverter]::ToUInt32($b, 0) % $pool.Length
    [void]$chars.Add($pool[$idx])
  }

  while ($chars.Count -lt $Length) {
    $b = New-Object byte[] 4
    $rng.GetBytes($b)
    $idx = [BitConverter]::ToUInt32($b, 0) % $all.Length
    [void]$chars.Add($all[$idx])
  }

  for ($i = $chars.Count - 1; $i -gt 0; $i--) {
    $b = New-Object byte[] 4
    $rng.GetBytes($b)
    $j = [BitConverter]::ToUInt32($b, 0) % ($i + 1)
    $tmp = $chars[$i]
    $chars[$i] = $chars[$j]
    $chars[$j] = $tmp
  }

  return -join $chars
}

$dbPass = New-StrongPassword -Length $DbPasswordLength
$jwtSecret = New-HexSecret -Bytes $HexBytes
$cronSecret = New-HexSecret -Bytes $HexBytes

$lines = @(
  "DB_PASS=$dbPass",
  "JWT_SECRET=$jwtSecret",
  "CRON_SECRET=$cronSecret"
)

Write-Host "Generated production secrets:"
$lines | ForEach-Object { Write-Host $_ }

if ($WriteEnvSnippet) {
  Set-Content -Path $OutFile -Value ($lines -join [Environment]::NewLine)
  Write-Host "Saved env snippet to $OutFile"
}
