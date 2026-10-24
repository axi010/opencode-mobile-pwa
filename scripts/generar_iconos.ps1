# Genera los iconos PNG de la PWA (System.Drawing, sin dependencias externas).
# Uso: powershell -File scripts\generar_iconos.ps1
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\public"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

function New-Icon([int]$size, [string]$path) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = "AntiAlias"
    $g.TextRenderingHint = "AntiAlias"
    # Fondo oscuro con esquinas redondeadas simuladas por el circulo accent
    $g.Clear([System.Drawing.Color]::FromArgb(255, 13, 17, 23))
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 66, 147, 255))
    $pad = [int]($size * 0.08)
    $g.FillEllipse($brush, $pad, $pad, ($size - 2 * $pad), ($size - 2 * $pad))
    $font = New-Object System.Drawing.Font("Segoe UI", ([int]($size * 0.30)), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = "Center"
    $fmt.LineAlignment = "Center"
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $g.DrawString("OC", $font, [System.Drawing.Brushes]::White, $rect, $fmt)
    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "OK: $path"
}

New-Icon 192 (Join-Path $outDir "icon-192.png")
New-Icon 512 (Join-Path $outDir "icon-512.png")
