Add-Type -AssemblyName System.Drawing

$favSrc = "C:\Users\uriaz\.gemini\antigravity\brain\b873cf0a-524d-4d26-b8d8-5bd6f9937bbd\.user_uploaded\media_1795709513177_35bd867e.jpg"
$logoSrc = "C:\Users\uriaz\.gemini\antigravity\brain\b873cf0a-524d-4d26-b8d8-5bd6f9937bbd\.user_uploaded\media_1795709555434_480c2934.jpg"

$publicDir = "C:\Users\uriaz\Downloads\pehalwan karahi\public"
$appDir = "C:\Users\uriaz\Downloads\pehalwan karahi\src\app"

function Resize-Bitmap([System.Drawing.Bitmap]$src, [int]$w, [int]$h) {
    $dst = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dst)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
    return $dst
}

function Save-Ico([System.Drawing.Bitmap]$src, [string]$outPath) {
    $sizes = @(32, 64)
    $pngStreams = @()
    foreach ($sz in $sizes) {
        $bmp = Resize-Bitmap $src $sz $sz
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngStreams += ,($ms.ToArray())
        $ms.Dispose()
        $bmp.Dispose()
    }

    $fs = [System.IO.File]::Open($outPath, [System.IO.FileMode]::Create)
    $bw = New-Object System.IO.BinaryWriter($fs)
    # ICONDIR header
    $bw.Write([uint16]0) # reserved
    $bw.Write([uint16]1) # type = ICO
    $bw.Write([uint16]$sizes.Count)

    $offset = 6 + (16 * $sizes.Count)
    for ($i = 0; $i -lt $sizes.Count; $i++) {
        $sz = $sizes[$i]
        $data = $pngStreams[$i]
        $bw.Write([byte]$(if ($sz -ge 256) { 0 } else { $sz }))
        $bw.Write([byte]$(if ($sz -ge 256) { 0 } else { $sz }))
        $bw.Write([byte]0) # color count
        $bw.Write([byte]0) # reserved
        $bw.Write([uint16]1) # planes
        $bw.Write([uint16]32) # bpp
        $bw.Write([uint32]$data.Length)
        $bw.Write([uint32]$offset)
        $offset += $data.Length
    }
    foreach ($data in $pngStreams) {
        $bw.Write($data)
    }
    $bw.Flush()
    $bw.Dispose()
    $fs.Dispose()
}

