<?php

namespace App\Http\Controllers;

use App\Models\Planning;
use Illuminate\Http\Request;

class PlanningController extends Controller
{
    /**
     * Retourne tous les plannings
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fields = explode(',', $request->query('fields', '*'));
        $allowedFields = [
            'id',
            'nom',
            'dateDebut',
            'dateFin',
            'heureDebutMatin',
            'heureFinMatin',
            'heureDebutAprem',
            'heureFinAprem',
            'dureeSoutenance',
            'idAnneeFormation'
        ];
        $fields = array_intersect($fields, $allowedFields);

        $query = Planning::query();

        $plannings = $query->select(empty($fields) ? '*' : $fields)->get();

        return response()->json($plannings, 200);
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
     * Créer un nouveau planning
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 201 : si le planning a bien été créé
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function store(Request $request)
    {
        try {
            $donneesValidees = $request->validate([
                'nom' => 'required|string|max:50',
                'dateDebut' => 'required|date',
                'dateFin' => 'required|date|after_or_equal:dateDebut',
                'heureDebutMatin' => 'required|date_format:H:i:s',
                'heureFinMatin' => 'required|date_format:H:i:s|after:heureDebutMatin',
                'heureDebutAprem' => 'required|date_format:H:i:s',
                'heureFinAprem' => 'required|date_format:H:i:s|after:heureDebutAprem',
                'dureeSoutenance' => 'required|integer',
                'idAnneeFormation' => 'required|integer'
            ]);

            $planning = Planning::create($donneesValidees);

            return response()->json($planning, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
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
     * Retourne un planning particulier
     *
     * @param  int  $idPlanning
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le planning a été trouvé
     *      - Code 404 : si le planning n'a pas été trouvé
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function show($idPlanning)
    {
        try {
            $planning = Planning::findOrFail($idPlanning);
            return response()->json($planning, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Planning non trouvé'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Planning  $planning
     * @return \Illuminate\Http\Response
     */
    public function edit(Planning $planning)
    {
        //
    }


    /**
     * Modifie un planning particulier
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $idPlanning
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si le planning a bien été modifié
     *      - Code 404 : si le planning n'a pas été trouvé
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function update(Request $request, $idPlanning)
    {
        try {
            $donneesValidees = $request->validate([
                'nom' => 'required|string|max:50',
                'dateDebut' => 'required|date',
                'dateFin' => 'required|date|after_or_equal:dateDebut',
                'heureDebutMatin' => 'required|date_format:H:i:s',
                'heureFinMatin' => 'required|date_format:H:i:s|after:heureDebutMatin',
                'heureDebutAprem' => 'required|date_format:H:i:s',
                'heureFinAprem' => 'required|date_format:H:i:s|after:heureDebutAprem',
                'dureeSoutenance' => 'required|integer',
                'idAnneeFormation' => 'required|integer'
            ]);

            $planning = Planning::findOrFail($idPlanning);
            $planning->update($donneesValidees);

            return response()->json($planning, 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'erreurs' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Planning non trouvé'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'exception' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime un planning particulier
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
    public function destroy($idPlanning)
    {
        try {
            $planning = Planning::findOrFail($idPlanning);
            $planning->delete();

            return response()->json([
                'message' => 'Planning supprimé'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Planning non trouvé'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur s\'est produite',
                'exception' => $e->getMessage()
            ], 500);
        }
    }
}
