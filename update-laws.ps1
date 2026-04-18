# legalize-kr 법령 자동 업데이트 스크립트
# Windows 작업 스케줄러에 등록하여 매일 13:00 KST 실행

$ErrorActionPreference = "Stop"

$PIPELINE_DIR = "D:\Legalize KR\legalize-pipeline"
$LOG_DIR      = "D:\Legalize KR\logs"
$LOG_FILE     = "$LOG_DIR\update-$(Get-Date -Format 'yyyy-MM-dd').log"

# 로그 디렉토리 생성
if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR | Out-Null }

function Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
    Write-Host $line
    Add-Content -Path $LOG_FILE -Value $line -Encoding UTF8
}

Log "===== 법령 업데이트 시작 ====="

# 1. 법령 업데이트 (최근 7일)
Log "[1/3] laws.update 실행 중..."
Set-Location $PIPELINE_DIR
& python -m laws.update 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) {
    Log "ERROR: laws.update 실패 (exit code $LASTEXITCODE)"
    exit 1
}

# 2. 검증
Log "[2/3] laws.validate 실행 중..."
& python -m laws.validate 2>&1 | ForEach-Object { Log $_ }
if ($LASTEXITCODE -ne 0) {
    Log "ERROR: laws.validate 실패 (exit code $LASTEXITCODE)"
    exit 1
}

# 3. legalize-kr 저장소 push
Log "[3/3] git push 실행 중..."
$LEGALIZE_KR_DIR = "D:\Legalize KR\legalize-kr"
Set-Location $LEGALIZE_KR_DIR

$newCommits = & git log origin/main..HEAD --oneline 2>&1
if ($newCommits) {
    Log "새 커밋 발견:`n$newCommits"
    & git push 2>&1 | ForEach-Object { Log $_ }
    if ($LASTEXITCODE -ne 0) {
        Log "ERROR: git push 실패"
        exit 1
    }
    Log "Push 완료"
} else {
    Log "새 커밋 없음 - push 스킵"
}

Log "===== 법령 업데이트 완료 ====="
