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
                'estDisponible' => true
            ],
        ]);
    }
}
