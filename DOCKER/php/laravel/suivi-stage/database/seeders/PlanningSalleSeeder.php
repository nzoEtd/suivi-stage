<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanningSalleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('table_planning_salle')->insert([
            [
                'idPlanning' => 1,
                'nomSalle' => 126
            ],
            [
                'idPlanning' => 1,
                'nomSalle' => 124
            ],
            [
                'idPlanning' => 1,
                'nomSalle' => 125
            ],
            [
                'idPlanning' => 1,
                'nomSalle' => 110
            ],
            [
                'idPlanning' => 2,
                'nomSalle' => 110
            ],
            [
                'idPlanning' => 2,
                'nomSalle' => 131
            ],
            [
                'idPlanning' => 2,
                'nomSalle' => 124
            ],
            [
                'idPlanning' => 2,
                'nomSalle' => 125
            ],
            [
                'idPlanning' => 2,
                'nomSalle' => 126
            ],
            [
                'idPlanning' => 2,
                'nomSalle' => 127
            ],
            [
                'idPlanning' => 2,
                'nomSalle' => 129
            ]
        ]);
    }
}