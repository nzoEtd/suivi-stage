<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personnel extends Model
{
    use HasFactory;
    // Définit les attributs pouvant être remplis
    protected $fillable = [
        'login',
        'roles',
        'nom',
        'prenom',
        'adresse',
        'ville',
        'codePostal',
        'telephone',
        'adresseMail',
        'longitudeAdresse',
        'latitudeAdresse',
        'quotaEtudiant',
        "estTechnique"
    ];
    // Définit l'attribut de la clé primaire
    protected $primaryKey = 'idPersonnel';
    public $timestamps = false;

    public $incrementing = true;
    protected $keyType = 'int';


    // Relation N-N avec DepartementIUT
    public function departementIUTs()
    {
        return $this->belongsToMany(DepartementIUT::class);
    }

    // Relation N-N avec Etudiant
    public function etudiants()
    {
        return $this->belongsToMany(Etudiant::class);
    }

    // Relation N-N avec Role
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    // Relation 1-N avec Soutenance
    public function soutenances()
    {
        return $this->hasMany(Soutenance::class);
    }
}
