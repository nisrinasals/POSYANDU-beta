$puskesmasDir = "src\pages\puskesmas"
$files = Get-ChildItem -Path $puskesmasDir -Filter "*.jsx" -Recurse
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    # Replace rgba dari #15803d (21,128,61) ke rgba dari #428A75 (66,138,117)
    $newContent = $content.Replace('rgba(21, 128, 61, 0.08)', 'rgba(66, 138, 117, 0.1)')
    $newContent = $newContent.Replace('rgba(21, 128, 61,', 'rgba(66, 138, 117,')
    # Also replace f0fdf4 (green light bg) and bbf7d0 (green border)
    $newContent = $newContent.Replace('#f0fdf4', '#EEF1EF')
    $newContent = $newContent.Replace('#bbf7d0', '#9ACFA6')
    [System.IO.File]::WriteAllText($file.FullName, $newContent)
    Write-Host "Updated: $($file.Name)"
}
Write-Host "Done"
