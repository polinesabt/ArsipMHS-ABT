param(
  [string]$Domain = "arsipmhs-abt.com",
  [string]$CronSecret = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$baseUrl = "https://$Domain"
$apiBase = "$baseUrl/backend/api"
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

$settingsResponse = Invoke-RequestSafe -Method "GET" -Url "$apiBase/settings/get_settings.php"
$settingsJson = $null
try {
  $settingsJson = $settingsResponse.Content | ConvertFrom-Json
} catch {
  $settingsJson = $null
}
$settingsPassed = $settingsResponse.StatusCode -eq 200 -and `
  $settingsResponse.ContentType -match "application/json" -and `
  $settingsJson -ne $null -and $settingsJson.success -eq $true
Write-TestResult -Name "API settings and DB connection" `
  -Passed $settingsPassed `
  -Detail ("HTTP {0}; Content-Type: {1}" -f $settingsResponse.StatusCode, $settingsResponse.ContentType)

$studentsAnonymous = Invoke-RequestSafe -Method "GET" -Url "$apiBase/students/list.php?limit=1"
Write-TestResult -Name "Student list requires login" `
  -Passed ($studentsAnonymous.StatusCode -eq 401 -and $studentsAnonymous.ContentType -match "application/json") `
  -Detail ("HTTP {0}; Content-Type: {1}" -f $studentsAnonymous.StatusCode, $studentsAnonymous.ContentType)

$tracerAnonymous = Invoke-RequestSafe -Method "GET" -Url "$apiBase/tracer/list.php"
Write-TestResult -Name "Tracer list requires login" `
  -Passed ($tracerAnonymous.StatusCode -eq 401 -and $tracerAnonymous.ContentType -match "application/json") `
  -Detail ("HTTP {0}; Content-Type: {1}" -f $tracerAnonymous.StatusCode, $tracerAnonymous.ContentType)

$achievementsAnonymous = Invoke-RequestSafe -Method "GET" -Url "$apiBase/achievements/list.php"
Write-TestResult -Name "Achievements list requires login" `
  -Passed ($achievementsAnonymous.StatusCode -eq 401 -and $achievementsAnonymous.ContentType -match "application/json") `
  -Detail ("HTTP {0}; Content-Type: {1}" -f $achievementsAnonymous.StatusCode, $achievementsAnonymous.ContentType)

$loginGet = Invoke-RequestSafe -Method "GET" -Url "$apiBase/auth/login.php"
Write-TestResult -Name "Login rejects GET" `
  -Passed ($loginGet.StatusCode -eq 405 -and $loginGet.ContentType -match "application/json") `
  -Detail ("HTTP {0}; Content-Type: {1}" -f $loginGet.StatusCode, $loginGet.ContentType)

$envProbe = Invoke-RequestSafe -Method "GET" -Url "$baseUrl/.env"
Write-TestResult -Name ".env exposure" `
  -Passed ($envProbe.StatusCode -in @(403, 404)) `
  -Detail ("HTTP {0}" -f $envProbe.StatusCode)

$sqlProbe = Invoke-RequestSafe -Method "GET" -Url "$baseUrl/backend/database/install.sql"
Write-TestResult -Name "Backend SQL access denied" `
  -Passed ($sqlProbe.StatusCode -in @(403, 404)) `
  -Detail ("HTTP {0}" -f $sqlProbe.StatusCode)

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
