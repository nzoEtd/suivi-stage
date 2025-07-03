<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PersonnelController extends Controller
{
    /**
     * Retourne tous les membres du personnels existants
     *
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Récupère les champs demandés dans la requête (ou "*" par défaut)
        $fields = explode(',', $request->query('fields', '*'));

        // Vérifie si les champs demandés existent dans la table
        $allowedFields = [
            'idPersonnel','login','roles',
            'nom','prenom','adresse',
            'ville','codePostal','telephone',
            'adresseMail','longitudeAdresse','latitudeAdresse',
            'coptaEtudiant'
        ];
        $fields = array_intersect($fields, $allowedFields);

        // si aucun champ valide n'est fourni, on récupère tout par défaut
        $personnel = Personnel::select(empty($fields) ? '*' : $fields)->get();

        return response()->json($personnel,200);
    }

    /**
     * Créer un nouveau membre du personnel
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 201 : si le personnel a bien été créé
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function store(Request $request)
    {
        try
        {
            $donneesValidees = $request->validate([
                'login'             => 'bail|required|string|max:50',
                'roles'             => 'bail|required|string|in:Gestionnaire,Enseignant',
                'nom'               => 'bail|required|string|max:50',
                'prenom'            => 'bail|required|string|max:50',
                'adresse'           => 'nullable|string|max:100',
                'ville'             => 'nullable|string|max:50',
                'codePostal'        => ['nullable','string','regex:/^[0-9]{5}$/'],
                'telephone'         => ['nullable','string','regex:/^(\+33|0)\d{9}$/m'],
                'adresseMail'       => 'bail|required|string|email|max:50',
                'longitudeAdresse'  => 'nullable|string|max:20',
                'latitudeAdresse'   => 'nullable|string|max:20',
                'coptaEtudiant'     => 'required|integer',
            ]);

            $unPersonnel = Personnel::create([
                'login'             => $donneesValidees['login'],
                'roles'             => $donneesValidees['roles'],
                'nom'               => $donneesValidees['nom'],
                'prenom'            => $donneesValidees['prenom'],
                'adresse'           => $donneesValidees['adresse'],
                'ville'             => $donneesValidees['ville'],
                'codePostal'        => $donneesValidees['codePostal'],
                'telephone'         => $donneesValidees['telephone'],
                'adresseMail'       => $donneesValidees['adresseMail'],
                'longitudeAdresse'  => $donneesValidees['longitudeAdresse'],
                'latitudeAdresse'   => $donneesValidees['latitudeAdresse'],
                'coptaEtudiant'     => $donneesValidees['coptaEtudiant'],
            ]);

            return response()->json($unPersonnel, 201);
        }
        catch (\Illuminate\Validation\ValidationException $e)
        {
            return response()->json([
                'message' => 'Erreur de validation dans les données',
                'erreurs' => $e->errors()
            ],422);
        }
        catch (\Exception $e)
        {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ],500);
        }	
    }

    /**
     * Retourne un membre du personnel particulier
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le personnel a été trouvé
     *      - Code 404 : si le personnel n'a pas été trouvé
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function show($id)
    {
        try
        {
            $unPersonnel = Personnel::findOrFail($id);
            return response()->json($unPersonnel, 200);
        }
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e)
        {
            return response()->json([
                'message' => 'Aucun personnel trouvé'
            ],404);
        }
        catch (\Exception $e)
        {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Modifie un membre du personnel particulier
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le personnel a bien été modifié
     *      - Code 404 : si le personnel n'a pas été trouvé
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function update(Request $request, $id)
    {
        try
        {
            $donneesValidees = $request->validate([
                'login'             => 'bail|required|string|max:50',
                'roles'             => 'bail|required|string|in:Gestionnaire,Enseignant',
                'nom'               => 'bail|required|string|max:50',
                'prenom'            => 'bail|required|string|max:50',
                'adresse'           => 'nullable|string|max:100',
                'ville'             => 'nullable|string|max:50',
                'codePostal'        => ['nullable','string','regex:/^[0-9]{5}$/'],
                'telephone'         => ['nullable','string','regex:/^(\+33|0)\d{9}$/m'],
                'adresseMail'       => 'bail|required|string|email|max:50',
                'longitudeAdresse'  => 'nullable|string|max:20',
                'latitudeAdresse'   => 'nullable|string|max:20',
                'coptaEtudiant'     => 'required|integer',
            ]);

            $unPersonnel = Personnel::findOrFail($id);
            $unPersonnel->update($donneesValidees);

            return response()->json($unPersonnel, 200);
        }
        catch (\Illuminate\Validation\ValidationException $e)
        {
            return response()->json([
                'message' => 'Erreur de validation dans les données',
                'erreurs' => $e->errors()
            ],422);
        }
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e)
        {
            return response()->json([
                'message' => 'Aucun personnel trouvé'
            ],404);
        }
        catch (\Exception $e)
        {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Supprime un membre du personnel particulier
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le personnel a bien été supprimé
     *      - Code 404 : si le personnel n'a pas été trouvé
     *      - Code 500 : s'il y a une erreur
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function destroy($id)
    {
        try
        {
            $unPersonnel = Personnel::findOrFail($id);
            $unPersonnel->delete();

            return response()->json([
                'message' => 'Le personnel a bien été supprimé'
            ], 200);
        }
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e)
        {
            return response()->json([
                'message' => 'Aucun personnel trouvé'
            ],404);
        }
        catch (\Exception $e)
        {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ],500);
        }
    }

    
    /**
     * Créer un nouveau token pour le membre du personnel, avec une date d'expiration
     * Code HTTP retourné :
     *      - Code 200 : si le token a été créé avec succès
     *      - Code 404 : si le membre du personnel n'a pas été trouvé
     *      - Code 500 : s'il y a une erreur
     * @param int $id
     * @return \Illuminate\Http\Response
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function createToken($id){
        try {
            $unPersonnel = Personnel::findOrFail($id);
            $token = Str::random(128);                          // Génère une chaîne aléatoire de 128 caractères
            $expirationDate = now('Europe/Paris')->addHours(2); // Prise en compte du fuseau horaire

            // Met à jour l'étudiant avec le token et la date d'expiration
            $unPersonnel->token = $token;
            $unPersonnel->dateExpirationToken = $expirationDate;
            $unPersonnel->save();

            return response()->json([
                'message' => 'Token créé avec succès'
            ], 200);
        }
        catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'message' => 'Aucun membre du personnel trouvé'
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
            $unPersonnel = Personnel::findOrFail($id);
            
            // Vérifie si l'étudiant a un token
            if (empty($unPersonnel->token) || empty($unPersonnel->dateExpirationToken)) {
                return response()->json([
                    'message' => 'Aucun token trouvé pour ce membre du personnel'
                ], 404);
            }

            return response()->json([
                'token' => $unPersonnel->token,
                'dateExpiration' => $unPersonnel->dateExpirationToken
            ], 200);
        }
        catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'message' => 'Aucun membre du personnel trouvé'
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
            $unPersonnel = Personnel::findOrFail($id);
            
            // Supprime le token et la date d'expiration
            $unPersonnel->token = null;
            $unPersonnel->dateExpirationToken = null;
            $unPersonnel->save();

            return response()->json([
                'message' => 'Token supprimé avec succès'
            ], 200);
        }
        catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
                'message' => 'Aucun membre du personnel trouvé'
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
