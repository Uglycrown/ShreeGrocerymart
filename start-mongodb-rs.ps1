# Run MongoDB as a replica set without modifying service config
# This starts a standalone mongod instance as replica set

$mongoPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
$dataPath = "C:\Program Files\MongoDB\Server\8.0\data"
$logPath = "C:\Program Files\MongoDB\Server\8.0\log\mongod-rs.log"

# Kill existing MongoDB process if any
Get-Process mongod -ErrorAction SilentlyContinue | Stop-Process -Force

# Start MongoDB with replica set
Start-Process -FilePath $mongoPath -ArgumentList "--replSet rs0 --dbpath `"$dataPath`" --logpath `"$logPath`" --port 27017 --bind_ip 127.0.0.1" -WindowStyle Hidden

Write-Host "MongoDB started with replica set rs0"
Write-Host "Waiting 5 seconds for MongoDB to start..."
Start-Sleep -Seconds 5

# Initialize replica set
$initScript = @"
try {
  var status = rs.status();
  print('Replica set already initialized');
} catch(e) {
  rs.initiate();
  print('Replica set initialized successfully');
}
"@

# Try to find mongo shell
$mongoShells = @(
    "C:\Program Files\MongoDB\Server\8.0\bin\mongosh.exe",
    "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe",
    "C:\Program Files\MongoDB\Tools\100\bin\mongosh.exe",
    "mongosh"
)

$shellFound = $false
foreach ($shell in $mongoShells) {
    if (Test-Path $shell -ErrorAction SilentlyContinue) {
        Write-Host "Initializing replica set with $shell..."
        $initScript | & $shell --quiet
        $shellFound = $true
        break
    }
}

if (-not $shellFound) {
    Write-Host "MongoDB shell not found. You need to manually run: rs.initiate()"
    Write-Host "Install MongoDB Shell from: https://www.mongodb.com/try/download/shell"
}

Write-Host "`nMongoDB is running as replica set on port 27017"
