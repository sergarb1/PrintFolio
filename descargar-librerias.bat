@echo off
REM descargar-librerias.bat
REM Descarga las librerías necesarias para el modo offline
REM Uso: descargar-librerias.bat

setlocal enabledelayedexpansion

if not exist "%~dp0lib" mkdir "%~dp0lib"

echo === Descargando librerias para Creador de Hojas ===
echo.

call :descargar "https://unpkg.com/vue@3/dist/vue.global.prod.js" "%~dp0lib\vue.global.prod.js"
call :descargar "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" "%~dp0lib\jspdf.umd.min.js"

echo.
echo Todas las librerias descargadas en %~dp0lib
pause
exit /b

:descargar
echo Descargando %~nx2...
powershell -Command "Invoke-WebRequest -Uri '%~1' -OutFile '%~2'"
if !errorlevel! equ 0 (
    echo   OK -^> %~2
) else (
    echo   ERROR al descargar %~1
)
exit /b
