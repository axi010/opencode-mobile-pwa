# Acceso de la PWA al movil por HTTPS (contexto seguro: PIN + SW + notificaciones).
#
# Que hace:
#   1. Localiza cloudflared.
#   2. Comprueba que la PWA esta servida (preview de Vite en :4173). Si no, la arranca.
#   3. Levanta un tunel rapido de Cloudflare -> https://<algo>.trycloudflare.com
#   4. Genera el QR con qr-pairing.mjs apuntando a esa URL (el server= sigue siendo
#      el tunel del API de opencode, que ya existe).
#   5. Imprime la URL y la ruta del QR.
#
# Uso:
#   pwsh scripts/movil.ps1            # preview + tunel + QR
#   pwsh scripts/movil.ps1 -NoTunnel  # solo QR (usa la ultima URL de tunel guardada)
#
# NOTA: la URL de trycloudflare cambia en cada arranque -> hay que reescanear el QR.
param(
  [switch]$NoTunnel,
  [int]$Puerto = 4173,
  [string]$UrlGuardada = "$env:TEMP\opencode\movil-url.txt"
)

$ErrorActionPreference = "Stop"
$pwaDir = Split-Path -Parent $PSScriptRoot   # .../opencode-mobile
Write-Host "== Acceso movil de la PWA ==" -ForegroundColor Cyan

function Get-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidatos = @(
    "$env:ProgramFiles\cloudflared\cloudflared.exe",
    "${env:ProgramFiles(x86)}\cloudflared\cloudflared.exe",
    "$env:LOCALAPPDATA\cloudflared\cloudflared.exe"
  )
  foreach ($c in $candidatos) { if (Test-Path $c) { return $c } }
  # paquetes de winget
  $winget = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter "cloudflared.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($winget) { return $winget.FullName }
  return $null
}

function Test-Pwa {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$Puerto/" -TimeoutSec 4
    return $r.StatusCode -eq 200
  } catch { return $false }
}

# --- 2) PWA servida ---
if (-not (Test-Pwa)) {
  Write-Host "La PWA no responde en :$Puerto -> arrancando preview..." -ForegroundColor Yellow
  Start-Process -FilePath "npm" -ArgumentList "run", "preview", "--", "--port", "$Puerto" -WorkingDirectory $pwaDir -WindowStyle Hidden
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Pwa) { break }
  }
  if (-not (Test-Pwa)) { throw "La preview no arranco en :$Puerto" }
}
Write-Host "PWA OK en http://localhost:$Puerto" -ForegroundColor Green

# --- 3) Tunel ---
$pwaUrl = $null
if ($NoTunnel) {
  if (Test-Path $UrlGuardada) { $pwaUrl = (Get-Content $UrlGuardada -Raw).Trim() }
  if (-not $pwaUrl) { throw "No hay URL de tunel guardada. Ejecuta sin -NoTunnel." }
  Write-Host "Usando URL guardada: $pwaUrl" -ForegroundColor Yellow
} else {
  $cf = Get-Cloudflared
  if (-not $cf) { throw "cloudflared no encontrado. Instalalo: winget install Cloudflare.cloudflared" }
  Write-Host "cloudflared: $cf" -ForegroundColor DarkGray

  $logOut = "$env:TEMP\opencode\cf-out.log"
  $logErr = "$env:TEMP\opencode\cf-err.log"
  New-Item -ItemType Directory -Force -Path (Split-Path $logOut) | Out-Null
  Remove-Item $logOut, $logErr -ErrorAction SilentlyContinue

  $proc = Start-Process -FilePath $cf -ArgumentList "tunnel", "--url", "http://localhost:$Puerto", "--no-autoupdate" `
    -RedirectStandardOutput $logOut -RedirectStandardError $logErr -WindowStyle Hidden -PassThru

  Write-Host "Levantando tunel..." -ForegroundColor Yellow
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Seconds 1
    $txt = ""
    foreach ($f in @($logErr, $logOut)) { if (Test-Path $f) { $txt += (Get-Content $f -Raw -ErrorAction SilentlyContinue) } }
    $m = [regex]::Match($txt, "https://[a-z0-9-]+\.trycloudflare\.com")
    if ($m.Success) { $pwaUrl = $m.Value; break }
    if ($proc.HasExited) { throw "cloudflared termino antes de tiempo. Revisa $logErr" }
  }
  if (-not $pwaUrl) { throw "No se obtuvo la URL del tunel en 40 s. Revisa $logErr" }

  Set-Content -Path $UrlGuardada -Value $pwaUrl -Encoding UTF8
  Write-Host "Tunel PWA: $pwaUrl" -ForegroundColor Green
  Write-Host "(PID cloudflared: $($proc.Id) — para cortarlo: Stop-Process -Id $($proc.Id))" -ForegroundColor DarkGray
}

# --- 4) QR ---
Write-Host "Generando QR..." -ForegroundColor Yellow
Push-Location $pwaDir
try {
  node "scripts/qr-pairing.mjs" $pwaUrl
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Escanea el QR desde el movil (misma WiFi o datos)." -ForegroundColor Cyan
Write-Host "El QR abre la PWA por HTTPS: PIN, service worker y notificaciones activos." -ForegroundColor Cyan
Write-Host "IMPORTANTE: la URL del tunel cambia en cada arranque -> reescanea el QR." -ForegroundColor Yellow
