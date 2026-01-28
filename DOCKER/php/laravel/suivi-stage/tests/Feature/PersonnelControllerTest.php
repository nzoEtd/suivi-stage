<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Personnel;
use Mockery;

class PersonnelControllerTest extends TestCase
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
    public function test_index_renvoie_une_confirmation_et_la_liste_des_membres_du_personnel()
    {
        $personnels = Personnel::all();

        $response = $this->get('/api/personnel');

        $response->assertStatus(200)
            ->assertJson($personnels->toArray());
    }

    /*
    ================================
        TEST DE LA METHODE STORE
    ================================
    */
    public function test_store_renvoie_une_confirmation_et_le_membre_du_personnel_cree()
    {
        $donnees = [
            'login' => 'jdupont',
            'roles' => 'Enseignant',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'adresse' => null,
            'ville' => null,
            'codePostal' => null,
            'telephone' => null,
            'adresseMail' => 'jdupont@univ-pau.fr',
            'longitudeAdresse' => null,
            'latitudeAdresse' => null,
            'quotaEtudiant' => 8,
        ];

        $response = $this->post('/api/personnel/create', $donnees);

        $response->assertStatus(201)
            ->assertJson($donnees);
    }

    public function test_store_renvoie_une_erreur_de_validation()
    {
        $donnees = [
            'login' => 'jdupont',
            'roles' => 'TEST', // Rôle incorrect
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'adresse' => null,
            'ville' => null,
            'codePostal' => null,
            'telephone' => null,
            'adresseMail' => 'jdupont@univ-pau.fr',
            'longitudeAdresse' => null,
            'latitudeAdresse' => null,
            'quotaEtudiant' => 8,
        ];

        $response = $this->post('/api/personnel/create', $donnees);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Erreur de validation dans les données']);
    }

    public function test_store_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $this->mock(Personnel::class, function ($mock) {
            $mock->shouldReceive('create')->andThrow(new \Exception('Erreur simulée'));
        });

        $donnees = [
            'login' => 'jdupont',
            'roles' => 'Enseignant',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'adresse' => null,
            'ville' => null,
            'codePostal' => null,
            'telephone' => null,
            'adresseMail' => 'jdupont@univ-pau.fr',
            'longitudeAdresse' => null,
            'latitudeAdresse' => null,
            'quotaEtudiant' => 8,
        ];

        $response = $this->post('/api/personnel/create', $donnees);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE SHOW
    ================================
    */
    public function test_show_renvoie_une_confirmation_et_les_details_du_membre_du_personnel()
    {
        $personnel = Personnel::first();

        $response = $this->get('/api/personnel/' . $personnel->idPersonnel);

        $response->assertStatus(200)
            ->assertJson($personnel->toArray());
    }

    public function test_show_renvoie_une_erreur_non_trouvee_en_cas_de_personnel_non_trouve()
    {
        $idPersonnel = PHP_INT_MAX;

        $response = $this->get('/api/personnel/' . $idPersonnel);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucun personnel trouvé']);
    }

    public function test_show_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $this->mock(Personnel::class, function ($mock) {
            $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));
        });

        $personnel = Personnel::first();

        $response = $this->get('/api/personnel/' . $personnel->idPersonnel);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE UPDATE
    ================================
    */
    public function test_update_renvoie_une_confirmation_et_le_personnel_modifie()
    {
        $donnees = [
            'login' => 'jdupont',
            'roles' => 'Enseignant',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'adresse' => null,
            'ville' => null,
            'codePostal' => null,
            'telephone' => null,
            'adresseMail' => 'jdupont@univ-pau.fr',
            'longitudeAdresse' => null,
            'latitudeAdresse' => null,
            'quotaEtudiant' => 8,
        ];

        $personnel = Personnel::first();

        $response = $this->putJson('/api/personnel/update/' . $personnel->idPersonnel, $donnees);

        $response->assertStatus(200)
            ->assertJson($donnees);
    }

    public function test_update_renvoie_une_erreur_de_validation_en_cas_de_donnees_invalides()
    {
        $donnees = [
            'login' => 'jdupont',
            'roles' => 'TEST',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'adresse' => null,
            'ville' => null,
            'codePostal' => null,
            'telephone' => null,
            'adresseMail' => 'jdupont@univ-pau.fr',
            'longitudeAdresse' => null,
            'latitudeAdresse' => null,
            'quotaEtudiant' => 8,
        ];

        $personnel = Personnel::first();

        $response = $this->putJson('/api/personnel/update/' . $personnel->idPersonnel, $donnees);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Erreur de validation dans les données']);
    }

    public function test_update_renvoie_une_erreur_non_trouvee_en_cas_de_personnel_non_trouve()
    {
        $donnees = [
            'login' => 'jdupont',
            'roles' => 'Enseignant',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'adresse' => null,
            'ville' => null,
            'codePostal' => null,
            'telephone' => null,
            'adresseMail' => 'jdupont@univ-pau.fr',
            'longitudeAdresse' => null,
            'latitudeAdresse' => null,
            'quotaEtudiant' => 8,
        ];

        $idPersonnel = PHP_INT_MAX;

        $response = $this->putJson('/api/personnel/update/' . $idPersonnel, $donnees);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucun personnel trouvé']);
    }

    public function test_update_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $this->mock(Personnel::class, function ($mock) {
            $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));
        });

        $donnees = [
            'login' => 'jdupont',
            'roles' => 'Enseignant',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'adresse' => null,
            'ville' => null,
            'codePostal' => null,
            'telephone' => null,
            'adresseMail' => 'jdupont@univ-pau.fr',
            'longitudeAdresse' => null,
            'latitudeAdresse' => null,
            'quotaEtudiant' => 8,
        ];

        $personnel = Personnel::first();

        $response = $this->putJson('/api/personnel/update/' . $personnel->idPersonnel, $donnees);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
    ================================
        TEST DE LA METHODE DESTROY
    ================================
    */
    public function test_destroy_renvoie_une_confirmation_de_la_suppression_du_personnel()
    {
        $personnel = Personnel::orderBy('idPersonnel', 'desc')->first();

        $response = $this->delete('/api/personnel/delete/' . $personnel->idPersonnel);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Le personnel a bien été supprimé']);
    }

    public function test_destroy_renvoie_une_erreur_non_trouvee_en_cas_de_personnel_non_trouve()
    {
        $idPersonnel = PHP_INT_MAX;

        $response = $this->delete('/api/personnel/delete/' . $idPersonnel);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Aucun personnel trouvé']);
    }

    public function test_destroy_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $this->mock(Personnel::class, function ($mock) {
            $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));
        });

        $personnel = Personnel::first();

        $response = $this->delete('/api/personnel/delete/' . $personnel->idPersonnel);

        $response->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
