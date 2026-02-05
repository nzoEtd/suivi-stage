<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\AnneeUniversitaire;
use Mockery;

class AnneeUniversitaireControllerTest extends TestCase
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
        Mockery::resetContainer();
    }


    /*
    ================================
        TEST DE LA METHODE INDEX
    ================================
    */
    public function test_index_renvoie_une_confirmation_et_la_liste_des_annees_universitaires()
    {
        $anneesUniversitaires = AnneeUniversitaire::all();

        $response = $this->get('/api/annee-universitaire');

        $response->assertStatus(200)
            ->assertJson($anneesUniversitaires->toArray());
    }

    /*
    ================================
        TEST DE LA METHODE STORE
    ================================
    */
    public function test_store_renvoie_une_confirmation_et_l_annee_universitaire_creee()
    {
        $donnees = ['libelle' => '2025-2026'];

        $response = $this->post('/api/annee-universitaire/create', $donnees);

        $response->assertStatus(201)
            ->assertJson($donnees);
    }

    public function test_store_renvoie_une_erreur_de_validation()
    {
        $donnees = ['libelle' => null];

        $response = $this->post('/api/annee-universitaire/create', $donnees);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Erreur de validation des données']);
    }

    public function test_store_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        // Mock du modèle pour forcer une exception lors de create()

        Mockery::mock('overload:App\Models\AnneeUniversitaire')
            ->shouldReceive('create')
            ->andThrow(new \Exception('Erreur simulée'));

        $donnees = ['libelle' => '2025-2026'];

        $response = $this->post('/api/annee-universitaire/create', $donnees);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE SHOW
    ================================
    */
    public function test_show_renvoie_une_confirmation_et_les_informations_de_l_annee_universitaire()
    {
        $anneeUniversitaire = AnneeUniversitaire::first();

        $response = $this->get('/api/annee-universitaire/' . $anneeUniversitaire->idAnneeUniversitaire);

        $response->assertStatus(200)
            ->assertJson($anneeUniversitaire->toArray());
    }

    public function test_show_renvoie_une_erreur_non_trouvee_en_cas_d_annee_universitaire_non_trouvee()
    {
        $id = PHP_INT_MAX;

        $response = $this->get('/api/annee-universitaire/' . $id);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucune année universitaire trouvée']);
    }



    public function test_show_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        Mockery::mock('overload:App\Models\AnneeUniversitaire')
            ->shouldReceive('findOrFail')
            ->andThrow(new \Exception('Erreur simulée'));

        $response = $this->get('/api/annee-universitaire/1');

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE UPDATE
    ================================
    */
    public function test_update_renvoie_une_confirmation_et_l_annee_universitaire_modifiee()
    {
        $donnees = ['libelle' => '2000-2001'];
        $uneAnnee = AnneeUniversitaire::first();

        $response = $this->putJson('/api/annee-universitaire/update/' . $uneAnnee->idAnneeUniversitaire, $donnees);

        $response->assertStatus(200)
            ->assertJson($donnees);
    }

    public function test_update_renvoie_une_erreur_de_validation_en_cas_de_donnees_invalides()
    {
        $donnees = ['libelle' => null];
        $uneAnnee = AnneeUniversitaire::first();

        $response = $this->putJson('/api/annee-universitaire/update/' . $uneAnnee->idAnneeUniversitaire, $donnees);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Erreur de validation dans les données']);
    }

    public function test_update_renvoie_une_erreur_non_trouvee_en_cas_d_annee_universitaire_non_trouvee()
    {
        $id = PHP_INT_MAX;
        $donnees = ['libelle' => '2000-2001'];

        $response = $this->putJson('/api/annee-universitaire/update/' . $id, $donnees);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucune année universitaire trouvée']);
    }

    public function test_update_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        Mockery::mock('overload:App\Models\AnneeUniversitaire')
            ->shouldReceive('findOrFail')
            ->andThrow(new \Exception('Erreur simulée'));

        $donnees = ['libelle' => '2000-2001'];

        $response = $this->putJson('/api/annee-universitaire/update/1', $donnees);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }


    /*
    ================================
        TEST DE LA METHODE DESTROY
    ================================
    */
    public function test_destroy_renvoie_une_confirmation_de_la_suppression_de_l_annee_universitaire()
    {
        $uneAnnee = AnneeUniversitaire::orderBy('idAnneeUniversitaire', 'desc')->first();

        $response = $this->delete('/api/annee-universitaire/delete/' . $uneAnnee->idAnneeUniversitaire);

        $response->assertStatus(200)
            ->assertJson(['message' => 'L\'année universitaire a bien été supprimée']);
    }

    public function test_destroy_renvoie_une_erreur_non_trouvee_en_cas_d_annee_universitaire_non_trouvee()
    {
        $id = PHP_INT_MAX;

        $response = $this->delete('/api/annee-universitaire/delete/' . $id);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucune année universitaire trouvée']);
    }

    public function test_destroy_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        Mockery::mock('overload:App\Models\AnneeUniversitaire')
            ->shouldReceive('findOrFail')
            ->andThrow(new \Exception('Erreur simulée'));

        $response = $this->delete('/api/annee-universitaire/delete/1');

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
