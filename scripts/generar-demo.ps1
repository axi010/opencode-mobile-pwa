#!/usr/bin/env pwsh
# Genera la DEMO PUBLICA en demo/ (para GitHub Pages): es el build de la app
# con un mock de datos ficticios, para que cualquiera vea la interfaz sin tener
# opencode instalado.
#
#   pwsh scripts/generar-demo.ps1
#
# Resultado: demo/index.html + demo/assets/... + demo/mock.js + demo/.nojekyll
# Publicacion (una vez):
#   git subtree push --prefix demo origin gh-pages
# o en GitHub: Settings -> Pages -> Deploy from branch -> gh-pages / (root)
param()
$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
$demo = Join-Path $raiz "demo"

Write-Host "== Generando demo publica ==" -ForegroundColor Cyan

# 1) build de produccion
Push-Location $raiz
try {
  npm run build | Out-Null
} finally {
  Pop-Location
}

# 2) limpiar demo/ (menos el mock.js, que es fuente)
Get-ChildItem $demo -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne "mock.js" } |
  ForEach-Object { Remove-Item $_.FullName -Recurse -Force }

# 3) copiar el build
Copy-Item (Join-Path $raiz "dist\*") $demo -Recurse -Force

# 4) inyectar el mock en el index.html (antes del modulo de la app)
$index = Join-Path $demo "index.html"
$html = Get-Content $index -Raw
$script = '<script src="./mock.js"></script>'
if ($html -notmatch "mock\.js") {
  # va justo antes del <script type="module"> de la app
  $html = $html -replace '(\s*<script type="module")', "`n    $script`$1"
  Set-Content -Path $index -Value $html -NoNewline -Encoding UTF8
}

# 5) .nojekyll (que Pages no procese con Jekyll: romperia ./assets)
New-Item -ItemType File -Force -Path (Join-Path $demo ".nojekyll") | Out-Null

Write-Host "Demo generada en: $demo" -ForegroundColor Green
Write-Host ""
Write-Host "Publicar con:" -ForegroundColor Yellow
Write-Host "  git add demo; git commit -m 'demo'; git subtree push --prefix demo origin gh-pages"
Write-Host "  (o Settings -> Pages -> Deploy from branch -> gh-pages)"
