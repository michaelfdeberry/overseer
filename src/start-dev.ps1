#!/usr/bin/env pwsh
# Start Overseer Server and Client in development mode with plugin support

param(
    [switch]$SkipPlugins,
    [switch]$SkipClient
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Overseer Development Environment..." -ForegroundColor Green

# Define paths
$srcPath = $PSScriptRoot
$serverPath = Join-Path $srcPath "Overseer.Server"
$clientPath = Join-Path $srcPath "Overseer.Client"
$pluginsRootPath = Join-Path (Split-Path (Split-Path $srcPath -Parent) -Parent) "plugins"
$registryPath = Join-Path (Split-Path (Split-Path $srcPath -Parent) -Parent) "overseer.plugin-registry" "plugins.json"

# Detect PowerShell executable
$psExe = if (Get-Command pwsh -ErrorAction SilentlyContinue) {
    "pwsh"
}
elseif (Get-Command powershell -ErrorAction SilentlyContinue) {
    "powershell"
}
else {
    $PSHOME + "\powershell.exe"
}

# Function to start a process in a new window
function Start-DevProcess {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command,
        [string[]]$Arguments
    )
    
    $argList = @(
        "-NoExit",
        "-Command",
        "Set-Location '$WorkingDirectory'; Write-Host 'Starting $Title...' -ForegroundColor Cyan; $Command $($Arguments -join ' ')"
    )
    
    return Start-Process $psExe -ArgumentList $argList -WindowStyle Normal -PassThru
}

# Step 1: Build the server
Write-Host ""
Write-Host "=== Building Overseer Server ===" -ForegroundColor Cyan
Push-Location $serverPath
try {
    dotnet build --configuration Debug
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Server build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Server build succeeded." -ForegroundColor Green
}
finally {
    Pop-Location
}

# Determine the server bin output directory (find the net* TFM folder)
$serverBinBase = Join-Path $serverPath "bin" "Debug"
$serverBinPath = Get-ChildItem $serverBinBase -Directory |
Where-Object { $_.Name -match '^net\d' } |
Sort-Object Name -Descending |
Select-Object -First 1 -ExpandProperty FullName

if (-not $serverBinPath) {
    Write-Host "Could not find server bin output directory under $serverBinBase!" -ForegroundColor Red
    exit 1
}
Write-Host "Server output: $serverBinPath" -ForegroundColor DarkGray

