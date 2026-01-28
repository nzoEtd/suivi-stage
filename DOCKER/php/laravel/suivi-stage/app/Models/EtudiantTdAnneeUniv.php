<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtudiantTdAnneeUniv extends Model
{
    use HasFactory;

    protected $table = 'table_etudiant_td_anneeuniv';

    // Pas d'auto-incrément car clé primaire composite
    public $incrementing = false;

    protected $primaryKey = ['idUPPA', 'idTD', 'idAnneeUniversitaire'];

    public $timestamps = false;

    protected $fillable = [
        'idUPPA',
        'idTD',
        'idAnneeUniversitaire',
    ];


    // Relation 1-N avec Etudiant
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'idUPPA', 'idUPPA');
    }

    // Relation 1-N avec TD
    public function td()
    {
        return $this->belongsTo(TD::class, 'idTD', 'idTD');
    }

    // Relation 1-N avec AnneeUniversitaire
    public function anneeUniversitaire()
    {
        return $this->belongsTo(AnneeUniversitaire::class, 'idAnneeUniversitaire', 'idAnneeUniversitaire');
    }
}
