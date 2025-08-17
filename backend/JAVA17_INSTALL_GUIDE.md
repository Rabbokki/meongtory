# Java 17 설치 가이드

## Windows에서 Java 17 설치하기

### 방법 1: Oracle JDK 17 설치 (권장)

1. **Oracle JDK 17 다운로드**
   - [Oracle JDK 17 다운로드 페이지](https://www.oracle.com/java/technologies/downloads/#java17) 방문
   - Windows x64 Installer 다운로드

2. **설치**
   - 다운로드한 파일 실행
   - 기본 설정으로 설치 진행
   - 설치 경로: `C:\Program Files\Java\jdk-17.x.x`

3. **환경 변수 설정**
   - 시스템 환경 변수 편집
   - JAVA_HOME 추가: `C:\Program Files\Java\jdk-17.x.x`
   - Path에 추가: `%JAVA_HOME%\bin`

### 방법 2: OpenJDK 17 설치

1. **Adoptium OpenJDK 17 다운로드**
   - [Adoptium OpenJDK 17](https://adoptium.net/temurin/releases/?version=17) 방문
   - Windows x64 MSI Installer 다운로드

2. **설치**
   - 다운로드한 파일 실행
   - 기본 설정으로 설치 진행

### 방법 3: Chocolatey 사용 (권장)

```powershell
# Chocolatey 설치 (관리자 권한으로 PowerShell 실행)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Java 17 설치
choco install openjdk17
```

### 방법 4: Scoop 사용

```powershell
# Scoop 설치
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Java 17 설치
scoop install openjdk17
```

## 설치 확인

설치 후 다음 명령어로 확인:

```powershell
java -version
```

예상 출력:
```
openjdk version "17.0.x" 2023-xx-xx
OpenJDK Runtime Environment (build 17.0.x+x)
OpenJDK 64-Bit Server VM (build 17.0.x+x, mixed mode, sharing)
```

## 환경 변수 설정 (수동)

1. **시스템 속성** → **고급** → **환경 변수**
2. **시스템 변수**에서 **새로 만들기**:
   - 변수 이름: `JAVA_HOME`
   - 변수 값: `C:\Program Files\Java\jdk-17.x.x`
3. **Path** 변수 편집 → **새로 만들기**:
   - `%JAVA_HOME%\bin`

## 문제 해결

### Java 버전이 변경되지 않는 경우
```powershell
# 현재 Java 경로 확인
where java

# 환경 변수 새로고침
refreshenv

# 또는 새 PowerShell 창 열기
```

### 여러 Java 버전이 설치된 경우
```powershell
# 특정 Java 버전 사용
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.x.x"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

## 설치 후 테스트

Java 17 설치 후 다음 명령어로 테스트:

```powershell
cd backend
./gradlew compileJava
```

성공하면 다음 단계로 진행:
```powershell
./gradlew bootRun
```
