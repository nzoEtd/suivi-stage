<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EntrepriseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('entreprises')->insert([
            [
                'numSIRET' => '33530702100030',
                'raisonSociale' => "ZERO ET L'INFINI",
            ]
        ]);
    }
}