# Step 2: Build and publish plugins
if (-not $SkipPlugins) {
    $pluginsOutputPath = Join-Path $serverBinPath "Plugins"

    Write-Host ""
    Write-Host "=== Building and Publishing Plugins ===" -ForegroundColor Cyan
    Write-Host "Plugins source: $pluginsRootPath" -ForegroundColor DarkGray
    Write-Host "Plugins output: $pluginsOutputPath" -ForegroundColor DarkGray

    if (-not (Test-Path $pluginsRootPath)) {
        Write-Host "Plugins directory not found at $pluginsRootPath. Skipping plugin build." -ForegroundColor Yellow
    }
    else {
        # Load plugin registry for metadata generation
        $registryItems = @()
        if (Test-Path $registryPath) {
            $registryItems = Get-Content $registryPath -Raw | ConvertFrom-Json
        }

        # Clean existing plugins output
        if (Test-Path $pluginsOutputPath) {
            Remove-Item $pluginsOutputPath -Recurse -Force
        }
        New-Item -ItemType Directory -Path $pluginsOutputPath -Force | Out-Null

        $pluginDirs = Get-ChildItem $pluginsRootPath -Directory
        foreach ($pluginDir in $pluginDirs) {
            $pluginName = $pluginDir.Name
            $pluginSrcPath = Join-Path $pluginDir.FullName "src"

            if (-not (Test-Path $pluginSrcPath)) {
                Write-Host "  Skipping $pluginName - no src directory found." -ForegroundColor Yellow
                continue
            }

            # Find the solution file (.sln or .slnx)
            $slnFiles = Get-ChildItem $pluginSrcPath -File | Where-Object { $_.Extension -in '.sln', '.slnx' }
            if ($slnFiles.Count -eq 0) {
                Write-Host "  Skipping $pluginName - no solution file found in src." -ForegroundColor Yellow
                continue
            }

            # Find plugin projects (exclude test projects)
            $pluginProjects = Get-ChildItem $pluginSrcPath -Filter "*.csproj" -Recurse |
            Where-Object { $_.Name -notmatch 'Tests?' -and $_.Directory.Name -notmatch 'Tests?' }

            if ($pluginProjects.Count -eq 0) {
                Write-Host "  Skipping $pluginName - no plugin project found." -ForegroundColor Yellow
                continue
            }

            foreach ($proj in $pluginProjects) {
                $pluginOutputDir = Join-Path $pluginsOutputPath $pluginName

                Write-Host "  Building plugin: $pluginName ($($proj.Name))..." -ForegroundColor Yellow

                dotnet publish $proj.FullName `
                    --configuration Debug `
                    --output $pluginOutputDir `
                    --no-self-contained

                if ($LASTEXITCODE -ne 0) {
                    Write-Host "  Plugin build failed: $pluginName" -ForegroundColor Red
                    continue
                }

                # Generate plugin.json metadata if not already present
                $metadataOutputPath = Join-Path $pluginOutputDir "plugin.json"
                if (-not (Test-Path $metadataOutputPath)) {
                    # Check for existing plugin.json in the plugin repo
                    $existingMetadata = @(
                        (Join-Path $pluginDir.FullName "plugin.json"),
                        (Join-Path $pluginSrcPath "plugin.json"),
                        (Join-Path $proj.DirectoryName "plugin.json")
                    ) | Where-Object { Test-Path $_ } | Select-Object -First 1

                    if ($existingMetadata) {
                        Copy-Item $existingMetadata -Destination $metadataOutputPath -Force
                    }
                    else {
                        # Try to match from the plugin registry
                        $registryMatch = $registryItems | Where-Object {
                            $_.githubRepository -match [regex]::Escape($pluginName)
                        } | Select-Object -First 1

                        # Read csproj for fallback metadata
                        [xml]$csprojXml = Get-Content $proj.FullName
                        $propGroup = $csprojXml.Project.PropertyGroup
                        $version = ($propGroup.Version | Select-Object -First 1) ?? "0.0.0"
                        $description = ($propGroup.Description | Select-Object -First 1) ?? $pluginName
                        $authors = ($propGroup.Authors | Select-Object -First 1) ?? "Unknown"

                        $metadata = @{
                            name             = if ($registryMatch) { $registryMatch.name } else { $pluginName }
                            author           = if ($registryMatch) { $registryMatch.author } else { $authors }
                            description      = if ($registryMatch) { $registryMatch.description } else { $description }
                            githubRepository = if ($registryMatch) { $registryMatch.githubRepository } else { "" }
                            license          = if ($registryMatch) { $registryMatch.license } else { "" }
                            version          = $version
                        }

                        $metadata | ConvertTo-Json | Set-Content -Path $metadataOutputPath -Encoding UTF8
                    }

                    Write-Host "  Generated plugin.json for $pluginName" -ForegroundColor DarkGray
                }

                Write-Host "  Published $pluginName" -ForegroundColor Green
            }
        }

        # Summary
        Write-Host ""
        Write-Host "Plugins published:" -ForegroundColor Cyan
        $publishedPlugins = Get-ChildItem $pluginsOutputPath -Directory -ErrorAction SilentlyContinue
        if ($publishedPlugins) {
            foreach ($p in $publishedPlugins) {
                $dlls = Get-ChildItem $p.FullName -Filter "Overseer.*.dll" |
                Where-Object { $_.Name -ne "Overseer.Server.Integration.dll" }
                $hasMetadata = Test-Path (Join-Path $p.FullName "plugin.json")
                $status = if ($dlls -and $hasMetadata) { "[OK]" } elseif ($dlls) { "[Missing metadata]" } else { "[Missing DLL]" }
                $color = if ($status -eq "[OK]") { "Green" } else { "Yellow" }
                Write-Host "  $($p.Name) $status" -ForegroundColor $color
            }
        }
        else {
            Write-Host "  No plugins published." -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host ""
    Write-Host "Skipping plugin build (-SkipPlugins)" -ForegroundColor Yellow
}

# Step 3: Start applications
Write-Host ""
Write-Host "=== Starting Applications ===" -ForegroundColor Cyan

$serverProcess = $null
$clientProcess = $null

function Start-Server {
    Write-Host "Starting Server..." -ForegroundColor Yellow
    $script:serverProcess = Start-DevProcess -Title "Overseer Server" `
        -WorkingDirectory $serverPath `
        -Command "dotnet" `
        -Arguments @("watch", "--Environment=Development")
}

function Start-Client {
    if (-not $SkipClient) {
        Write-Host "Starting Client..." -ForegroundColor Yellow
        $script:clientProcess = Start-DevProcess -Title "Overseer Client" `
            -WorkingDirectory $clientPath `
            -Command "npm" `
            -Arguments @("start")
    }
}

function Stop-DevProcess {
    param([System.Diagnostics.Process]$Process, [string]$Name)
    if ($Process -and -not $Process.HasExited) {
        Write-Host "Stopping $Name..." -ForegroundColor Yellow
        # Use taskkill /T to kill the entire process tree (shell + child dotnet/node processes)
        taskkill /T /F /PID $Process.Id 2>$null | Out-Null
        $Process.WaitForExit(5000) | Out-Null
    }
}

Start-Server
Start-Sleep -Seconds 2
Start-Client

Write-Host ""
Write-Host "Development environment started." -ForegroundColor Green
Write-Host "  Server: dotnet watch (port 9000)" -ForegroundColor Cyan
if (-not $SkipClient) {
    Write-Host "  Client: npm start (port 4200)" -ForegroundColor Cyan
}
Write-Host "  Plugins: $serverBinPath\Plugins" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commands: [rb] restart backend  [rf] restart frontend  [ra] restart all  [sb] stop backend  [sf] stop frontend  [q] quit  [?] help" -ForegroundColor DarkCyan
Write-Host ""

:mainLoop while ($true) {
    $cmd = Read-Host "overseer"
    switch ($cmd.Trim().ToLower()) {
        { $_ -in 'rb', 'restart backend', 'restart server', 'backend', 'server' } {
            Stop-DevProcess -Process $serverProcess -Name "Server"
            Start-Server
            Write-Host "Server restarted." -ForegroundColor Green
        }
        { $_ -in 'rf', 'restart frontend', 'restart client', 'frontend', 'client' } {
            if ($SkipClient) {
                Write-Host "Client was skipped on startup (-SkipClient)." -ForegroundColor Yellow
            }
            else {
                Stop-DevProcess -Process $clientProcess -Name "Client"
                Start-Client
                Write-Host "Client restarted." -ForegroundColor Green
            }
        }
        { $_ -in 'sb', 'stop backend', 'stop server' } {
            Stop-DevProcess -Process $serverProcess -Name "Server"
            $script:serverProcess = $null
            Write-Host "Server stopped." -ForegroundColor Green
        }
        { $_ -in 'sf', 'stop frontend', 'stop client' } {
            if ($SkipClient) {
                Write-Host "Client was skipped on startup (-SkipClient)." -ForegroundColor Yellow
            }
            else {
                Stop-DevProcess -Process $clientProcess -Name "Client"
                $script:clientProcess = $null
                Write-Host "Client stopped." -ForegroundColor Green
            }
        }
        { $_ -in 'ra', 'restart all', 'restart' } {
            Stop-DevProcess -Process $serverProcess -Name "Server"
            Stop-DevProcess -Process $clientProcess -Name "Client"
            Start-Server
            Start-Sleep -Seconds 2
            Start-Client
            Write-Host "All processes restarted." -ForegroundColor Green
        }
        { $_ -in 'q', 'quit', 'exit' } {
            Write-Host "Stopping all processes..." -ForegroundColor Yellow
            Stop-DevProcess -Process $serverProcess -Name "Server"
            Stop-DevProcess -Process $clientProcess -Name "Client"
            Write-Host "Goodbye!" -ForegroundColor Green
            break mainLoop
        }
        { $_ -in '?', 'help', 'h' } {
            Write-Host ""
            Write-Host "Available commands:" -ForegroundColor Cyan
            Write-Host "  rb, restart backend   - Restart the .NET server" -ForegroundColor White
            Write-Host "  rf, restart frontend  - Restart the Angular client" -ForegroundColor White
            Write-Host "  ra, restart all       - Restart both server and client" -ForegroundColor White
            Write-Host "  sb, stop backend      - Stop the .NET server" -ForegroundColor White
            Write-Host "  sf, stop frontend     - Stop the Angular client" -ForegroundColor White
            Write-Host "  q, quit, exit         - Stop all processes and exit" -ForegroundColor White
            Write-Host "  ?, help               - Show this help" -ForegroundColor White
            Write-Host ""
        }
        '' { }
        default {
            Write-Host "Unknown command '$cmd'. Type '?' for help." -ForegroundColor Yellow
        }
    }
}
