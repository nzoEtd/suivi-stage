<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateTablePlanningSalle extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
public function up()
{
    Schema::create('table_planning_salle', function (Blueprint $table) {
        $table->engine = 'InnoDB';
        
        $table->primary(['idPlanning', 'nomSalle'], 'planning_salle_primary');

        $table->unsignedInteger('idPlanning');
        $table->unsignedInteger('nomSalle');

        $table->foreign('idPlanning')->references('idPlanning')->on('plannings');
        $table->foreign('nomSalle')->references('nomSalle')->on('salles');
    });


    
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('table_planning_salle');
    }
}
