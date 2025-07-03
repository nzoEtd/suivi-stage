<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\RechercheStage;
use App\Models\FicheDescriptive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EtudiantController extends Controller
{
    /**
     * Retourne tous les étudiants
     *
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fields = explode(',', $request->query('fields', '*'));

        $allowedFields = ['idUPPA','nom','prenom',
                          'adresse','ville','codePostal',
                          'telephone','adresseMail','idDepartement',
                          'idEntreprise','idTuteur'];
        $fields = array_intersect($fields, $allowedFields);

        $etudiants = Etudiant::select(empty($fields) ? '*' : $fields)->get();

        return response()->json($etudiants, 200);
    }   

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try
        {
            $unEtudiant = Etudiant::findOrFail($id);
            return response()->json($unEtudiant, 200);
        }
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e)
        {
            return response()->json([
                'message' => 'Aucun étudiant trouvé'
            ],404);
        }
        catch (\Exception $e)
        {
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'erreurs' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Retourne toutes les recherches de stage d'un étudiant donné
     * Code HTTP retourné :
     *      - Code 200 : si l'étudiant a été trouvé et qu'il a des recherches de stage
     *      - Code 404 : si l'étudiant a été trouvé mais qu'il n'a pas de recherche de stage ou si l'étudiant n'a pas été trouvé
     *      - Code 500 : s'il y a une erreur
     * @param int $id
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function indexRechercheStage($id)
    {
        try
        {
            // Vérifie si l'étudiant existe
            $unEtudiant = Etudiant::findOrFail($id);

            $desRecherches = RechercheStage::where('idUPPA',$id)->get();

            if($desRecherches->isEmpty())
            {
                return response()->noContent();
            }
            
            return response()->json($desRecherches, 200);
        }
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e)
        {
            return response()->json([
                'message' => 'Aucun étudiant trouvé'
            ],404);
        }
        catch (\Exception $e)
        {
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'erreurs' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Retourne toutes les recherches de stage d'un étudiant donné
     * Code HTTP retourné :
     *      - Code 200 : si l'étudiant a été trouvé et qu'il a des recherches de stage
     *      - Code 404 : si l'étudiant a été trouvé mais qu'il n'a pas de recherche de stage ou si l'étudiant n'a pas été trouvé
     *      - Code 500 : s'il y a une erreur
     * @param int $id
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function indexFicheDescriptive($id)
    {
        try
        {
            // Vérifie si l'étudiant existe
            $unEtudiant = Etudiant::findOrFail($id);

            $desFiches = FicheDescriptive::where('idUPPA',$id)->get();

            if($desFiches->isEmpty())
            {
                return response()->noContent();
            }
            
            return response()->json($desFiches, 200);
        }
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e)
        {
            return response()->json([
                'message' => 'Aucun étudiant trouvé'
            ],404);
        }
        catch (\Exception $e)
        {
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'erreurs' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Retourne toutes les informations du parcours de l'étudiant passé en paramètre
     * Code HTTP retourné :
     *     - Code 200 : si l'étudiant a été trouvé et qu'il a un parcours
     *     - Code 404 : si l'étudiant a été trouvé mais qu'il n'a pas de parcours ou si l'étudiant n'a pas été trouvé
     *     - Code 500 : s'il y a une erreur
     * @param int $id
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function indexParcours($id){
        try{
            $unEtudiant = Etudiant::findOrFail($id);
            $infoParcours = db::table('table_etudiant_parcours_anneeuniv')->where('idUPPA',$id)
                            ->orderbydesc('idAnneeUniversitaire')->limit(1)->get();
            return response()->json($infoParcours, 200);
        }
        catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'message' => 'Aucun étudiant trouvé'
            ],404);
        }
        catch(\Exception $e){
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'erreurs' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Créer un nouveau token pour l'étudiant, avec une date d'expiration
     * Code HTTP retourné :
     *      - Code 200 : si le token a été créé avec succès
     *      - Code 404 : si l'étudiant n'a pas été trouvé
     *      - Code 500 : s'il y a une erreur
     * @param int $id
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function createToken($id){
        try {
            $unEtudiant = Etudiant::findOrFail($id);
            $token = Str::random(128);                          // Génère une chaîne aléatoire de 128 caractères
            $expirationDate = now('Europe/Paris')->addHours(2); // Prise en compte du fuseau horaire

            $unEtudiant->token = $token;
            $unEtudiant->dateExpirationToken = $expirationDate;
            $unEtudiant->save();

            return response()->json([
                'message' => 'Token créé avec succès'
            ], 200);
        }
        catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'message' => 'Aucun étudiant trouvé'
            ], 404);
        }
        catch(\Exception $e){
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'erreurs' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère le token et la date d'expiration d'un étudiant
     * Code HTTP retourné :
     *      - Code 200 : si l'étudiant a été trouvé et qu'il a un token
     *      - Code 404 : si l'étudiant n'a pas été trouvé ou s'il n'a pas de token
     *      - Code 500 : s'il y a une erreur
     * @param int $id
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function getToken($id){
        try {
            $unEtudiant = Etudiant::findOrFail($id);
            
            // Vérifie si l'étudiant a un token
            if (empty($unEtudiant->token) || empty($unEtudiant->dateExpirationToken)) {
                return response()->json([
                    'message' => 'Aucun token trouvé pour cet étudiant'
                ], 404);
            }

            return response()->json([
                'token' => $unEtudiant->token,
                'dateExpiration' => $unEtudiant->dateExpirationToken
            ], 200);
        }
        catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'message' => 'Aucun étudiant trouvé'
            ], 404);
        }
        catch(\Exception $e){
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'erreurs' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime le token et la date d'expiration d'un étudiant
     * Code HTTP retourné :
     *      - Code 200 : si le token a été supprimé avec succès
     *      - Code 404 : si l'étudiant n'a pas été trouvé
     *      - Code 500 : s'il y a une erreur
     * @param int $id
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function deleteToken($id){
        try {
            $unEtudiant = Etudiant::findOrFail($id);
            
            // Supprime le token et la date d'expiration
            $unEtudiant->token = null;
            $unEtudiant->dateExpirationToken = null;
            $unEtudiant->save();

            return response()->json([
                'message' => 'Token supprimé avec succès'
            ], 200);
        }
        catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'message' => 'Aucun étudiant trouvé'
            ], 404);
        }
        catch(\Exception $e){
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'erreurs' => $e->getMessage()
            ], 500);
        }
    }
}
