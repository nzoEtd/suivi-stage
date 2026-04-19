<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartementIUTSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('departement_i_u_t_s')->insert([
            [
                'libelle' => 'Informatique'
            ]
        ]);
    }
}
