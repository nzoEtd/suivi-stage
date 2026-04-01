<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once 'DatabaseConnection.php';
require_once 'AlgorithmeRepartition.php';

use App\AlgorithmeAttribution\DatabaseConnection;
use App\AlgorithmeAttribution\AlgorithmeRepartition;

// Vérifier si les deux IDs sont fournis en argument
if ($argc < 3) {
    exit(1);
}

$idUPPA = $argv[1];
$idFicheDescriptive = $argv[2];

try {
    $db = DatabaseConnection::connect();
    $algorithme = new AlgorithmeRepartition($db);
    $resultat = $algorithme->executeForStudent($idUPPA, $idFicheDescriptive);
} catch (Exception $e) {
    echo "ERREUR : " . $e->getMessage() . "\n";
}
