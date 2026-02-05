<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EtudiantTdAnneeunivSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $etudiants = DB::table('etudiants')->pluck('idUPPA');

        $insertData = [];

        foreach ($etudiants as $idUPPA) {
            $insertData[] = [
                'idUPPA' => $idUPPA,
                'idAnneeUniversitaire' => 3,
                'idTD' => rand(1, 3), 
            ];
        }

        DB::table('table_etudiant_td_anneeuniv')->insert($insertData);
    }
    
}
