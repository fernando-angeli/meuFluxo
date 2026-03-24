param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(
        "help",
        "dev-up", "dev-down", "dev-logs", "dev-ps", "dev-restart",
        "prod-up", "prod-down", "prod-logs", "prod-ps",
        "obs-up", "obs-down", "obs-logs",
        "all-up", "all-down"
    )]
    [string]$Command
)

function Invoke-Compose {
    param(
        [Parameter(Mandatory = $true)][string[]]$Args
    )

    & docker compose @Args
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

function Show-Help {
    Write-Host "Comandos disponiveis:"
    Write-Host "  .\scripts\docker.ps1 dev-up"
    Write-Host "  .\scripts\docker.ps1 dev-down"
    Write-Host "  .\scripts\docker.ps1 dev-logs"
    Write-Host "  .\scripts\docker.ps1 dev-ps"
    Write-Host "  .\scripts\docker.ps1 dev-restart"
    Write-Host "  .\scripts\docker.ps1 prod-up"
    Write-Host "  .\scripts\docker.ps1 prod-down"
    Write-Host "  .\scripts\docker.ps1 prod-logs"
    Write-Host "  .\scripts\docker.ps1 prod-ps"
    Write-Host "  .\scripts\docker.ps1 obs-up"
    Write-Host "  .\scripts\docker.ps1 obs-down"
    Write-Host "  .\scripts\docker.ps1 obs-logs"
    Write-Host "  .\scripts\docker.ps1 all-up"
    Write-Host "  .\scripts\docker.ps1 all-down"
}

$base = @("-f", "docker-compose.yml")
$dev = @("-f", "docker-compose.dev.yml", "--profile", "dev")
$prod = @("-f", "docker-compose.prod.yml", "--profile", "prod")
$obs = @("--profile", "obs")
$prodObs = @("-f", "docker-compose.prod.yml", "--profile", "prod", "--profile", "obs")

switch ($Command) {
    "help" { Show-Help }

    "dev-up" { Invoke-Compose -Args ($base + $dev + @("up", "-d")) }
    "dev-down" { Invoke-Compose -Args ($base + $dev + @("down")) }
    "dev-logs" { Invoke-Compose -Args ($base + $dev + @("logs", "-f", "api_dev")) }
    "dev-ps" { Invoke-Compose -Args ($base + $dev + @("ps")) }
    "dev-restart" { Invoke-Compose -Args ($base + $dev + @("restart", "api_dev")) }

    "prod-up" { Invoke-Compose -Args ($base + $prod + @("up", "-d", "--build")) }
    "prod-down" { Invoke-Compose -Args ($base + $prod + @("down")) }
    "prod-logs" { Invoke-Compose -Args ($base + $prod + @("logs", "-f", "api")) }
    "prod-ps" { Invoke-Compose -Args ($base + $prod + @("ps")) }

    "obs-up" { Invoke-Compose -Args ($obs + @("up", "-d")) }
    "obs-down" { Invoke-Compose -Args ($obs + @("down")) }
    "obs-logs" { Invoke-Compose -Args ($obs + @("logs", "-f")) }

    "all-up" { Invoke-Compose -Args ($base + $prodObs + @("up", "-d", "--build")) }
    "all-down" { Invoke-Compose -Args ($base + $prodObs + @("down")) }
}
