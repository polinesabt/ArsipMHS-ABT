<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
$file=__DIR__ . '/migrations/2026-09-10-tendik-self-service.sql';
$sql=file_get_contents($file);
if($sql===false||trim($sql)===''){fwrite(STDERR,"Migration file tidak dapat dibaca.\n");exit(1);}
try{$pdo->exec($sql);echo "OK: migrasi portal tendik berhasil dijalankan.\n";}
catch(Throwable $error){fwrite(STDERR,"ERROR: {$error->getMessage()}\n");exit(1);}
