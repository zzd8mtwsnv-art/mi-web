@echo off
chcp 65001 >nul
title StudyFlow - Centro de Estudio Inteligente
color 0B

echo ======================================================================
echo           ?? INICIANDO STUDYFLOW - CENTRO DE ESTUDIO
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Localizar Node.js en el sistema
set "NODE_BIN="
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "NODE_BIN=node"
) else if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_BIN=C:\Program Files\nodejs\node.exe"
    set "PATH=C:\Program Files\nodejs;%PATH%"
) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE_BIN=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_BIN=C:\Program Files\nodejs (x86)\node.exe"
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
)

if "%NODE_BIN%"=="" (
    color 0C
    echo [ERROR] No se ha encontrado Node.js en tu equipo.
    echo Por favor, instala Node.js desde https://nodejs.org/ para ejecutar StudyFlow.
    echo.
    pause
    exit /b 1
)

:: 2. Comprobar si las dependencias locales existen (para no reinstalar cada vez)
if not exist "node_modules\" (
    echo [1/3] Primera ejecucion detectada: Instalando dependencias necesarias...
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] No se pudieron instalar las dependencias correctamente.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencias locales verificadas.
)

:: 3. Preparar apertura automática del navegador cuando el servidor responda
echo [2/3] Iniciando servidor de StudyFlow...
start /b "" powershell -NoProfile -Command "$url = 'http://localhost:5173/'; $started = Get-Date; while ((Get-Date) - $started -lt [TimeSpan]::FromSeconds(25)) { try { $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; if ($res.StatusCode -eq 200) { Start-Process $url; break } } catch { Start-Sleep -Milliseconds 400 } }"

echo [3/3] Servidor listo. Abriendo navegador en http://localhost:5173...
echo.
echo ======================================================================
echo   ? StudyFlow está activo en: http://localhost:5173
echo   ?? Mantén esta ventana abierta mientras utilices la aplicación.
echo   ?? Para cerrar StudyFlow, simplemente cierra esta ventana.
echo ======================================================================
echo.

:: 4. Ejecutar Vite
call npm run dev -- --host 0.0.0.0 --port 5173

if %ERRORLEVEL% neq 0 (
    echo.
    echo El servidor se ha detenido.
    pause
)