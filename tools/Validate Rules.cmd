@echo off
setlocal
cd /d "%~dp0.."
where node.exe >nul 2>nul
if not errorlevel 1 (
  node.exe "%~dp0validate-config.cjs"
) else if exist "%ProgramFiles%\nodejs\node.exe" (
  "%ProgramFiles%\nodejs\node.exe" "%~dp0validate-config.cjs"
) else (
  echo Node.js was not found. Install Node.js or run the validator from a Node-enabled terminal.
)
pause
