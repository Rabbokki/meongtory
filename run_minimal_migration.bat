@echo off
echo Minimal Order/Product Migration Script
echo ======================================
echo.

REM 데이터베이스 연결 정보 설정
set DB_HOST=localhost
set DB_PORT=5433
set DB_NAME=meong
set DB_USER=jjj

echo 데이터베이스 연결 정보:
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

echo 최소 마이그레이션을 실행하시겠습니까? (y/n)
set /p confirm=

if /i "%confirm%"=="y" (
    echo.
    echo 마이그레이션을 시작합니다...
    echo.
    
    REM PostgreSQL에 연결하여 마이그레이션 실행
    psql -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -U %DB_USER% -f order_product_migration_minimal.sql
    
    if %errorlevel% equ 0 (
        echo.
        echo 마이그레이션이 성공적으로 완료되었습니다!
    ) else (
        echo.
        echo 마이그레이션 실행 중 오류가 발생했습니다.
        echo 오류 코드: %errorlevel%
    )
) else (
    echo 마이그레이션이 취소되었습니다.
)

echo.
pause
