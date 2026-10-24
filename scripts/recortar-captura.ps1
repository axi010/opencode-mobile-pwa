# Recorta una captura de pantalla al area de la app movil (390x844 CSS px).
# Uso: pwsh scripts/recortar-captura.ps1 <entrada.png> <salida.png> [anchoCSS] [altoCSS] [dpr]
param(
  [Parameter(Mandatory = $true)][string]$Entrada,
  [Parameter(Mandatory = $true)][string]$Salida,
  [int]$AnchoCss = 390,
  [int]$AltoCss = 844,
  [double]$Dpr = 1.5
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile($Entrada)
try {
  $w = [int][Math]::Round($AnchoCss * $Dpr)
  $h = [int][Math]::Round($AltoCss * $Dpr)
  # no salirse de la imagen original
  if ($w -gt $src.Width) { $w = $src.Width }
  if ($h -gt $src.Height) { $h = $src.Height }

  $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  $dir = Split-Path -Parent $Salida
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($Salida, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()

  Write-Output "OK: $Salida  ($($w)x$h px)  desde $($src.Width)x$($src.Height)"
} finally {
  $src.Dispose()
}
