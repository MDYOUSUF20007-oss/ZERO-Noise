# Zero-Noise Phone Installer
$apkPath = Join-Path $PSScriptRoot "..\android\app\build\outputs\apk\strict\debug\app-strict-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "[!] Strict debug APK not found at $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   ZERO-NOISE PHONE INSTALLER / UPDATER   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "[*] Checking for connected Android device..." -ForegroundColor Yellow

$devices = adb devices
Write-Host "$devices"

if ($devices -notmatch "(?m)^\s*[a-zA-Z0-9_:-]+\s+(device|offline)\s*$") {
    Write-Host "[!] No device currently recognized by ADB." -ForegroundColor Yellow
    Write-Host "    --> Please connect your phone via USB cable or Wireless Debugging." -ForegroundColor White
    Write-Host "    --> Make sure Developer Options -> 'USB Debugging' is enabled." -ForegroundColor White
    Write-Host "[*] Waiting for device..." -ForegroundColor Cyan
}

adb wait-for-device
Write-Host "[*] Device detected! Installing update..." -ForegroundColor Cyan
$installResult = adb install -r -d "$apkPath"
Write-Host "$installResult"

if ($installResult -match "Success") {
    Write-Host "[SUCCESS] Zero-Noise updated successfully on your phone!" -ForegroundColor Green
} else {
    Write-Host "[!] Install finished with response: $installResult" -ForegroundColor Yellow
}
