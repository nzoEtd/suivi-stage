<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TuteurEntrepriseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('tuteur_entreprises')->insert([
            [
                'nom' => 'NAVAUD',
                'prenom' => 'Pierre-Louis',
                'telephone' => '0559010203',
                'adresseMail' => 'pnavaud@gmail.com',
                'fonction' => 'Chef de projet - développeur',
                'idEntreprise' => 1,
            ]
        ]);
    }
}
