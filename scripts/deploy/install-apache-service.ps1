$ErrorActionPreference = 'Stop'

$apacheExecutable = 'C:\Apache24\bin\httpd.exe'
$serviceName = 'DndCharacterApache'
$firewallRuleName = 'D&D Character Apache HTTP'

& $apacheExecutable -t
if ($LASTEXITCODE -ne 0) {
  throw "Apache configuration test failed with exit code $LASTEXITCODE"
}

if (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
  & $apacheExecutable -k install -n $serviceName
  if ($LASTEXITCODE -ne 0) {
    throw "Apache service installation failed with exit code $LASTEXITCODE"
  }
}

Set-Service -Name $serviceName -StartupType Automatic

if (-not (Get-NetFirewallRule -DisplayName $firewallRuleName -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule `
    -DisplayName $firewallRuleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort 80 `
    -Profile Private | Out-Null
}

Start-Service -Name $serviceName
