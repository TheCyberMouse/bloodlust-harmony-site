@echo off
rem One-click site publish: commits everything and pushes.
rem Vercel auto-deploys from the push (site + MCP projects).
cd /d "%~dp0"
git add -A
git commit -m "content: site update"
git push
echo.
echo Pushed. Vercel is deploying; the site updates in about two minutes.
pause
