@echo off
REM Export full database untuk production (schema + data).
REM Sesuaikan path PHP jika XAMPP tidak di E:\XAMPP
set PHP_EXE=E:\XAMPP\php\php.exe
if not exist "%PHP_EXE%" set PHP_EXE=php
"%PHP_EXE%" "%~dp0export_full_for_production.php" %*
if errorlevel 1 pause
