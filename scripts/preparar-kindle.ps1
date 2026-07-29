param(
    [ValidateRange(1, 12)]
    [int]$Week = 1,

    [ValidateSet("epub", "azw3")]
    [string]$Format = "epub",

    [string]$KindlePath
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$courseNotes = Join-Path $projectRoot "projetos\CCNA_Course_Notes\Course_Notes"
$packageRoot = Join-Path $projectRoot "dist\kindle"
$weekFolder = Join-Path $packageRoot ("Semana-{0:D2}" -f $Week)
$certFolder = Join-Path $packageRoot "Certificacoes"

$weekNotes = @{
    1 = @("OSI_Model_TCPSuite.md", "IPv4_Addressing_Part1.md", "DNS.md", "DHCP.md", "Life_of_a_Packet.md")
    2 = @("IPv4_Addressing_Part2.md", "Subnetting_Part1.md", "Subnetting_Part2.md", "Subnetting_VLSM_Part3.md")
    3 = @("Ethernet_LAN_Switching_Part1.md", "Switch_Interfaces.md", "VLAN_Part1.md", "VLAN_Part2.md", "VLAN_Part3.md")
    4 = @("Routing_Fundamentals_Part1.md", "Static_Routing_Part2.md", "DynamicRouting.md")
    5 = @("OSPF_Part1.md", "OSPF_Part2.md", "OSPF_Part3.md")
    6 = @("Standard_Access_Control_Lists.md", "Extended_Access_Control_Lists.md", "NAT_Static_Part1.md", "NAT_Dynamic_Part2.md")
    7 = @("NTP.md", "SNMP.md", "SYSLOG.md", "SSH.md", "FTP_and_TFTP.md")
    8 = @("Security_Fundamentals.md", "Port_Security.md", "DHCP_Snooping.md", "Dynamic_Arp_Inspection.md")
    9 = @("Wireless_Fundamentals.md", "Wireless_Architecutres.md", "Wireless_Configuration.md", "Wireless_Security.md")
    10 = @("Virtualizations_and_Cloud_Part1.md", "Virtualization_Containers.md", "Virtualization_VRF_Part3.md")
    11 = @("Introduction_to_Network_Automation.md", "JSON_XML_YAML.md", "REST_APIs.md", "Ansible_Puppet_Chef.md")
    12 = @("Network_Devices.md", "TCP_and_UDP.md", "The_IPv4_Header.md", "WAN_Architectures.md")
}

function Resolve-CalibreTool {
    param([string]$Name)

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $defaultPath = Join-Path "C:\Program Files\Calibre2" $Name
    if (Test-Path -LiteralPath $defaultPath) {
        return $defaultPath
    }

    throw "Calibre nao encontrado. Instale o Calibre e tente novamente: https://calibre-ebook.com/download_windows"
}

$markdownTool = Resolve-CalibreTool "markdown-calibre.exe"
$convertTool = Resolve-CalibreTool "ebook-convert.exe"

New-Item -ItemType Directory -Force -Path $weekFolder | Out-Null
New-Item -ItemType Directory -Force -Path $certFolder | Out-Null

$workFolder = Join-Path ([System.IO.Path]::GetTempPath()) ("hub-kindle-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $workFolder | Out-Null

try {
    $chapters = New-Object System.Collections.Generic.List[string]
    foreach ($noteName in $weekNotes[$Week]) {
        $sourcePath = Join-Path $courseNotes $noteName
        if (-not (Test-Path -LiteralPath $sourcePath)) {
            Write-Warning "Nota nao encontrada: $sourcePath"
            continue
        }

        $chapterPath = Join-Path $workFolder ([System.IO.Path]::ChangeExtension($noteName, ".html"))
        & $markdownTool -f $chapterPath -e utf-8 $sourcePath
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao converter $noteName para HTML."
        }
        $chapterTitle = [System.IO.Path]::GetFileNameWithoutExtension($noteName).Replace("_", " ")
        $safeChapterTitle = [System.Net.WebUtility]::HtmlEncode($chapterTitle)
        $chapterContent = Get-Content -Raw -LiteralPath $chapterPath
        $chapters.Add("<section><h1>$safeChapterTitle</h1>$chapterContent</section>")
    }

    $bookPath = Join-Path $workFolder ("semana-{0:D2}.html" -f $Week)
    $bookTitle = "Hub InfraSec - Semana $Week"
    $chapterHtml = $chapters -join "<hr>"
    $bookHtml = @"
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>$bookTitle</title>
  <style>
    body { font-family: sans-serif; line-height: 1.55; }
    h1, h2, h3 { color: #174f57; }
    code, pre { font-family: monospace; }
    pre { white-space: pre-wrap; }
    img { max-width: 100%; }
    hr { border: 0; border-top: 1px solid #b8c6ca; margin: 2em 0; }
  </style>
</head>
<body>
  <h1>$bookTitle</h1>
  <p>Leituras selecionadas para acompanhar a jornada do Hub InfraSec.</p>
  $chapterHtml
</body>
</html>
"@
    Set-Content -LiteralPath $bookPath -Value $bookHtml -Encoding UTF8

    $outputBook = Join-Path $weekFolder ("hub-infrasec-semana-{0:D2}.{1}" -f $Week, $Format)
    & $convertTool $bookPath $outputBook --title $bookTitle --authors "Hub Jornada InfraSec" --level1-toc "//h:h1"
    if ($LASTEXITCODE -ne 0) {
        throw "O Calibre nao conseguiu gerar o livro da Semana $Week."
    }

    $certMaterials = @(
        @{ Source = "biblioteca\cisco-ccna-200-301-exam-topics-v1-0.pdf"; Name = "CCNA-200-301-Exam-Topics.pdf" },
        @{ Source = "biblioteca\cisco-press-ccna-200-301-official-cert-guide-vol1-sample.pdf"; Name = "CCNA-Official-Cert-Guide-Sample.pdf" },
        @{ Source = "biblioteca\certificacoes\aws-cloud-practitioner-clf-c02-exam-guide.pdf"; Name = "AWS-CLF-C02-Exam-Guide.pdf" },
        @{ Source = "biblioteca\certificacoes\sc-900-exam-ref-sample.pdf"; Name = "SC-900-Exam-Ref-Sample.pdf" }
    )

    foreach ($material in $certMaterials) {
        $sourcePath = Join-Path $projectRoot $material.Source
        if (Test-Path -LiteralPath $sourcePath) {
            Copy-Item -LiteralPath $sourcePath -Destination (Join-Path $certFolder $material.Name) -Force
        }
    }

    $guidePath = Join-Path $packageRoot "LEIA-ME.txt"
    $guide = @"
PACOTE DE LEITURA - HUB INFRASEC

Semana gerada: $Week
Formato das notas: $Format

- A pasta Semana-$("{0:D2}" -f $Week) contem as notas convertidas para leitura fluida.
- A pasta Certificacoes mantem os PDFs oficiais no formato original.
- Para EPUB, use o Send to Kindle.
- Para AZW3, use o botao "Enviar para dispositivo" do Calibre ou copie por USB.
"@
    Set-Content -LiteralPath $guidePath -Value $guide -Encoding UTF8

    if ($KindlePath) {
        $resolvedKindlePath = [System.IO.Path]::GetFullPath($KindlePath)
        if (-not (Test-Path -LiteralPath $resolvedKindlePath -PathType Container)) {
            throw "Pasta do Kindle nao encontrada: $resolvedKindlePath"
        }

        Get-ChildItem -LiteralPath $weekFolder -File | Copy-Item -Destination $resolvedKindlePath -Force
        Get-ChildItem -LiteralPath $certFolder -File | Copy-Item -Destination $resolvedKindlePath -Force
        Write-Host "Arquivos copiados para: $resolvedKindlePath"
    }

    Write-Host ""
    Write-Host "Pacote criado com sucesso:"
    Write-Host $packageRoot
    Write-Host ""
    Write-Host "Livro da semana:"
    Write-Host $outputBook
}
finally {
    if (Test-Path -LiteralPath $workFolder) {
        Remove-Item -LiteralPath $workFolder -Recurse -Force
    }
}
