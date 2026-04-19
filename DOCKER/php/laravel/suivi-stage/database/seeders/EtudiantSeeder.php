<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EtudiantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('etudiants')->insert([
            [
                'idUPPA' => '610000',
                'login' => 'mmontouro',
                'nom' => 'MONTOURO',
                'prenom' => 'Maxime',
                'adresseMail' => 'mmontour@iutbayonne.univ-pau.fr',
                'idDepartement' => 1,  // Informatique
                'idEntreprise' => 1,
                'idTuteur' => 1
            ],
            [
                'idUPPA' => '610123',
                'login' => 'lcrussiere',
                'nom' => 'CRUSSIERE',
                'prenom' => 'Lucas',
                'adresseMail' => 'lcrussiere@iutbayonne.univ-pau.fr',
                'idDepartement' => 1,
                'idEntreprise' => 1,
                'idTuteur' => 1
            ]
        ]);
    }
}
