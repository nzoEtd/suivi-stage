<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('salles')->insert([
            [
                'nomSalle' => 110,
                'estDisponible' => false
            ],
            [
                'nomSalle' => 124,
                'estDisponible' => true
            ],
            [
                'nomSalle' => 125,
                'estDisponible' => true
            ],
            [
                'nomSalle' => 126,
                'estDisponible' => true
            ],            [
                'nomSalle' => 127,
                'estDisponible' => true
            ],            [
                'nomSalle' => 129,
                'estDisponible' => true
            ],
            [
                'nomSalle' => 131,
                'estDisponible' => true
            ],

        ]);
    }
}
