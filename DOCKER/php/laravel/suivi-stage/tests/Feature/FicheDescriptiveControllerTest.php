<?php

namespace Tests\Feature;

use App\Models\FicheDescriptive;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\Feature\Exception;
use Tests\TestCase;
use Mockery;

class FicheDescriptiveControllerTest extends TestCase
{
    /**
     * Recréer les tables avec les seeders
     *
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate:fresh');
        $this->artisan('db:seed');
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /*
     * ================================
     *     TEST DE LA METHODE UPDATE
     * ================================
     */

    /**
     * La méthode update doit retourner une confirmation 200 et les données de la fiche descriptive
     *
     *
     * @return void
     */
    public function test_update_methode_doit_retourner_200_car_la_fiche_descriptive_a_ete_mise_a_jour()
    {
        $donneesEnvoyees = [
            'contenuStage' => ['value' => "Développement d'une application web", 'type' => 'ficheDescriptive'],
            'thematiqueFicheDescriptive' => ['value' => 'Développement logiciel', 'type' => 'ficheDescriptive'],
            'sujetFicheDescriptive' => ['value' => "Création d'un outil de gestion des tâches", 'type' => 'ficheDescriptive'],
            'fonctionsFicheDescriptive' => ['value' => 'Développeur logiciel', 'type' => 'ficheDescriptive'],
            'tachesFicheDescriptive' => ['value' => 'Analyser, développer et tester', 'type' => 'ficheDescriptive'],
            'competencesFicheDescriptive' => ['value' => 'PHP, Laravel, JavaScript', 'type' => 'ficheDescriptive'],
            'detailsFicheDescriptive' => ['value' => "Travail en collaboration avec l'équipe backend", 'type' => 'ficheDescriptive'],
            'debutStageFicheDescriptive' => ['value' => '2025-02-01', 'type' => 'ficheDescriptive'],
            'finStageFicheDescriptive' => ['value' => '2025-06-30', 'type' => 'ficheDescriptive'],
            'nbJourSemaineFicheDescriptive' => ['value' => 5, 'type' => 'ficheDescriptive'],
            'nbHeuresSemaineFicheDescriptive' => ['value' => 35, 'type' => 'ficheDescriptive'],
            'clauseConfidentialiteFicheDescriptive' => ['value' => true, 'type' => 'ficheDescriptive'],
            'serviceEntrepriseFicheDescriptive' => ['value' => 'Service informatique', 'type' => 'ficheDescriptive'],
            'adresseMailStageFicheDescriptive' => ['value' => 'perigueux@zero-infini.fr', 'type' => 'ficheDescriptive'],
            'telephoneStageFicheDescriptive' => ['value' => '0556010203', 'type' => 'ficheDescriptive'],
            'adresseStageFicheDescriptive' => ['value' => '20 Rue Ernest Guillier', 'type' => 'ficheDescriptive'],
            'codePostalStageFicheDescriptive' => ['value' => '24000', 'type' => 'ficheDescriptive'],
            'villeStageFicheDescriptive' => ['value' => 'Périgueux', 'type' => 'ficheDescriptive'],
            'paysStageFicheDescriptive' => ['value' => 'France', 'type' => 'ficheDescriptive'],
            'statut' => ['value' => 'En cours', 'type' => 'ficheDescriptive'],
            'numeroConvention' => ['value' => '12345-ABCDE', 'type' => 'ficheDescriptive'],
            'interruptionStageFicheDescriptive' => ['value' => false, 'type' => 'ficheDescriptive'],
            'personnelTechniqueDisponibleFicheDescriptive' => ['value' => true, 'type' => 'ficheDescriptive'],
            'materielPreteFicheDescriptive' => ['value' => 'Ordinateur, logiciel de gestion', 'type' => 'ficheDescriptive']
        ];

        $rechercheFirst = FicheDescriptive::first();

        $response = $this->putJson('/api/fiche-descriptive/update/' . $rechercheFirst->idFicheDescriptive, $donneesEnvoyees);

        $response
            ->assertStatus(200)
            ->assertJson([
                'ficheDescriptive' => [
                    'thematique' => 'Développement logiciel',
                    'sujet' => "Création d'un outil de gestion des tâches",
                    'fonctions' => 'Développeur logiciel',
                    'competences' => 'PHP, Laravel, JavaScript',
                    'debutStage' => '2025-02-01',
                    'finStage' => '2025-06-30',
                    'telephoneStage' => '0556010203'
                ]
            ]);
    }

