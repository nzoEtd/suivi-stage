<?php

namespace App\Http\Controllers;

use App\Models\EtudiantAnneeformAnneeuniv;
use Illuminate\Http\Request;

class EtudiantAnneeformAnneeunivController extends Controller
{
    /**
     * Retourne toutes les relations étudiant / année de formation / année universitaire
     *
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la récupération s'est bien passée
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Exception
     */
    public function index()
    {
        try {
            $relations = EtudiantAnneeformAnneeuniv::all();
            return response()->json($relations, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite lors de la récupération des relations',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle relation étudiant / année de formation / année universitaire
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 201 : si la relation a bien été créée
     *      - Code 409 : si la relation existe déjà
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function store(Request $request)
    {
        try {
            $donneesValidees = $request->validate([
                'idUPPA' => 'bail|required|string|exists:etudiants,idUPPA',
                'idAnneeFormation' => 'bail|required|integer|exists:annee_formations,idAnneeFormation',
                'idAnneeUniversitaire' => 'bail|required|integer|exists:annee_universitaires,idAnneeUniversitaire',
            ]);

            // Vérifie si la relation existe déjà 
            $relationExiste = EtudiantAnneeformAnneeuniv::where($donneesValidees)->exists();

            if ($relationExiste) {
                return response()->json([
                    'message' => 'Cette relation existe déjà'
                ], 409);
            }

            $relation = EtudiantAnneeformAnneeuniv::create($donneesValidees);

            return response()->json($relation, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation dans les données',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite lors de la création de la relation',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retourne les relations selon des critères de filtrage
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la récupération s'est bien passée
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Exception
     */
    public function filter(Request $request)
    {
        try {
            $query = EtudiantAnneeformAnneeuniv::query();

            if ($request->filled('idUPPA')) {
                $query->where('idUPPA', $request->idUPPA);
            }

            if ($request->filled('idAnneeFormation')) {
                $query->where('idAnneeFormation', $request->idAnneeFormation);
            }

            if ($request->filled('idAnneeUniversitaire')) {
                $query->where('idAnneeUniversitaire', $request->idAnneeUniversitaire);
            }

            return response()->json($query->get(), 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite lors du filtrage des relations',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime une relation étudiant / année de formation / année universitaire
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la relation a bien été supprimée
     *      - Code 404 : si la relation n'a pas été trouvée
     *      - Code 422 : s'il y a eu une erreur de validation
     *      - Code 500 : s'il y a eu une erreur autre
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function destroy(Request $request)
    {
        try {
            $donneesValidees = $request->validate([
                'idUPPA' => 'bail|required|string',
                'idAnneeFormation' => 'bail|required|integer',
                'idAnneeUniversitaire' => 'bail|required|integer',
            ]);

            $deleted = EtudiantAnneeformAnneeuniv::where($donneesValidees)->delete();

            if ($deleted === 0) {
                return response()->json([
                    'message' => 'Aucune relation trouvée'
                ], 404);
            }

            return response()->json([
                'message' => 'La relation a bien été supprimée'
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation dans les données',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite lors de la suppression de la relation',
                'exception' => $e->getMessage()
            ], 500);
        }
    }
}
