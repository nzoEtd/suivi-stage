<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planning extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'dateDebut',
        'dateFin',
        'heureDebutMatin',
        'heureFinMatin',
        'heureDebutAprem',
        'heureFinAprem',
        'dureeSoutenance',
        'idAnneeFormation',
        'idAnneeUniversitaire'
    ];

     // Définit l'attribut de la clé primaire
    protected $primaryKey = 'idPlanning';

    // Précise que la table ne contient pas de created_at et updated_at
    public $timestamps = false;


    // Relation 1-N avec AnneeFormation
    public function anneeFormation()
    {
        return $this->belongsTo(AnneeFormation::class);
    }

     // Relation 1-N avec AnneeUniversiataire
    public function anneeUniversitaire()
    {
        return $this->belongsTo(AnneeUniversitaire::class);
    }


    // Relation N-N avec Salle
    public function salles()
    {
        return $this->belongsToMany(Salle::class, 'table_planning_salle', 'idPlanning', 'nomSalle');
    }

    // Relation 1-N avec Soutenance
    public function soutenances()
    {
        return $this->hasMany(Soutenance::class, 'idSoutenance');
    }
}
