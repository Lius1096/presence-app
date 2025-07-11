# run-tailwind.ps1

$tailwindPath = Join-Path -Path $PSScriptRoot -ChildPath "node_modules\.bin\tailwindcss"

if (Test-Path $tailwindPath) {
    & $tailwindPath -i ./public/src.css -o ./public/dist.css --watch
} else {
    Write-Error "tailwindcss executable not found in node_modules/.bin"
}
