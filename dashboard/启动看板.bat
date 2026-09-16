@echo off
chcp 65001 >nul
title 图书馆数据看板
cd /d %~dp0

echo 正在清理 8765 端口的旧进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8765" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

echo 正在启动看板服务...
start "dashboard-server" cmd /k "python server.py"

timeout /t 2 >nul
start "" "http://127.0.0.1:8765/"

echo.
echo 已在浏览器打开 http://127.0.0.1:8765/
echo 服务器运行在标题为 dashboard-server 的黑色窗口里,关闭它即停止服务。
echo 本窗口可以关闭了。
pause
