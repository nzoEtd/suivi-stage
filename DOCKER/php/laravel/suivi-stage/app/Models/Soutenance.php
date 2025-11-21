<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soutenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'heureDebut',
        'heureFin',
        'nomSalle',
        'idPlanning',
        'idUPPA',
        'idLecteur'
    ];
    // Définit l'attribut de la clé primaire
    protected $primaryKey = 'idSoutenance';

    // Précise que la table ne contient pas de created_at et updated_at
    public $timestamps = false;

    // Relation N-1 avec Planning
    public function planning()
    {
        return $this->belongsTo(Planning::class);
    }

    // Relation N-1 avec Salle
    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    // Relation N-1 avec Etudiant
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

     // Relation N-1 avec Personnel
    public function personnel()
    {
        return $this->belongsTo(Personnel::class);
    }



}
