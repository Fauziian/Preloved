<?php
header('Content-Type: text/plain');

$src = __DIR__ . '/../database/database.sqlite';
$dst = '/tmp/database.sqlite';

echo "Database Source: " . $src . "\n";
echo "Source Exists: " . (file_exists($src) ? 'YES' : 'NO') . "\n";
if (file_exists($src)) {
    echo "Source Size: " . filesize($src) . " bytes\n";
    echo "Source Mtime: " . filemtime($src) . "\n";
}

echo "\nDatabase Destination: " . $dst . "\n";
echo "Destination Exists: " . (file_exists($dst) ? 'YES' : 'NO') . "\n";
if (file_exists($dst)) {
    echo "Destination Size: " . filesize($dst) . " bytes\n";
    echo "Destination Mtime: " . filemtime($dst) . "\n";
}

// Try connecting to source SQLite
if (file_exists($src)) {
    try {
        $pdo = new PDO("sqlite:" . $src);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
        echo "\nTables in Source:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $table = $row['name'];
            $countStmt = $pdo->query("SELECT COUNT(*) FROM \"$table\"");
            $count = $countStmt->fetchColumn();
            echo " - $table ($count rows)\n";
        }
    } catch (Exception $e) {
        echo "\nError reading source: " . $e->getMessage() . "\n";
    }
}

// Try connecting to destination SQLite
if (file_exists($dst)) {
    try {
        $pdo2 = new PDO("sqlite:" . $dst);
        $pdo2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $stmt2 = $pdo2->query("SELECT name FROM sqlite_master WHERE type='table'");
        echo "\nTables in Destination:\n";
        while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            $table = $row['name'];
            $countStmt = $pdo2->query("SELECT COUNT(*) FROM \"$table\"");
            $count = $countStmt->fetchColumn();
            echo " - $table ($count rows)\n";
        }
    } catch (Exception $e) {
        echo "\nError reading destination: " . $e->getMessage() . "\n";
    }
}
