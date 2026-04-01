<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSoutenancesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('soutenances', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            // Clé primaire
            $table->increments('idSoutenance');

            // Attributs
            $table->date('date');
            $table->time('heureDebut');
            $table->time('heureFin');

            // Clés étrangères
            $table->unsignedInteger('nomSalle');
            $table->foreign('nomSalle')->references('nomSalle')->on('salles')->onDelete('cascade');

            $table->unsignedInteger('idPlanning');
            $table->foreign('idPlanning')->references('idPlanning')->on('plannings')->onDelete('cascade');

            $table->string('idUPPA');
            $table->foreign('idUPPA')->references('idUPPA')->on('etudiants')->onDelete('cascade');

            $table->unsignedInteger('idLecteur');
            $table->foreign('idLecteur')->references('idPersonnel')->on('personnels')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('soutenances');
    }
}
