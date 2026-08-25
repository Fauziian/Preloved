<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// ── Vercel read-only filesystem workaround ──────────────────────────────────────
// Must run BEFORE Application::configure() so storage/database paths are set early.
if (PHP_OS_FAMILY !== 'Windows') {

    // 1. Copy SQLite DB to writable /tmp on first request
    $dbSrc = __DIR__ . '/../database/database.sqlite';
    $dbDst = '/tmp/database.sqlite';
    if (file_exists($dbSrc) && !file_exists($dbDst)) {
        copy($dbSrc, $dbDst);
    }
    // Point Laravel at the writable copy
    $_ENV['DB_DATABASE'] = $dbDst;
    putenv("DB_DATABASE={$dbDst}");

    // 2. Create writable storage directories in /tmp
    $storagePath = '/tmp/storage';
    foreach ([
        $storagePath,
        $storagePath . '/logs',
        $storagePath . '/framework',
        $storagePath . '/framework/views',
        $storagePath . '/framework/cache',
        $storagePath . '/framework/cache/data',
        $storagePath . '/framework/sessions',
        $storagePath . '/app',
        $storagePath . '/app/public',
        '/tmp/storage/bootstrap',
        '/tmp/storage/bootstrap/cache',
    ] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    // 3. Use cookie session & file cache to avoid DB-based session/cache issues
    $_ENV['SESSION_DRIVER'] = 'cookie';
    $_ENV['CACHE_STORE']    = 'file';
    putenv('SESSION_DRIVER=cookie');
    putenv('CACHE_STORE=file');
}

try {
    $app = Application::configure(basePath: dirname(__DIR__))
        ->withRouting(
            web:      __DIR__ . '/../routes/web.php',
            api:      __DIR__ . '/../routes/api.php',
            commands: __DIR__ . '/../routes/console.php',
            health:   '/up',
        )
        ->withMiddleware(function (Middleware $middleware): void {
            // Trust all proxies for Vercel / reverse proxies
            $middleware->trustProxies(at: '*');

            // CSRF is not needed for our JSON API routes
            $middleware->validateCsrfTokens(except: [
                'api/*',
            ]);
            // Register admin auth middleware alias
            $middleware->alias([
                'auth.admin' => \App\Http\Middleware\AdminAuth::class,
            ]);
        })
        ->withExceptions(function (Exceptions $exceptions): void {
            //
        })->create();
} catch (\Throwable $e) {
    header('Content-Type: text/plain');
    echo "BOOT ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(0);
}

// Override storage path for Vercel AFTER app is configured
if (PHP_OS_FAMILY !== 'Windows') {
    $app->useStoragePath('/tmp/storage');
    $app->useBootstrapPath('/tmp/storage/bootstrap');
}

return $app;
