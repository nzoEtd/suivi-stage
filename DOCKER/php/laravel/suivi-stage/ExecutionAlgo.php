<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once 'DatabaseConnection.php';
require_once 'AlgorithmeRepartition.php';

use App\AlgorithmeAttribution\DatabaseConnection;
use App\AlgorithmeAttribution\AlgorithmeRepartition;

// Vérifier si les deux IDs sont fournis en argument
if ($argc < 3) {
    // echo "Usage: php index.php <idUPPA> <idFicheDescriptive>\n";
    // echo "Exemple: php index.php 610000 42\n";
    exit(1);
}

$idUPPA = $argv[1];
$idFicheDescriptive = $argv[2];

try {
    // echo "Démarrage de l'algorithme pour l'étudiant $idUPPA (Fiche descriptive: $idFicheDescriptive)...\n";

    $db = DatabaseConnection::connect();
    $algorithme = new AlgorithmeRepartition($db);
    $resultat = $algorithme->executeForStudent($idUPPA, $idFicheDescriptive);

    if ($resultat) {
        // echo "Attribution réussie !\n";
        // print_r($resultat);
    } else {
        // echo "Aucune attribution possible.\n";
    }
} catch (Exception $e) {
    echo "ERREUR : " . $e->getMessage() . "\n";
}