    /**
     * La méthode update doit retourner une erreur 404 car la fiche descriptive n'existe pas
     *
     *
     * @return void
     */
    public function test_update_methode_doit_retourner_une_erreur_404_car_l_id_de_la_fiche_descriptive_n_existe_pas()
    {
        $idFiche = 99999;
        $response = $this->putJson('/api/fiche-descriptive/update/' . $idFiche, [
            'statut' => 'En cours'
        ]);

        $response
            ->assertStatus(404)
            ->assertJson(['message' => 'Fiche descriptive non trouvée']);
    }

    /**
     * La méthode update doit retourner une erreur 500 si une erreur survient lors de la mise à jour
     * @return void
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_update_methode_doit_retourner_une_erreur_500_car_un_probleme_est_survenu()
    {
        // Mock du modèle FicheDescriptive pour déclencher une exception
        $mock = Mockery::mock('alias:App\Models\FicheDescriptive');
        $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));

        $donnees = [
            'contenuStage' => "Développement d'une application web",
            'thematique' => 'Développement logiciel',
            'sujet' => "Création d'un outil de gestion des tâches",
            'fonctions' => 'Développeur logiciel',
            'taches' => 'Analyser, développer et tester',
            'competences' => 'PHP, Laravel, JavaScript',
            'details' => "Travail en collaboration avec l'équipe backend",
            'debutStage' => '2025-02-01',
            'finStage' => '2025-06-30',
            'nbJourSemaine' => 5,
            'nbHeureSemaine' => 35,
            'clauseConfidentialite' => true,
            'serviceEntreprise' => 'Service informatique',
            'adresseMailStage' => 'perigueux@zero-infini.fr',
            'telephoneStage' => '0556010203',
            'adresseStage' => '20 Rue Ernest Guillier',
            'codePostalStage' => '24000',
            'villeStage' => 'Périgueux',
            'paysStage' => 'France',
            'longitudeStage' => '0.716667',
            'latitudeStage' => '45.183333',
            'statut' => 'En cours',
            'numeroConvention' => '12345-ABCDE',
            'interruptionStage' => false,
            'dateDebutInterruption' => null,
            'dateFinInterruption' => null,
            'personnelTechniqueDisponible' => true,
            'materielPrete' => 'Ordinateur, logiciel de gestion'
        ];

        $response = $this->putJson('/api/fiche-descriptive/update/1', $donnees);
        $response
            ->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
     * ================================
     *     TEST DE LA METHODE INDEX
     * ================================
     */

    /**
     * La méthode index doit retourner une confirmation 200 et la liste de toutes les fiches descriptives
     *
     *
     * @return void
     */
    public function test_index_methode_doit_retourner_200_et_la_list_des_fiches_descriptives()
    {
        $fiches = FicheDescriptive::all();

        $response = $this->get('/api/fiche-descriptive');

        $response
            ->assertStatus(200)
            ->assertJson($fiches->toArray());
    }

    /**
     * La méthode index doit retourner une erreur 500 si une erreur survient lors de la récupération
     *
     * @return void
     */

    /*public function test_index_methode_doit_retourner_une_erreur_500_si_une_erreur_survient(){
        // Créer un "partial mock" qui simule uniquement la méthode `all` de FicheDescriptive
        $ficheDescriptiveMock = \Mockery::mock('App\Models\FicheDescriptive[all]');  // On ne mock que la méthode all()
        $ficheDescriptiveMock->shouldReceive('all')
                            ->andThrow(new \Exception("Erreur simulée"));

        // Remplacer la méthode all() dans l'application par le mock
        app()->instance('App\Models\FicheDescriptive', $ficheDescriptiveMock);

        // Appeler la route
        $response = $this->get('/fiche-descriptive');

        // Vérifier la réponse
        $response->assertStatus(500)
                ->assertJson([
                    'message' => 'Une erreur s\'est produite :',
                    'erreurs' => 'Erreur simulée',
                ]);
    }*/

