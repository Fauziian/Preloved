<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

// Customize storage and SQLite database path on Vercel (read-only filesystem workaround)
if (isset($_SERVER['VERCEL']) || env('VERCEL') || isset($_ENV['VERCEL'])) {
    $storagePath = '/tmp/storage';
    $app->useStoragePath($storagePath);
    
    // Dynamically create required framework directories in /tmp
    $dirs = [
        $storagePath,
        $storagePath . '/logs',
        $storagePath . '/framework',
        $storagePath . '/framework/views',
        $storagePath . '/framework/cache',
        $storagePath . '/framework/sessions',
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    // SQLite path workaround for read-only filesystem
    $dbSrc = database_path('database.sqlite');
    $dbDst = '/tmp/database.sqlite';
    if (file_exists($dbSrc) && !file_exists($dbDst)) {
        copy($dbSrc, $dbDst);
    }
    
    // Override the DB_DATABASE environment variable and config path
    $_ENV['DB_DATABASE'] = $dbDst;
    putenv("DB_DATABASE={$dbDst}");
    config(['database.connections.sqlite.database' => $dbDst]);
}

return $app;
