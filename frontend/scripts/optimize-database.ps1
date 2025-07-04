# frontend/scripts/optimize-database.ps1
# PowerShell script to run database optimization for Supabase
# This script runs the Node.js optimization script with proper error handling

param(
    [string]$ScriptType = "simple"
)

Write-Host "🚀 Starting Supabase Database Optimization" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if required packages are installed
Write-Host "📦 Checking required packages..." -ForegroundColor Yellow
$packageJsonPath = Join-Path $PSScriptRoot "..\package.json"
if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $requiredPackages = @("pg", "dotenv")

    foreach ($package in $requiredPackages) {
        if ($packageJson.dependencies.$package -or $packageJson.devDependencies.$package) {
            Write-Host "✅ $package is installed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $package might not be installed" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  package.json not found, skipping package check" -ForegroundColor Yellow
}

# Check if .env.local exists
$envPath = Join-Path $PSScriptRoot "..\.env.local"
if (Test-Path $envPath) {
    Write-Host "✅ .env.local found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase configuration:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=your_supabase_connection_string" -ForegroundColor Cyan
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" -ForegroundColor Cyan
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" -ForegroundColor Cyan
    exit 1
}

# Determine which script to run
$scriptPath = ""
switch ($ScriptType.ToLower()) {
    "simple" {
        $scriptPath = Join-Path $PSScriptRoot "optimize-database-simple.js"
        Write-Host "🔧 Using simple optimization script (direct PostgreSQL connection)" -ForegroundColor Blue
    }
    "supabase" {
        $scriptPath = Join-Path $PSScriptRoot "optimize-database-supabase.js"
        Write-Host "🔧 Using Supabase client optimization script" -ForegroundColor Blue
    }
    "original" {
        $scriptPath = Join-Path $PSScriptRoot "optimize-database.js"
        Write-Host "🔧 Using original optimization script" -ForegroundColor Blue
    }
    default {
        Write-Host "❌ Invalid script type: $ScriptType" -ForegroundColor Red
        Write-Host "Available options: simple, supabase, original" -ForegroundColor Yellow
        exit 1
    }
}

# Check if script exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Script not found: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "📜 Running script: $scriptPath" -ForegroundColor Blue
Write-Host ""

# Run the optimization script
try {
    $startTime = Get-Date
    node $scriptPath

    $endTime = Get-Date
    $duration = $endTime - $startTime

    Write-Host ""
    Write-Host "✅ Database optimization completed successfully!" -ForegroundColor Green
    Write-Host "⏱️  Total duration: $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "❌ Database optimization failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red

    # Provide troubleshooting tips
    Write-Host ""
    Write-Host "🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Check your DATABASE_URL in .env.local" -ForegroundColor White
    Write-Host "2. Ensure your Supabase project is active" -ForegroundColor White
    Write-Host "3. Verify you have the required permissions" -ForegroundColor White
    Write-Host "4. Try running with 'simple' script type: .\optimize-database.ps1 -ScriptType simple" -ForegroundColor White

    exit 1
}

Write-Host ""
Write-Host "🎉 Optimization complete! Your database should now be faster." -ForegroundColor Green
Write-Host "💡 Monitor your app's performance to see the improvements." -ForegroundColor Cyan