    /*
     * ================================
     *     TEST DE LA METHODE SHOW
     * ================================
     */

    /**
     * La méthode show doit retourner une confirmation 200 et les données de la fiche descriptive
     *
     * @return void
     */
    public function test_show_methode_doit_retourner_un_code_200_car_la_fiche_descriptive_a_ete_trouvee()
    {
        $ficheFirst = FicheDescriptive::first();
        $response = $this->get('/api/fiche-descriptive/' . $ficheFirst->idFicheDescriptive);

        $response
            ->assertStatus(200)
            ->assertJson([
                'idFicheDescriptive' => [
                    'value' => $ficheFirst->idFicheDescriptive,
                    'type' => 'ficheDescriptive'
                ],
                'statut' => [
                    'value' => $ficheFirst->statut,
                    'type' => 'ficheDescriptive'
                ]
            ]);
    }

    /**
     * La méthode show doit retourner une erreur 404 si la fiche descriptive n'existe pas
     *
     * @return void
     */
    public function test_show_methode_doit_retourner_une_erreur_404_car_la_fiche_descriptive_n_existe_pas()
    {
        $idFiche = PHP_INT_MAX;

        $response = $this->get('/api/fiche-descriptive/' . $idFiche);

        $response = $this->get('/api/fiche-descriptive/' . $idFiche);

        $response
            ->assertStatus(404)
            ->assertJson(['message' => 'Fiche descriptive non trouvée']);
    }

    /**
     * La méthode show doit retourner une erreur 500 si une erreur survient lors de la récupération
     *
     * @return void
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_show_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $mock = Mockery::mock('alias:App\Models\FicheDescriptive');
        $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));

        $response = $this->get('/api/fiche-descriptive/1');

        $response
            ->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }

    /*
     * ==================================
     *     TEST DE LA METHODE DESTROY
     * ==================================
     */

    /**
     * La méthode destroy doit retourner une confirmation 200 et un message de suppression
     *
     * @return void
     */
    public function test_destroy_doit_retourner_un_code_200()
    {
        $uneFicheDescriptive = FicheDescriptive::first();

        $response = $this->delete('/api/fiche-descriptive/delete/' . $uneFicheDescriptive->idFicheDescriptive);

        $response
            ->assertStatus(200)
            ->assertJson(['message' => 'La fiche descriptive a bien été supprimée']);
    }

    /**
     * La méthode destroy doit retourner une erreur 404 si la fiche descriptive n'a pas été trouvée
     *
     *
     * @return void
     */
    public function test_destroy_renvoie_une_erreur_non_trouvee_en_cas_de_fiche_non_trouvee()
    {
        $idFiche = PHP_INT_MAX;

        $response = $this->delete('/api/fiche-descriptive/delete/' . $idFiche);

        $response
            ->assertStatus(404)
            ->assertJson(['message' => 'Aucune fiche descriptive trouvée']);
        $response
            ->assertStatus(404)
            ->assertJson(['message' => 'Aucune fiche descriptive trouvée']);
    }

    /**
     * La méthode destroy doit retourner une erreur 500 en cas d'exception
     *
     * @return void
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_destroy_renvoie_une_erreur_generique_en_cas_d_exception()
    {
        $mock = Mockery::mock('alias:App\Models\FicheDescriptive');
        $mock->shouldReceive('findOrFail')->andThrow(new \Exception('Erreur simulée'));

        $response = $this->deleteJson('/api/fiche-descriptive/delete/1');

        $response
            ->assertStatus(500)
            ->assertJson(['message' => "Une erreur s'est produite :"]);
    }
}
