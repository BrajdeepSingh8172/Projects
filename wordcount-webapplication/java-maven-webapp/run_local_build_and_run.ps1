<#
Run local build and run for the Java Maven Webapp.

This script will try the following (in order):
- If Docker is available, use a Maven Docker image to build the WAR, then build the Tomcat Docker image and run it.
- Else, if Maven is available locally, run `mvn package`, then build and run the Docker image (requires Docker).
- Else, if TOMCAT_HOME is set and `catalina.bat` is present, copy the WAR to `$env:TOMCAT_HOME\webapps` and start Tomcat.

Run from PowerShell:
  .\run_local_build_and_run.ps1

Note: This script does not change system configuration. It expects Docker or Maven or a local Tomcat installation.
#>

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

function Has-Command($name){
  try { Get-Command $name -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

Write-Host "Working directory: $root"

if (Has-Command 'docker'){
  Write-Host "Docker detected. Building WAR with Maven Docker image and then building/running Tomcat image..."
  $pwdPath = $PWD.Path
  docker run --rm -v "${pwdPath}":/workspace -w /workspace maven:3.8.8-openjdk-11 mvn -B -DskipTests clean package
  if ($LASTEXITCODE -ne 0){ Write-Error 'Maven build failed inside Docker.'; Pop-Location; exit 1 }

  docker build -t java-maven-webapp:local .
  if ($LASTEXITCODE -ne 0){ Write-Error 'Docker build failed.'; Pop-Location; exit 1 }

  # stop any existing container
  docker rm -f java-webapp 2>$null | Out-Null
  docker run -d --name java-webapp -p 8080:8080 java-maven-webapp:local
  Write-Host "Container started as 'java-webapp' mapping host:8080 -> container:8080"
  Write-Host "Open http://localhost:8080 in your browser."

} elseif (Has-Command 'mvn'){
  Write-Host "Maven detected locally. Building WAR..."
  mvn -B -DskipTests clean package
  if ($LASTEXITCODE -ne 0){ Write-Error 'Maven build failed.'; Pop-Location; exit 1 }

  if (-not (Has-Command 'docker')){
    Write-Warning "Docker not found locally. You can deploy the generated WAR 'target\*.war' to a Tomcat server manually."
    Write-Host "WAR files in: " (Get-ChildItem -Path target -Filter *.war | Select-Object -ExpandProperty FullName)
    Pop-Location; exit 0
  }

  # Build and run Docker image if Docker present
  docker build -t java-maven-webapp:local .
  docker rm -f java-webapp 2>$null | Out-Null
  docker run -d --name java-webapp -p 8080:8080 java-maven-webapp:local
  Write-Host "Container started as 'java-webapp' mapping host:8080 -> container:8080"
  Write-Host "Open http://localhost:8080 in your browser."

} elseif ($env:TOMCAT_HOME){
  $war = Get-ChildItem -Path target -Filter *.war -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $war){ Write-Error 'No WAR found in target/. Please build the project with Maven first.'; Pop-Location; exit 1 }
  $dest = Join-Path $env:TOMCAT_HOME 'webapps\ROOT.war'
  Copy-Item $war.FullName -Destination $dest -Force
  Write-Host "WAR copied to Tomcat webapps: $dest"
  Write-Host "Start Tomcat using $env:TOMCAT_HOME\bin\catalina.bat run"
} else {
  Write-Error "Neither Docker nor Maven nor TOMCAT_HOME was found. Please install Docker or Maven, or set TOMCAT_HOME."
}

Pop-Location
