@echo off
CHCP 65001
set PORT=8000
set FILENAME=index.html

echo 正在启动本地服务器 (端口：%PORT%)...
echo 请勿关闭此窗口！

:: 1. 启动浏览器并访问网页
start "" "http://localhost:%PORT%/%FILENAME%"


:: start "Python Server" python -m http.server %PORT%

python -m http.server %PORT%

pause