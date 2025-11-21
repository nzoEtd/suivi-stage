<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    /**
     * Retourne toutes les salles
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Récupère les champs demandés dans la requête (ou "*" par défaut)
        $fields = explode(',', $request->query('fields', '*'));

        // Vérifie si les champs demandés existent dans la table
        $allowedFields = ['nomSalle', 'estDisponible'];
        $fields = array_intersect($fields, $allowedFields);

        $query = Salle::query();

        // Si aucun champ valide n'est fourni, on récupère tout par défaut
        $salles = $query->select(empty($fields) ? '*' : $fields)->get();

        return response()->json($salles, 200);
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
     * Créer une nouvelle salle
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 201 : si la salle a bien été créée
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function store(Request $request)
    {
        try {
            $donneesValidees = $request->validate([
                'nomSalle' => 'bail|required|integer|unique:salles,nomSalle',
                'estDisponible' => 'bail|nullable|boolean',
            ]);

            $uneSalle = Salle::create([
                'nomSalle' => $donneesValidees['nomSalle'],
                'estDisponible' => $donneesValidees['estDisponible'] ?? true,
            ]);

            return response()->json($uneSalle, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation dans les données',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retourne une salle particulière
     *
     * @param  int  $nomSalle
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la salle a été trouvée
     *      - Code 404 : si la salle n'a pas été trouvée
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function show($nomSalle)
    {
        try {
            $salle = Salle::findOrFail($nomSalle);
            return response()->json($salle, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucune salle trouvée'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Salle  $salle
     * @return \Illuminate\Http\Response
     */
    public function edit(salle $salle)
    {
        //
    }


    /**
     * Modifie une salle particulière
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $nomSalle
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la salle a bien été modifiée
     *      - Code 404 : si la salle n'a pas été trouvée
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function update(Request $request, $nomSalle)
    {
        try {
            $donneesValidees = $request->validate([
                'estDisponible' => 'required|boolean'
            ]);

            $salle = Salle::findOrFail($nomSalle);
            $salle->update($donneesValidees);

            return response()->json($salle, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation des données',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucune salle trouvée'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Supprime une salle particulière
     *
     * @param  int  $nomSalle
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la salle a bien été supprimée
     *      - Code 404 : si la salle n'a pas été trouvée
     *      - Code 500 : s'il y a une erreur
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function destroy($nomSalle)
    {
        try {
            $salle = Salle::findOrFail($nomSalle);
            $salle->delete();

            return response()->json([
                'message' => 'La salle a bien été supprimée'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aucune salle trouvée'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite :',
                'exception' => $e->getMessage()
            ], 500);
        }
    }
}
