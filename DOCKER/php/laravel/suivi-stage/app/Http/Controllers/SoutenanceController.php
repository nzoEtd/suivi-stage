<?php

namespace App\Http\Controllers;

use App\Models\Soutenance;
use Illuminate\Http\Request;

class SoutenanceController extends Controller
{
    /**
     * Retourne toutes les soutenances
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $fields = explode(',', $request->query('fields', '*'));
        $allowedFields = ['idSoutenance','date','heureDebut','heureFin','nomSalle','idPlanning'];
        $fields = array_intersect($fields, $allowedFields);

        $query = Soutenance::query();

        $soutenances = $query->select(empty($fields) ? '*' : $fields)->get();

        return response()->json($soutenances, 200);
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
     * Créer une nouvelle soutenance
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :+++
     *      - Code 201 : si la soutenance a bien été créée
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function store(Request $request)
    {
        try {
            $donneesValidees = $request->validate([
                'date' => 'required|date',
                'heureDebut' => 'required|date_format:H:i:s',
                'heureFin' => 'required|date_format:H:i:s|after:heureDebut',
                'nomSalle' => 'required|integer',
                'idPlanning' => 'required|integer',
                'idUPPA' => 'required|integer',
                'idPersonnel' => 'required|integer',
            ]);

            $soutenance = Soutenance::create($donneesValidees);

            return response()->json($soutenance, 201);

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
     * Retourne une soutenance particulière
     *
     * @param  int  $idSoutenance
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la soutenance a été trouvée
     *      - Code 404 : si la soutenance n'a pas été trouvée
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function show($idSoutenance)
    {
        try {
            $soutenance = Soutenance::findOrFail($idSoutenance);
            return response()->json($soutenance, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Soutenance non trouvée'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur s\'est produite','exception'=>$e->getMessage()], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Soutenance  $soutenance
     * @return \Illuminate\Http\Response
     */
    public function edit(Soutenance $soutenance)
    {
        //
    }

    /**
     * Modifie une soutenance particulière
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $idSoutenance
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la soutenance a bien été modifiée
     *      - Code 404 : si la soutenance n'a pas été trouvée
     *      - Code 422 : s'il y a eu une erreur de validation des données
     *      - Code 500 : s'il y a eu une erreur
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function update(Request $request, $idSoutenance)
    {
        try {
            $donneesValidees = $request->validate([
                'date' => 'required|date',
                'heureDebut' => 'required|date_format:H:i:s',
                'heureFin' => 'required|date_format:H:i:s|after:heureDebut',
                'nomSalle' => 'required|integer',
                'idPlanning' => 'required|integer',
                'idUPPA' => 'required|integer',
                'idPersonnel' => 'required|integer',
            ]);

            $soutenance = Soutenance::findOrFail($idSoutenance);
            $soutenance->update($donneesValidees);

            return response()->json($soutenance, 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Erreur de validation','erreurs'=>$e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Soutenance non trouvée'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur s\'est produite','exception'=>$e->getMessage()], 500);
        }
    }

    /**
     * Supprime une soutenance particulière
     *
     * @param  int  $idSoutenance
     * @return \Illuminate\Http\Response
     * Code HTTP retourné :
     *      - Code 200 : si la soutenance a bien été supprimée
     *      - Code 404 : si la soutenance n'a pas été trouvée
     *      - Code 500 : s'il y a une erreur
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \Exception
     */
    public function destroy($idSoutenance)
    {
         try {
            $soutenance = Soutenance::findOrFail($idSoutenance);
            $soutenance->delete();
            return response()->json(['message'=>'Soutenance supprimée'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message'=>'Soutenance non trouvée'], 404);
        } catch (\Exception $e) {
            return response()->json(['message'=>'Une erreur s\'est produite','exception'=>$e->getMessage()], 500);
        }
    }
}
