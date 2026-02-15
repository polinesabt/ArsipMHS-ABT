param(
  [string]$Domain = "arsipmhs-abt.com",
  [string]$CronSecret = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$baseUrl = "https://$Domain"
$apiBase = "$baseUrl/database/backend/api"
$script:FailureCount = 0

function Invoke-RequestSafe {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers = @{},
    [string]$Body = ""
  )

  $result = [ordered]@{
    StatusCode = -1
    ContentType = ""
    Content = ""
    Error = ""
  }

  try {
    if ($Method -eq "GET") {
      $response = Invoke-WebRequest -Uri $Url -Method Get -Headers $Headers -UseBasicParsing
    } elseif ($Method -eq "POST") {
      $response = Invoke-WebRequest -Uri $Url -Method Post -Headers $Headers -Body $Body -UseBasicParsing
    } else {
      throw "Unsupported method: $Method"
    }
    $result.StatusCode = [int]$response.StatusCode
    $result.Content = [string]$response.Content
    $result.ContentType = [string]$response.Headers["Content-Type"]
  } catch {
    if ($_.Exception.Response -ne $null) {
      $httpResponse = $_.Exception.Response
      $result.StatusCode = [int]$httpResponse.StatusCode
      try {
        $reader = New-Object System.IO.StreamReader($httpResponse.GetResponseStream())
        $result.Content = $reader.ReadToEnd()
      } catch {
        $result.Content = ""
      }
      try {
        $result.ContentType = [string]$httpResponse.Headers["Content-Type"]
      } catch {
        $result.ContentType = ""
      }
    } else {
      $result.Error = $_.Exception.Message
    }
  }

  return [pscustomobject]$result
}

function Write-TestResult {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Detail
  )
  if ($Passed) {
    Write-Host "[OK]   $Name - $Detail"
  } else {
    Write-Host "[FAIL] $Name - $Detail"
    $script:FailureCount += 1
  }
}

Write-Host "Running smoke tests for $baseUrl"

$homeResponse = Invoke-RequestSafe -Method "GET" -Url $baseUrl
Write-TestResult -Name "Homepage" `
  -Passed ($homeResponse.StatusCode -eq 200 -and $homeResponse.Content -match "<div id=`"root`">") `
  -Detail ("HTTP {0}" -f $homeResponse.StatusCode)

$deepRoute = Invoke-RequestSafe -Method "GET" -Url "$baseUrl/admin-dashboard"
Write-TestResult -Name "SPA Deep Route" `
  -Passed ($deepRoute.StatusCode -eq 200 -and $deepRoute.Content -match "<div id=`"root`">") `
  -Detail ("HTTP {0}" -f $deepRoute.StatusCode)

$dbHealth = Invoke-RequestSafe -Method "GET" -Url "$apiBase/test_db.php"
$dbHealthPassed = $dbHealth.StatusCode -eq 200 -and `
  $dbHealth.ContentType -match "application/json" -and `
  $dbHealth.Content -match '"success"\s*:'
Write-TestResult -Name "API DB Health JSON" `
  -Passed $dbHealthPassed `
  -Detail ("HTTP {0}; Content-Type: {1}" -f $dbHealth.StatusCode, $dbHealth.ContentType)

$envProbe = Invoke-RequestSafe -Method "GET" -Url "$baseUrl/.env.production"
Write-TestResult -Name ".env exposure" `
  -Passed ($envProbe.StatusCode -in @(403, 404)) `
  -Detail ("HTTP {0}" -f $envProbe.StatusCode)

$cronUnauthorized = Invoke-RequestSafe -Method "POST" -Url "$apiBase/evaluations/cron_reminder.php" -Headers @{ "Content-Type" = "application/json" } -Body "{}"
$cronUnauthorizedPassed = $cronUnauthorized.StatusCode -eq 401 -and $cronUnauthorized.ContentType -match "application/json"
Write-TestResult -Name "Cron Unauthorized" `
  -Passed $cronUnauthorizedPassed `
  -Detail ("HTTP {0}; Content-Type: {1}" -f $cronUnauthorized.StatusCode, $cronUnauthorized.ContentType)

if ($CronSecret -ne "") {
  $cronAuthorized = Invoke-RequestSafe `
    -Method "POST" `
    -Url "$apiBase/evaluations/cron_reminder.php" `
    -Headers @{ "X-CRON-SECRET" = $CronSecret; "Content-Type" = "application/json" } `
    -Body "{}"
  $cronAuthorizedPassed = $cronAuthorized.StatusCode -eq 200 -and $cronAuthorized.ContentType -match "application/json"
  Write-TestResult -Name "Cron Authorized" `
    -Passed $cronAuthorizedPassed `
    -Detail ("HTTP {0}; Content-Type: {1}" -f $cronAuthorized.StatusCode, $cronAuthorized.ContentType)
} else {
  Write-Host "[SKIP] Cron Authorized - pass -CronSecret to validate authorized cron request"
}

if ($script:FailureCount -gt 0) {
  exit 1
}
