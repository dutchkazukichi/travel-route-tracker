@echo off
echo 旅行ルートトラッカーを起動しています...
echo.
echo ブラウザで以下のURLにアクセスしてください:
echo http://localhost:3000
echo.
echo スマホからアクセスする場合は、PCと同じネットワークに接続して
echo このPCのIPアドレス:3000 にアクセスしてください
echo.
python -m http.server 3000
