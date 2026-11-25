# Zero-Noise One-Click Phone Updater
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   ZERO-NOISE PHONE INSTALLER / UPDATER   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$targetVersion = "v1.0.159"
$apkPath = "$PSScriptRoot\ZERO-requires-adb-$targetVersion.apk"
if (-not (Test-Path $apkPath)) {
    $apkPath = "$PSScriptRoot\ZERO-$targetVersion.apk"
}

if (-not (Test-Path $apkPath)) {
    Write-Host "[!] Local $targetVersion APK not found. Downloading from GitHub..." -ForegroundColor Yellow
    $apkPath = "$PSScriptRoot\ZERO-requires-adb-$targetVersion.apk"
    Invoke-WebRequest -Uri "https://github.com/MDYOUSUF20007-oss/ZERO-Noise/releases/download/$targetVersion/ZERO-requires-adb-$targetVersion.apk" -OutFile $apkPath
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

$attached = ($devices -split "`r?`n" | Where-Object { $_ -match "\bdevice\b" -and $_ -notmatch "List of devices" })
if (-not $attached) {
    Write-Host "[!] No authorized phone detected via ADB." -ForegroundColor Yellow
    Write-Host "    --> Plug your phone into the computer via USB cable." -ForegroundColor Yellow
    Write-Host "    --> Enable USB Debugging in Developer Options." -ForegroundColor Yellow
    Write-Host "    --> If prompted, tap 'Allow USB debugging' on your phone." -ForegroundColor Yellow
    Write-Host "[*] Waiting for device to connect and authorize..." -ForegroundColor Cyan
}

adb wait-for-device

Write-Host "[*] Device detected! Installing $targetVersion (with downgrade support)..." -ForegroundColor Cyan
$installResult = adb install -r -d "$apkPath"
Write-Host "$installResult"

if ($installResult -match "Success") {
    Write-Host "[SUCCESS] Zero-Noise $targetVersion installed successfully on your phone!" -ForegroundColor Green
    adb shell am start -n org.zero.detox/.MainActivity
} else {
    Write-Host "[!] Install response: $installResult" -ForegroundColor Yellow
}
