param(
    [string]$SdkRoot = $env:ANDROID_SDK_ROOT,
    [string]$JdkHome = $env:JAVA_HOME,
    [string]$VersionName = "2.6.0",
    [int]$VersionCode = 32
)

$ErrorActionPreference = "Stop"
$Project = $PSScriptRoot
$Repo = Split-Path -Parent $Project
$Build = Join-Path $Project "build"
$Gen = Join-Path $Build "gen"
$Classes = Join-Path $Build "classes"
$Dex = Join-Path $Build "dex"
$AndroidJar = Join-Path $SdkRoot "platforms\android-35\android.jar"
$BuildTools = Join-Path $SdkRoot "build-tools\35.0.0"
$Aapt2 = Join-Path $BuildTools "aapt2.exe"
$D8 = Join-Path $BuildTools "d8.bat"
$ZipAlign = Join-Path $BuildTools "zipalign.exe"
$ApkSigner = Join-Path $BuildTools "apksigner.bat"
$KeystoreDir = Join-Path $Project "keystore"
$Keystore = Join-Path $KeystoreDir "lianji-release.jks"
$KeystorePass = $env:LIANJI_KEYSTORE_PASS
if (-not $KeystorePass) { throw "Set LIANJI_KEYSTORE_PASS before building." }
$KeyAlias = "lianji"
$Dist = Join-Path $Repo "dist"
$ApkName = "TrainingLog-$VersionName.apk"
$ReleaseApk = Join-Path $Dist $ApkName

if (!(Test-Path $AndroidJar)) { throw "Android SDK platform not found: $AndroidJar" }
if (!(Test-Path (Join-Path $JdkHome "bin\javac.exe"))) { throw "JDK not found: $JdkHome" }

$env:JAVA_HOME = $JdkHome
$env:PATH = "$(Join-Path $JdkHome 'bin');$env:PATH"

if (Test-Path $Build) { Remove-Item -Recurse -Force $Build }
New-Item -ItemType Directory -Force -Path $Build, $Gen, $Classes, $Dex, $Dist, $KeystoreDir | Out-Null

# Keep the packaged web app in sync with the source app.
$WebSource = $Repo
$AssetWww = Join-Path $Project "assets\www"
if (Test-Path (Join-Path $WebSource "index.html")) {
    if (Test-Path $AssetWww) { Remove-Item -Recurse -Force $AssetWww }
    New-Item -ItemType Directory -Force -Path $AssetWww | Out-Null
    foreach ($name in @("index.html", "styles.css", "app.js", "manifest.webmanifest")) {
        Copy-Item -LiteralPath (Join-Path $WebSource $name) -Destination (Join-Path $AssetWww $name)
    }
    Copy-Item -LiteralPath (Join-Path $WebSource "icons") -Destination (Join-Path $AssetWww "icons") -Recurse
}

Write-Host "1/5 Compiling resources..."
$CompiledResources = Join-Path $Build "resources.zip"
& $Aapt2 compile --dir (Join-Path $Project "res") -o $CompiledResources
if ($LASTEXITCODE -ne 0) { throw "aapt2 compile failed" }

$BaseApk = Join-Path $Build "base.apk"
& $Aapt2 link `
    -o $BaseApk `
    -I $AndroidJar `
    --manifest (Join-Path $Project "AndroidManifest.xml") `
    --java $Gen `
    --min-sdk-version 26 `
    --target-sdk-version 34 `
    --version-code $VersionCode `
    --version-name $VersionName `
    -R $CompiledResources `
    --auto-add-overlay
if ($LASTEXITCODE -ne 0) { throw "aapt2 link failed" }

Write-Host "2/5 Compiling Java..."
$JavaSources = @(
    (Join-Path $Project "src\com\lianji\app\MainActivity.java"),
    (Join-Path $Gen "com\lianji\app\R.java")
)
& (Join-Path $JdkHome "bin\javac.exe") `
    -encoding UTF-8 `
    -source 8 `
    -target 8 `
    -Xlint:-options `
    -classpath $AndroidJar `
    -d $Classes `
    $JavaSources
if ($LASTEXITCODE -ne 0) { throw "javac failed" }

Write-Host "3/5 Dexing..."
$ClassFiles = Get-ChildItem -Path $Classes -Recurse -Filter "*.class" | ForEach-Object { $_.FullName }
& $D8 --lib $AndroidJar --min-api 26 --output $Dex $ClassFiles
if ($LASTEXITCODE -ne 0) { throw "d8 failed" }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$AssetsRoot = Join-Path $Project "assets"
$Zip = [System.IO.Compression.ZipFile]::Open($BaseApk, [System.IO.Compression.ZipArchiveMode]::Update)
try {
    Get-ChildItem -Path $AssetsRoot -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($AssetsRoot.Length).TrimStart('\', '/') -replace '\\', '/'
        $entryName = "assets/$relative"
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $Zip,
            $_.FullName,
            $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $Zip,
        (Join-Path $Dex "classes.dex"),
        "classes.dex",
        [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
} finally {
    $Zip.Dispose()
}

Write-Host "4/5 Aligning..."
$AlignedApk = Join-Path $Build "aligned.apk"
& $ZipAlign -f 4 $BaseApk $AlignedApk
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

Write-Host "5/5 Signing..."
if (!(Test-Path $Keystore)) {
    & (Join-Path $JdkHome "bin\keytool.exe") -genkeypair `
        -keystore $Keystore `
        -storetype JKS `
        -storepass $KeystorePass `
        -keypass $KeystorePass `
        -alias $KeyAlias `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -dname "CN=Lianji, OU=Mobile, O=Lianji, L=Shanghai, ST=Shanghai, C=CN"
    if ($LASTEXITCODE -ne 0) { throw "keytool failed" }
}

& $ApkSigner sign `
    --ks $Keystore `
    --ks-key-alias $KeyAlias `
    --ks-pass "pass:$KeystorePass" `
    --key-pass "pass:$KeystorePass" `
    --min-sdk-version 26 `
    --out $ReleaseApk `
    $AlignedApk
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

& $ApkSigner verify --verbose $ReleaseApk
if ($LASTEXITCODE -ne 0) { throw "apksigner verify failed" }

Write-Host ""
Write-Host "APK ready: $ReleaseApk"
Get-Item $ReleaseApk | Select-Object FullName, Length, LastWriteTime
