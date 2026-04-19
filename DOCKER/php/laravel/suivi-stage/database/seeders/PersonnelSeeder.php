<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PersonnelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('personnels')->insert([
            [
                'roles' => 'Enseignant',
                'login' => 'plopisteguy',
                'nom' => 'LOPISTEGUY',
                'prenom' => 'Philippe',
                'adresseMail' => 'philippe.lopisteguy@iutbayonne.univ-pau.fr',
                'quotaEtudiant' => 16,  // Nombre d'étudiant maximal dont il peut être le référent
            ],
            [
                'roles' => 'Enseignant',
                'login' => 'ycarpentier',
                'nom' => 'CARPENTIER',
                'prenom' => 'Yann',
                'adresseMail' => 'yann.carpentier@iutbayonne.univ-pau.fr',
                'quotaEtudiant' => 16,
            ]
        ]);
    }
}
