<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    use HasFactory;

     // Définit les attributs pouvant être remplis
    protected $fillable = [
        'nomSalle',
        'estDisponible'
    ];

    // Définit l'attribut de la clé primaire
    protected $primaryKey = 'nomSalle';

    // Indique que la clé primaire n'est pas un entier auto-incrémenté
    public $incrementing = false;

    // Précise que la table ne contient pas de created_at et updated_at
    public $timestamps = false;

    // Relation N-N avec Planning
    public function plannings() {
    return $this->belongsToMany(Planning::class, 'table_planning_salle', 'nomSalle', 'idPlanning');
}

    // Relation 1-N avec Soutenance
    public function soutenances() {
    return $this->hasMany(Soutenance::class);
}
}
