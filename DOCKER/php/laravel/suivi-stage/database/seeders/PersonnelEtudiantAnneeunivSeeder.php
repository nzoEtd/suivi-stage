<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PersonnelEtudiantAnneeunivSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    
    public function run()
    {
        DB::table('table_personnel_etudiant_anneeuniv')->truncate();

        $etudiants = DB::table('etudiants')->pluck('idUPPA');

        $insertData = [];

        foreach ($etudiants as $idUPPA) {
            $insertData[] = [
                'idPersonnel' => rand(1, 7),
                'idUPPA' => $idUPPA,
                'idAnneeUniversitaire' => 3,
            ];
        }

        DB::table('table_personnel_etudiant_anneeuniv')->insert($insertData);
    }
}
