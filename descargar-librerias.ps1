<#
    descargar-librerias.ps1
    Descarga las librerías necesarias para el modo offline
    Uso: .\descargar-librerias.ps1
#>

$libDir = Join-Path $PSScriptRoot "lib"
if (!(Test-Path $libDir)) { New-Item -ItemType Directory -Path $libDir }

$librerias = @(
    @{ Url = "https://unpkg.com/vue@3/dist/vue.global.prod.js"; Archivo = "vue.global.prod.js" },
    @{ Url = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; Archivo = "jspdf.umd.min.js" }
)

foreach ($lib in $librerias) {
    $ruta = Join-Path $libDir $lib.Archivo
    Write-Host "Descargando $($lib.Archivo)..."
    Invoke-WebRequest -Uri $lib.Url -OutFile $ruta
    Write-Host "  OK -> $ruta"
}

Write-Host "Todas las librerías descargadas en $libDir"
