<?php

namespace App\Http\Controllers;

use App\Models\TD;
use Illuminate\Http\Request;

class TDController extends Controller
{
    /**
     * Retourne tous les TD
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Récupère les champs demandés dans la requête (ou "*" par défaut)
        $fields = explode(',', $request->query('fields', '*'));

        // Vérifie si les champs demandés existent dans la table
        $allowedFields = ['idTD', 'libelle'];
        $fields = array_intersect($fields, $allowedFields);

        $query = TD::query();

        // Si aucun champ valide n'est fourni, on récupère tout par défaut
        $tds = $query->select(empty($fields) ? '*' : $fields)->get();

        return response()->json($tds, 200);
    }


    /**
     * Créer un nouveau TD
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 201 : si le TD a bien été créé
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     *
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function store(Request $request)
    {
        try {
            // unique pour éviter les doublons
            $donneesValidees = $request->validate([
                'libelle' => 'bail|required|string|max:10|unique:t_d_s,libelle',
            ]);

            $td = TD::create($donneesValidees);

            return response()->json($td, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation des données',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retourne un TD particulier
     *
     * @param  int  $idTD
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le TD a été trouvé
     *      - Code 404 : si le TD n'a pas été trouvé
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function show($idTD)
    {
        try {
            $td = TD::findOrFail($idTD);
            return response()->json($td, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucun TD trouvé'
            ], 404);
        }
    }


    /**
     * Modifie un TD particulier
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $idTD
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le TD a bien été modifié
     *      - Code 404 : si le TD n'a pas été trouvé
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function update(Request $request, $idTD)
    {
        try {
            // unique pour éviter les doublons
            $donneesValidees = $request->validate([
                'libelle' => 'required|string|max:10|unique:t_d_s,libelle,' . $idTD . ',idTD',
            ]);

            $td = TD::findOrFail($idTD);
            $td->update($donneesValidees);

            return response()->json($td, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucun TD trouvé'
            ], 404);
        }
    }

    /**
     * Supprime un TD particulier
     *
     * @param  int  $idTD
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le TD a bien été supprimé
     *      - Code 404 : si le TD n'a pas été trouvé
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function destroy($idTD)
    {
        try {
            $td = TD::findOrFail($idTD);
            $td->delete();

            return response()->json([
                'message' => 'Le TD a bien été supprimé'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucun TD trouvé'
            ], 404);
        }
    }
}
