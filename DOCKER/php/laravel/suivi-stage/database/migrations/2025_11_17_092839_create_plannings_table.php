<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlanningsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plannings', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            // Clé primaire
            $table->increments('idPlanning');

            // Attributs
            $table->string('nom');
            $table->date('dateDebut');
            $table->date('dateFin');
            $table->time('heureDebutMatin');
            $table->time('heureFinMatin');
            $table->time('heureDebutAprem');
            $table->time('heureFinAprem');
            $table->integer('dureeSoutenance'); // en minutes

            // Clés étrangères
            $table->unsignedTinyInteger('idAnneeFormation');
            $table->foreign('idAnneeFormation')->references('idAnneeFormation')->on('annee_formations');

            $table->unsignedInteger('idAnneeUniversitaire');
            $table->foreign('idAnneeUniversitaire')->references('idAnneeUniversitaire')->on('annee_universitaires');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('plannings');
    }
}
