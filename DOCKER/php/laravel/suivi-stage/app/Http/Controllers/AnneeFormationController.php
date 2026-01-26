<?php

namespace App\Http\Controllers;

use App\Models\AnneeFormation;
use Illuminate\Http\Request;

class AnneeFormationController extends Controller
{
    /**
     * Retourne toutes les Années de formation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Récupère les champs demandés dans la requête (ou "*" par défaut)
        $fields = explode(',', $request->query('fields', '*'));

        // Vérifie si les champs demandés existent dans la table
        $allowedFields = ['idAnneeFormation', 'libelle'];
        $fields = array_intersect($fields, $allowedFields);

        $query = AnneeFormation::query();

        // Si aucun champ valide n'est fourni, on récupère tout par défaut
        $anneeForms = $query->select(empty($fields) ? '*' : $fields)->get();

        return response()->json($anneeForms, 200);
    }

    /**
     * Créer une nouvelle année de formation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 201 : si l'année de formation a bien été créé
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
                'libelle' => 'bail|required|string|max:10|unique:annee_formations,libelle',
            ]);

            $anneeForm = AnneeFormation::create($donneesValidees);

            return response()->json($anneeForm, 201);
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
     * Retourne une année de formation particulière
     *
     * @param  int  $idAnneeForm
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si l'année de formation a été trouvé
     *      - Code 404 : si l'année de formation n'a pas été trouvé
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function show($idAnneeForm)
    {
        try {
            $anneeForm = AnneeFormation::findOrFail($idAnneeForm);
            return response()->json($anneeForm, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucune année de formation trouvée'
            ], 404);
        }
    }


    /**
     * Modifie une année de formation particulière
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $idAnneeForm
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si l'année de formation a bien été modifiée
     *      - Code 404 : si l'année de formation n'a pas été trouvée
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function update(Request $request, $idAnneeForm)
    {
        try {
            $donneesValidees = $request->validate([
                'libelle' => 'required|string|max:10|unique:annee_formations,libelle,' . $idAnneeForm . ',idAnneeFormation',
            ]);

            $anneeForm = AnneeFormation::findOrFail($idAnneeForm);
            $anneeForm->update($donneesValidees);

            return response()->json($anneeForm, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucune année de formation trouvée'
            ], 404);
        }
    }

    /**
     * Supprime une année de formation particulière
     *
     * @param  int  $idAnneeForm
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si l'année de formation a bien été supprimée
     *      - Code 404 : si l'année de formation n'a pas été trouvée
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function destroy($idAnneeForm)
    {
        try {
            $anneeForm = AnneeFormation::findOrFail($idAnneeForm);
            $anneeForm->delete();

            return response()->json([
                'message' => 'Année de formation bien supprimée'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucune année de formation trouvée'
            ], 404);
        }
    }
}
