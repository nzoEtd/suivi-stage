<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanningSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('plannings')->insert([
            [
                'nom' => 'Planning S4',
                'dateDebut' => '2026-06-10',
                'dateFin' => '2026-06-20',
                'heureDebutMatin' => '08:00:00',
                'heureFinMatin' => '12:00:00',
                'heureDebutAprem' => '13:00:00',
                'heureFinAprem' => '17:00:00',
                'dureeSoutenance' => 60,
                'idAnneeFormation' => 2,
                'idAnneeUniversitaire' => 3
            ],
            [
                'nom' => 'Planning S6',
                'dateDebut' => '2026-02-10',
                'dateFin' => '2026-02-20',
                'heureDebutMatin' => '09:00:00',
                'heureFinMatin' => '12:30:00',
                'heureDebutAprem' => '14:00:00',
                'heureFinAprem' => '18:00:00',
                'dureeSoutenance' => 60,
                'idAnneeFormation' => 3,
                'idAnneeUniversitaire' => 3
            ]
        ]);
    }
}
