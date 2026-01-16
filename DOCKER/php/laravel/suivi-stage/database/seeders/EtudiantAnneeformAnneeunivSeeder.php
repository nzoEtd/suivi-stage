<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EtudiantAnneeformAnneeunivSeeder extends Seeder
{
    public function run()
    {
        DB::table('table_etudiant_anneeform_anneeuniv')->truncate();

        $etudiants = DB::table('etudiants')->pluck('idUPPA');

        $insertData = [];

        foreach ($etudiants as $idUPPA) {
            $insertData[] = [
                'idUPPA' => $idUPPA,
                'idAnneeFormation' => rand(2, 3), 
                'idAnneeUniversitaire' => 3,
            ];
        }

        DB::table('table_etudiant_anneeform_anneeuniv')->insert($insertData);
    }
}