# Zero-Noise One-Click Phone Updater
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   ZERO-NOISE PHONE INSTALLER / UPDATER   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$apkPath = "$PSScriptRoot\android\app\build\outputs\apk\strict\debug\app-strict-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "[!] Strict debug APK not found locally. Searching release assets..." -ForegroundColor Yellow
    $apkPath = "$PSScriptRoot\release-assets\ZERO-requires-adb-v1.0.143-preview.apk"
}

if (-not (Test-Path $apkPath)) {
    Write-Host "[!] Local APK not found. Downloading v1.0.143 from GitHub..." -ForegroundColor Yellow
    $apkPath = "$PSScriptRoot\ZERO-v1.0.143.apk"
    Invoke-WebRequest -Uri "https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases/download/v1.0.143/ZERO-requires-adb-v1.0.143-preview.apk" -OutFile $apkPath
}

Write-Host "[+] Target APK: $apkPath" -ForegroundColor Green
Write-Host "[*] Checking device connection..." -ForegroundColor Yellow

$devices = adb devices
Write-Host "$devices"

if ($devices -match "offline") {
    Write-Host "[!] Phone is currently OFFLINE to ADB." -ForegroundColor Yellow
    Write-Host "    --> Please UNLOCK your phone screen now." -ForegroundColor Magenta
    Write-Host "    --> Check your phone screen for 'Allow USB debugging?' and tap ALLOW." -ForegroundColor Magenta
}

Write-Host "[*] Waiting for device to authorize..." -ForegroundColor Cyan
adb wait-for-device

Write-Host "[*] Device detected! Installing update..." -ForegroundColor Cyan
$installResult = adb install -r "$apkPath"
Write-Host "$installResult"

if ($installResult -match "Success") {
    Write-Host "[SUCCESS] Zero-Noise updated successfully on your phone!" -ForegroundColor Green
} else {
    Write-Host "[!] Install response: $installResult" -ForegroundColor Yellow
}
