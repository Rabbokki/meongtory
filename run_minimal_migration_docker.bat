@echo off
echo Minimal Order/Product Migration Script (Docker)
echo ===============================================
echo.

REM Docker 컨테이너 이름 설정
set CONTAINER_NAME=meongtory-db-1

echo Docker 컨테이너 정보:
echo Container: %CONTAINER_NAME%
echo Database: meong
echo User: jjj
echo.

echo 최소 마이그레이션을 실행하시겠습니까? (y/n)
set /p confirm=

if /i "%confirm%"=="y" (
    echo.
    echo 마이그레이션을 시작합니다...
    echo.
    
    REM Docker 컨테이너 내부에서 PostgreSQL에 연결하여 마이그레이션 실행
    docker exec -i %CONTAINER_NAME% psql -U jjj -d meong < order_product_migration_minimal.sql
    
    if %errorlevel% equ 0 (
        echo.
        echo 마이그레이션이 성공적으로 완료되었습니다!
    ) else (
        echo.
        echo 마이그레이션 실행 중 오류가 발생했습니다.
        echo 오류 코드: %errorlevel%
        echo.
        echo 컨테이너가 실행 중인지 확인해주세요:
        echo docker ps
    )
) else (
    echo 마이그레이션이 취소되었습니다.
)

echo.
pause
