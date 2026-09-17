@echo off
cd /d %~dp0
start "my-dashboard-server" cmd /k "py server.py"
echo Waiting for server to start...
timeout /t 3 >nul
start "" "http://127.0.0.1:8766/"
echo Dashboard opened at http://127.0.0.1:8766/
echo Close the my-dashboard-server window to stop the service.
pause
