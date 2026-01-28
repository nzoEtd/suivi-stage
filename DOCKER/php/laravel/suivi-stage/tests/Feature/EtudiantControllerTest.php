<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\RechercheStage;
use App\Models\Etudiant;
use App\Models\FicheDescriptive;
use App\Models\Parcours; 
use App\Models\AnneeUniversitaire;  
use Illuminate\Support\Facades\DB;
use Mockery;

class EtudiantControllerTest extends TestCase
{
    /**
     * Recréer les tables avec ces seeders
     * 
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate:fresh');
        $this->artisan('db:seed');
    }
    /*
    ================================
        TEST DE LA METHODE INDEX
    ================================
    */
    public function test_index_renvoie_une_confirmation_et_la_liste_de_tous_les_etudiants()
    {
        $etudiants = Etudiant::all();

        $response = $this->get('/api/etudiants');

        $response->assertStatus(200)
                 ->assertJson($etudiants->toArray());
    }

    /*
    ================================
        TEST DE LA METHODE SHOW
    ================================
    */
    public function test_show_renvoie_une_confirmation_et_les_informations_de_l_etudiant()
    {
        $unEtudiant = Etudiant::first();

        $response = $this->get('/api/etudiants/'.$unEtudiant->idUPPA);

        $response->assertStatus(200)
                 ->assertJson($unEtudiant->toArray());
    }

    public function test_show_renvoie_une_erreur_non_trouvee_en_cas_d_etudiant_non_trouvee()
    {
        $idEtudiant = PHP_INT_MAX;

        $response = $this->get('/api/etudiants/'.$idEtudiant);

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Aucun étudiant trouvé']);
    }

    public function test_show_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $this->mock(Etudiant::class, function ($mock) {
            $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));
        });

        $unEtudiant = Etudiant::first();

        $response = $this->get('/api/etudiants/'.$unEtudiant->idUPPA);

        $response->assertStatus(500)
                 ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE INDEXRECHERCHESTAGE
    ================================
    */
    public function test_indexRechercheStage_renvoie_une_confirmation_et_toutes_les_recherches_de_stage_de_l_etudiant()
    {
        $idEtudiant ='611082';
        $recherches = RechercheStage::where('idUPPA', $idEtudiant)->get();

        $response = $this->get("/api/etudiants/{$idEtudiant}/recherches-stages");

        $response->assertStatus(200)
                 ->assertJson($recherches->toArray());
    }

    public function test_indexRechercheStage_renvoie_une_erreur_404_si_l_etudiant_n_a_pas_de_recherche()
    {
        $idEtudiant = '610001';
        $response = $this->get("/api/etudiants/{$idEtudiant}/recherches-stages");
        $response->assertStatus(204);
    }

    public function test_indexRechercheStage_renvoie_une_erreur_404_si_l_etudiant_n_existe_pas()
    {
        $idEtudiant = PHP_INT_MAX;
        $response = $this->get("/api/etudiants/{$idEtudiant}/recherches-stages");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Aucun étudiant trouvé']);
    }

    public function test_indexRechercheStage_renvoie_une_erreur_500_en_cas_d_exception()
    {
        $this->mock(RechercheStage::class, function ($mock) {
            $mock->shouldReceive('where')->andThrow(new \Exception('Erreur simulée'));
        });

        $idEtudiant ='611082';
        $response = $this->get("/api/etudiants/{$idEtudiant}/recherches-stages");

        $response->assertStatus(500)
                 ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE INDEXFICHEDESCRIPTIVE
    ================================
    */
    public function test_indexFicheDescriptive_renvoie_200_et_la_liste_des_fiches_descriptives()
    {
        $etudiant = Etudiant::first();
        $fiches = FicheDescriptive::where('idUPPA', $etudiant->idUPPA)->get();

        $response = $this->get("/api/etudiants/{$etudiant->idUPPA}/fiches-descriptives");

        $response->assertStatus(200)
                 ->assertJson($fiches->toArray());
    }

    public function test_indexFicheDescriptive_renvoie_204_si_aucune_fiche()
    {
        $idEtudiant ='613453';
        $response = $this->get("/api/etudiants/{$idEtudiant}/fiches-descriptives");

        $response->assertStatus(204);
    }

    public function test_indexFicheDescriptive_renvoie_500_en_cas_d_exception()
    {
        $this->mock(FicheDescriptive::class, function ($mock) {
            $mock->shouldReceive('where')->andThrow(new \Exception('Erreur simulée'));
        });

        $etudiant = Etudiant::first();
        $response = $this->get("/api/etudiants/{$etudiant->idUPPA}/fiches-descriptives");

        $response->assertStatus(500)
                 ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    public function test_indexFicheDescriptive_renvoie_404_si_etudiant_n_existe_pas()
    {
        $idEtudiant = PHP_INT_MAX;
        $response = $this->get("/api/etudiants/{$idEtudiant}/fiches-descriptives");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Aucun étudiant trouvé']);
    }

    /*
    ================================
        TEST DE INDEXPARCOURS
    ================================
    */
    public function test_indexParcours_renvoie_200_et_la_liste_des_parcours()
    {
        $etudiant = Etudiant::first();
        $response = $this->get("/api/etudiants/{$etudiant->idUPPA}/parcours");

        $parcours = Parcours::first();
        $annee = AnneeUniversitaire::first();

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'idUPPA' => $etudiant->idUPPA,
                     'codeParcours' => $parcours->codeParcours,
                     'idAnneeUniversitaire' => $annee->idAnneeUniversitaire,
                 ]);
    }

    public function test_indexParcours_renvoie_404_si_etudiant_n_existe_pas()
    {
        $idEtudiant = '6402561';
        $response = $this->get("/api/etudiants/{$idEtudiant}/parcours");

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Aucun étudiant trouvé']);
    }

    public function test_indexParcours_renvoie_500_en_cas_d_exception()
    {
        $this->mock(Parcours::class, function ($mock) {
            $mock->shouldReceive('where')->andThrow(new \Exception('Erreur simulée'));
        });

        $etudiant = Etudiant::first();
        $response = $this->get("/api/etudiants/{$etudiant->idUPPA}/parcours");

        $response->assertStatus(500)
                 ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