# ==========================================
# 1. PROCESS FAVICON (Circular Crop + Alpha)
# ==========================================
$favOrig = [System.Drawing.Bitmap]::FromFile($favSrc)
$fw = $favOrig.Width
$fh = $favOrig.Height
$minX = $fw; $minY = $fh; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $fh; $y++) {
    for ($x = 0; $x -lt $fw; $x++) {
        $p = $favOrig.GetPixel($x, $y)
        if ($p.R -lt 230 -or $p.G -lt 230 -or $p.B -lt 230) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
$size = [Math]::Max($cropW, $cropH)
$cx = $minX + $cropW / 2.0
$cy = $minY + $cropH / 2.0
$radius = ($size / 2.0) - 1.0

$favClean = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$startX = [int]($cx - $size / 2.0)
$startY = [int]($cy - $size / 2.0)

for ($y = 0; $y -lt $size; $y++) {
    $sy = $startY + $y
    for ($x = 0; $x -lt $size; $x++) {
        $sx = $startX + $x
        if ($sx -lt 0 -or $sx -ge $fw -or $sy -lt 0 -or $sy -ge $fh) {
            $favClean.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            continue
        }
        $dx = ($x + 0.5) - ($size / 2.0)
        $dy = ($y + 0.5) - ($size / 2.0)
        $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
        if ($dist -gt $radius + 1.0) {
            $favClean.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } elseif ($dist -gt $radius - 1.0) {
            $alpha = [int]([Math]::Max(0, [Math]::Min(255, (($radius + 1.0 - $dist) / 2.0) * 255)))
            $p = $favOrig.GetPixel($sx, $sy)
            $favClean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
        } else {
            $p = $favOrig.GetPixel($sx, $sy)
            $favClean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
        }
    }
}
$favOrig.Dispose()

$fav256 = Resize-Bitmap $favClean 256 256
$fav256.Save((Join-Path $publicDir "favicon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$fav256.Dispose()

$fav180 = Resize-Bitmap $favClean 180 180
$fav180.Save((Join-Path $publicDir "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$fav180.Dispose()

Save-Ico $favClean (Join-Path $appDir "favicon.ico")
$favClean.Dispose()
Write-Host "Favicon assets generated successfully."

# ==========================================
# 2. PROCESS LOGO (Transparent BG + Tight Crop)
# ==========================================
$logoOrig = [System.Drawing.Bitmap]::FromFile($logoSrc)
$lw = $logoOrig.Width
$lh = $logoOrig.Height

# Find bounding box of non-background pixels
$lMinX = $lw; $lMinY = $lh; $lMaxX = 0; $lMaxY = 0
for ($y = 0; $y -lt $lh; $y++) {
    for ($x = 0; $x -lt $lw; $x++) {
        $p = $logoOrig.GetPixel($x, $y)
        if ($p.R -lt 230 -or $p.G -lt 230 -or $p.B -lt 230) {
            if ($x -lt $lMinX) { $lMinX = $x }
            if ($x -gt $lMaxX) { $lMaxX = $x }
            if ($y -lt $lMinY) { $lMinY = $y }
            if ($y -gt $lMaxY) { $lMaxY = $y }
        }
    }
}

$pad = 8
$lMinX = [Math]::Max(0, $lMinX - $pad)
$lMinY = [Math]::Max(0, $lMinY - $pad)
$lMaxX = [Math]::Min($lw - 1, $lMaxX + $pad)
$lMaxY = [Math]::Min($lh - 1, $lMaxY + $pad)
$outW = $lMaxX - $lMinX + 1
$outH = $lMaxY - $lMinY + 1

# Flood-fill from outer borders so outer background (even around the pill) is 100% transparent,
# while enclosed white text inside "Since 1973" pill stays crisp opaque white!
$visited = New-Object 'bool[,]' $outW, $outH
$isBg = New-Object 'bool[,]' $outW, $outH
$queue = New-Object 'System.Collections.Generic.Queue[int]'

$logoClean = New-Object System.Drawing.Bitmap($outW, $outH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$pixels = New-Object 'System.Drawing.Color[,]' $outW, $outH
for ($y = 0; $y -lt $outH; $y++) {
    $sy = $lMinY + $y
    for ($x = 0; $x -lt $outW; $x++) {
        $pixels[$x, $y] = $logoOrig.GetPixel($lMinX + $x, $sy)
    }
}
$logoOrig.Dispose()

function Is-NearWhite([System.Drawing.Color]$p) {
    $minC = [Math]::Min($p.R, [Math]::Min($p.G, $p.B))
    $maxC = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
    $sat = $maxC - $minC
    $lum = ($p.R + $p.G + $p.B) / 3.0
    return ($lum -gt 225 -and $sat -lt 20)
}

for ($x = 0; $x -lt $outW; $x++) {
    if (Is-NearWhite $pixels[$x, 0]) { $visited[$x, 0] = $true; $queue.Enqueue($x) }
    if (Is-NearWhite $pixels[$x, ($outH - 1)]) { $visited[$x, ($outH - 1)] = $true; $queue.Enqueue(($outH - 1) * $outW + $x) }
}
for ($y = 0; $y -lt $outH; $y++) {
    if (-not $visited[0, $y] -and (Is-NearWhite $pixels[0, $y])) { $visited[0, $y] = $true; $queue.Enqueue($y * $outW) }
    if (-not $visited[($outW - 1), $y] -and (Is-NearWhite $pixels[($outW - 1), $y])) { $visited[($outW - 1), $y] = $true; $queue.Enqueue($y * $outW + ($outW - 1)) }
}

while ($queue.Count -gt 0) {
    $idx = $queue.Dequeue()
    $cx = $idx % $outW
    $cy = [int]($idx / $outW)
    $isBg[$cx, $cy] = $true

    if ($cx -gt 0 -and -not $visited[($cx - 1), $cy] -and (Is-NearWhite $pixels[($cx - 1), $cy])) {
        $visited[($cx - 1), $cy] = $true; $queue.Enqueue($cy * $outW + ($cx - 1))
    }
    if ($cx -lt ($outW - 1) -and -not $visited[($cx + 1), $cy] -and (Is-NearWhite $pixels[($cx + 1), $cy])) {
        $visited[($cx + 1), $cy] = $true; $queue.Enqueue($cy * $outW + ($cx + 1))
    }
    if ($cy -gt 0 -and -not $visited[$cx, ($cy - 1)] -and (Is-NearWhite $pixels[$cx, ($cy - 1)])) {
        $visited[$cx, ($cy - 1)] = $true; $queue.Enqueue(($cy - 1) * $outW + $cx)
    }
    if ($cy -lt ($outH - 1) -and -not $visited[$cx, ($cy + 1)] -and (Is-NearWhite $pixels[$cx, ($cy + 1)])) {
        $visited[$cx, ($cy + 1)] = $true; $queue.Enqueue(($cy + 1) * $outW + $cx)
    }
}

for ($y = 0; $y -lt $outH; $y++) {
    for ($x = 0; $x -lt $outW; $x++) {
        $p = $pixels[$x, $y]
        if ($isBg[$x, $y]) {
            $lum = ($p.R + $p.G + $p.B) / 3.0
            if ($lum -gt 236) {
                $logoClean.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            } else {
                $alpha = [int]([Math]::Max(0, [Math]::Min(255, ((236.0 - $lum) / 14.0) * 255)))
                $logoClean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $p.R, $p.G, $p.B))
            }
        } else {
            $logoClean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
        }
    }
}

$logoClean.Save((Join-Path $publicDir "logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$logoClean.Dispose()
Write-Host "Logo asset generated successfully: ${outW}x${outH}"
