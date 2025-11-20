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
            [
                'date' => '2025-01-11',
                'heureDebut' => '08:30:00',
                'heureFin' => '09:30:00',
                'nomSalle' => 126, 
                'idPlanning' => 1,
                'idUPPA' => '611107',
                'idPersonnel' => 1,
            ],
            [
                'date' => '2025-01-11',
                'heureDebut' => '09:35:00',
                'heureFin' => '10:35:00',
                'nomSalle' => 126,
                'idPlanning' => 1,
                'idUPPA' => '610580',
                'idPersonnel' => 1,
            ],
            [
                'date' => '2025-01-11',
                'heureDebut' => '08:30:00',
                'heureFin' => '09:30:00',
                'nomSalle' => 124, 
                'idPlanning' => 1,
                'idUPPA' => '641387',
                'idPersonnel' => 2,
            ],
            
        ]);
    }
}



