@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo 未找到 Node.js。请先安装 Node.js 18 或更高版本：
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo.
echo 正在启动「练记」本地服务...
echo 手机与电脑连接同一个 Wi-Fi 后，用手机打开下面显示的 Phone 地址。
echo.
node serve.mjs

pause
