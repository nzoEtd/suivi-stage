<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EtudiantAnneeformAnneeuniv extends Model
{
    protected $table = 'table_etudiant_anneeform_anneeuniv';

    public $incrementing = false;
    protected $primaryKey = null;
    public $timestamps = false;

    protected $fillable = [
        'idUPPA',
        'idAnneeFormation',
        'idAnneeUniversitaire'
    ];


    // Relation 1-N avec Etudiant
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class, 'idUPPA', 'idUPPA');
    }

    // Relation 1-N avec AnneeFormation
    public function anneeFormation()
    {
        return $this->belongsTo(AnneeFormation::class, 'idAnneeFormation', 'idAnneeFormation');
    }

    // Relation 1-N avec AnneeUniversitaire
    public function anneeUniversitaire()
    {
        return $this->belongsTo(AnneeUniversitaire::class, 'idAnneeUniversitaire', 'idAnneeUniversitaire');
    }
}
