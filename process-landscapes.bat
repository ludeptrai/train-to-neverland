@echo off
chcp 65001 > nul
echo ========================================================
echo   TRAIN TO THE NEVERLAND - XỬ LÝ ẢNH PHONG CẢNH (JPG -> PNG)
echo ========================================================
echo.
if "%~1"=="" (
    echo Đang tự động quét và xử lý TẤT CẢ các thư mục ga trong public/assets/landscapes/...
    node scripts/process_landscape_theme.js
) else (
    echo Đang xử lý thư mục ga: %~1
    node scripts/process_landscape_theme.js %~1
)
echo.
echo ========================================================
echo   HOÀN TẤT! ĐÃ ĐĂNG KÝ VÀO HỆ THỐNG WEB APP.
echo ========================================================
pause
