@echo off
:: Run this once as Administrator to allow phone access to Vite on port 5173
netsh advfirewall firewall delete rule name="SwayamKrushi Vite Dev 5173" >nul 2>&1
netsh advfirewall firewall add rule name="SwayamKrushi Vite Dev 5173" dir=in action=allow protocol=TCP localport=5173 profile=any
echo.
echo Firewall opened for port 5173.
echo On your phone (same Wi-Fi), open:
echo   http://192.168.1.2:5173/
echo   or
echo   http://192.168.1.3:5173/
echo.
pause
