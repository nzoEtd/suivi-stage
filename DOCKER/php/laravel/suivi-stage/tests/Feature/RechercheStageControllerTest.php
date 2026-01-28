<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\RechercheStage;
use Mockery;

class RechercheStageControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
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
    public function test_index_renvoie_une_confirmation_et_la_liste_des_recherches_de_stage()
    {
        $response = $this->get('/api/recherches-stages');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
                    'idRecherche',
                    'dateCreation',
                    'dateModification',
                    'date1erContact',
                    'typeContact',
                    'nomContact',
                    'prenomContact',
                    'fonctionContact',
                    'telephoneContact',
                    'adresseMailContact',
                    'observations',
                    'dateRelance',
                    'statut',
                    'idUPPA',
                    'idEntreprise',
                ]
            ]);
    }

    /*
    ================================
        TEST DE LA METHODE STORE
    ================================
    */
    public function test_store_renvoie_une_confirmation_de_la_creation_de_la_recherche()
    {
        $donnees = [
            'dateCreation' => now()->toDateString(),
            'dateModification' => now()->toDateString(),
            'date1erContact' => now()->toDateString(),
            'typeContact' => 'Mail',
            'nomContact' => 'Doe',
            'prenomContact' => 'John',
            'fonctionContact' => 'Manager',
            'telephoneContact' => '+33612345678',
            'adresseMailContact' => 'john.doe@example.com',
            'observations' => 'Aucune observation',
            'dateRelance' => now()->toDateString(),
            'statut' => 'En cours',
            'idUPPA' => '610000',
            'idEntreprise' => 1,
        ];

        $response = $this->postJson('/api/recherches-stages/create', $donnees);

        $response->assertStatus(201)
            ->assertJson($donnees);
    }

    public function test_store_renvoie_une_erreur_de_validation()
    {
        $donnees = [
            'dateCreation' => null,
            'dateModification' => now()->toDateString(),
            'date1erContact' => now()->toDateString(),
            'typeContact' => 'Mail',
            'nomContact' => 'Doe',
            'prenomContact' => 'John',
            'fonctionContact' => 'Manager',
            'telephoneContact' => '+33612345678',
            'adresseMailContact' => 'john.doe@example.com',
            'observations' => 'Aucune observation',
            'dateRelance' => now()->toDateString(),
            'statut' => 'En cours',
            'idUPPA' => '610000',
            'idEntreprise' => 1,
        ];

        $response = $this->postJson('/api/recherches-stages/create', $donnees);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Erreur de validation dans les données']);
    }

    public function test_store_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $this->mock(RechercheStage::class, function ($mock) {
            $mock->shouldReceive('create')->andThrow(new \Exception('Erreur simulée'));
        });

        $donnees = [
            'dateCreation' => now()->toDateString(),
            'dateModification' => now()->toDateString(),
            'date1erContact' => now()->toDateString(),
            'typeContact' => 'Mail',
            'nomContact' => 'Doe',
            'prenomContact' => 'John',
            'fonctionContact' => 'Manager',
            'telephoneContact' => '+33612345678',
            'adresseMailContact' => 'john.doe@example.com',
            'observations' => 'Aucune observation',
            'dateRelance' => now()->toDateString(),
            'statut' => 'En cours',
            'idUPPA' => '610000',
            'idEntreprise' => 1,
        ];

        $response = $this->postJson('/api/recherches-stages/create', $donnees);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE SHOW
    ================================
    */
    public function test_show_renvoie_une_confirmation_et_les_informations_de_la_recherche_de_stage()
    {
        $recherche = RechercheStage::first();

        $response = $this->get('/api/recherches-stages/' . $recherche->idRecherche);

        $response->assertStatus(200)
            ->assertJson([
                'idRecherche' => $recherche->idRecherche,
                'idUPPA' => $recherche->idUPPA,
                'idEntreprise' => $recherche->idEntreprise,
                // ... autres champs
            ]);
    }

    public function test_show_renvoie_une_erreur_non_trouvee_en_cas_de_recherche_non_trouvee()
    {
        $idRecherche = PHP_INT_MAX;

        $response = $this->get('/api/recherches-stages/' . $idRecherche);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucune recherche de stage trouvée']);
    }

    public function test_show_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $this->mock(RechercheStage::class, function ($mock) {
            $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));
        });

        $recherche = RechercheStage::first();

        $response = $this->get('/api/recherches-stages/' . $recherche->idRecherche);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE UPDATE
    ================================
    */
    public function test_update_renvoie_une_confirmation_et_les_informations_modifiees()
    {
        $donnees = [
            'date1erContact' => '2025-01-17',
            'typeContact' => 'Mail',
            'nomContact' => 'Dupont',
            'prenomContact' => 'Micheline',
            'fonctionContact' => 'Responsable RH',
            'telephoneContact' => '0123456789',
            'adresseMailContact' => 'contact@entreprise.com',
            'observations' => 'Profil pas assez intéressant',
            'dateRelance' => null,
            'statut' => 'Refusé',
        ];

        $recherche = RechercheStage::first();

        $response = $this->putJson('/api/recherches-stages/update/' . $recherche->idRecherche, $donnees);

        $response->assertStatus(200)
            ->assertJson([
                'idRecherche' => $recherche->idRecherche,
                'idUPPA' => $recherche->idUPPA,
                'idEntreprise' => $recherche->idEntreprise,
                'typeContact' => 'Mail',
                'nomContact' => 'Dupont',
                'prenomContact' => 'Micheline',
                'statut' => 'Refusé',
            ]);
    }

    public function test_update_renvoie_une_erreur_de_validation()
    {
        $donnees = [
            'statut' => 'TEST', // invalide
        ];

        $recherche = RechercheStage::first();

        $response = $this->putJson('/api/recherches-stages/update/' . $recherche->idRecherche, $donnees);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Erreur de validation dans les données']);
    }

    public function test_update_renvoie_une_erreur_non_trouvee()
    {
        $idRecherche = PHP_INT_MAX;

        $donnees = ['statut' => 'Refusé'];

        $response = $this->putJson('/api/recherches-stages/update/' . $idRecherche, $donnees);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucune recherche de stage trouvée']);
    }

    public function test_update_renvoie_une_erreur_generique()
    {
        $this->mock(RechercheStage::class, function ($mock) {
            $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));
        });

        $recherche = RechercheStage::first();
        $donnees = ['statut' => 'Refusé'];

        $response = $this->putJson('/api/recherches-stages/update/' . $recherche->idRecherche, $donnees);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE DESTROY
    ================================
    */
    public function test_destroy_renvoie_une_confirmation_de_la_suppression()
    {
        $recherche = RechercheStage::first();

        $response = $this->deleteJson('/api/recherches-stages/delete/' . $recherche->idRecherche);

        $response->assertStatus(200)
            ->assertJson(['message' => 'La recherche de stage a bien été supprimée']);
    }

    public function test_destroy_renvoie_une_erreur_non_trouvee()
    {
        $idRecherche = PHP_INT_MAX;

        $response = $this->deleteJson('/api/recherches-stages/delete/' . $idRecherche);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucune recherche de stage trouvée']);
    }

    public function test_destroy_renvoie_une_erreur_generique()
    {
        $this->mock(RechercheStage::class, function ($mock) {
            $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));
        });

        $recherche = RechercheStage::first();

        $response = $this->deleteJson('/api/recherches-stages/delete/' . $recherche->idRecherche);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
