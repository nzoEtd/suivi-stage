<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SoutenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('soutenances')->insert([
            ['date' => '2026-06-10', 'heureDebut' => '08:00:00', 'heureFin' => '09:00:00', 'nomSalle' => 124, 'idPlanning' => 1, 'idUPPA' => '583303', 'idLecteur' => 1],
            ['date' => '2026-06-11', 'heureDebut' => '09:05:00', 'heureFin' => '10:15:00', 'nomSalle' => 124, 'idPlanning' => 1, 'idUPPA' => '610000', 'idLecteur' => 1],
        ]);
    }
}
