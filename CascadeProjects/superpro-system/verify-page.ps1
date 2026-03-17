# SUPER_PRO SYSTEM - Local Page Verification Script
# Run this script to open index.html in your browser for manual verification
# Verifies: Page load, sidebar, dashboard, 404 errors

$projectRoot = $PSScriptRoot
$port = 3456

Write-Host "SUPER_PRO System - Page Verification" -ForegroundColor Cyan
Write-Host "Starting HTTP server on port $port..." -ForegroundColor Yellow

# Try Python first, fallback to npx serve
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCmd) {
    $job = Start-Job -ScriptBlock {
        param($root, $p)
        Set-Location $root
        python -m http.server $p
    } -ArgumentList $projectRoot, $port
} else {
    $job = Start-Job -ScriptBlock {
        param($root, $p)
        Set-Location $root
        npx -y serve -l $p
    } -ArgumentList $projectRoot, $port
}

Start-Sleep -Seconds 2

$url = "http://localhost:$port/index.html"
Write-Host "Opening $url in browser..." -ForegroundColor Green
Start-Process $url

Write-Host "`nVerification Checklist (use DevTools F12):" -ForegroundColor Cyan
Write-Host "  1. Console tab - Check for JavaScript errors (should be none)" 
Write-Host "  2. Network tab - Filter by failed/404 - No 404s for JS/CSS"
Write-Host "  3. Click sidebar menu items (الرئيسية, الموظفين, etc.) - Should switch views"
Write-Host "  4. Dashboard - Should show stats and data"
Write-Host "`nPress Enter to stop the server..."
Read-Host
Stop-Job $job; Remove-Job $job
