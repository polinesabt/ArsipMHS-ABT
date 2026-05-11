@echo off
REM Jadwalkan script ini lewat Task Scheduler (misalnya setiap hari jam 02:00)
REM Tugas: hapus permanen log aktivitas yang sudah >20 hari
set PHP=E:\XAMPP\php\php.exe
set DIR=%~dp0
cd /d %DIR%..\..
"%PHP%" "%DIR%purge-logbook-old.php"
