param(
	[int]$Port = 5443,
	[switch]$Open
)

Write-Host "=== Women Safety App: Start HTTPS ===" -ForegroundColor Cyan
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Resolve venv python (../.venv/Scripts/python.exe)
$venvPy = Join-Path $ScriptDir "..\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) {
	Write-Warning "Virtual env Python not found at $venvPy. Falling back to system 'python'."
	$venvPy = "python"
}

# Ensure cert/key exist
$certPath = Join-Path $ScriptDir 'cert.pem'
$keyPath = Join-Path $ScriptDir 'key.pem'
if (-not (Test-Path $certPath) -or -not (Test-Path $keyPath)) {
	Write-Error "Missing cert.pem/key.pem in $ScriptDir. Generate them first."
	exit 1
}

$env:USE_HTTPS = '1'
$env:HTTPS_PORT = "$Port"

Write-Host "Starting server on https://127.0.0.1:$Port ..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

# Optionally open the browser after a short delay
if ($Open) {
	Start-Job -ScriptBlock {
		param($p)
		Start-Sleep -Seconds 2
		Start-Process "https://127.0.0.1:$p"
	} -ArgumentList $Port | Out-Null
}

# Run the app with HTTPS flags to avoid env parsing issues in some shells
& $venvPy "app.py" "--https" "--https-port" "$Port"
