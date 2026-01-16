<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\EtudiantAnneeformAnneeuniv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AlgorithmeController extends Controller
{
    /**
     * Execute the algorithm
     * 
     * @param int $idUPPA
     * @param int $idFicheDescriptive
     * @return string
     */
    public function run($idUPPA, $idFicheDescriptive)
    {
        $scriptPath = base_path(env('ALGO_AFFECTATION_URL'));

        $command = "php " . escapeshellarg($scriptPath) . " " . escapeshellarg($idUPPA) . " " . escapeshellarg($idFicheDescriptive);
        $output = shell_exec($command);
        return $output;
    }


    /**
     * Récupère tous les enseignants
     *
     * @return array
     */
    public function getTeachers(): array
    {
        $teachers = \App\Models\Personnel::where('roles', 'Enseignant')->get();

        return $teachers->map(function ($teacher, $index) {
            return [
                'id' => $teacher->idPersonnel, 
                'name' => $teacher->nom,
                'isTechnical' => (bool)$teacher->estTechnique,
                'weeklyRemainingMinutes' => 1200
            ];
        })->toArray();
    }


    /**
     * Récupère les étudiants d'une année de formation spécifique
     * et d'une année universitaire donnée
     *
     * @param int $idStudentFormationYear
     * @param int $idAcademicYear
     * @return array
     */
    public function getStudentsForFormationYear(int $idStudentFormationYear, int $idAcademicYear): array
    {

        // Récupérer les liens avec les étudiants de l'année de formation et universiatire passées
        $relations = EtudiantAnneeformAnneeuniv::where('idAnneeFormation', $idStudentFormationYear)
            ->where('idAnneeUniversitaire', $idAcademicYear)
            ->get();
        Log::info("EtudiantAnneeformAnneeuniv " . $relations);
        // Récupérer les profs référents des étudiants trouvés
        $referents = DB::table('table_personnel_etudiant_anneeuniv')
            ->where('idAnneeUniversitaire', $idAcademicYear)
            ->pluck('idPersonnel', 'idUPPA');
        Log::info("Profs référents " . $referents);


        // Récupérer les informations des étudiants trouvés
        $students = $relations->map(function ($rel) use ($referents) {
            $student = Etudiant::find($rel->idUPPA);

            return [
                'id' => (int) $student->idUPPA,
                'name' => $student->nom,
                'hasAccommodations' => (bool) $student->tierTemps,
                'referentTeacherId' => $referents[$student->idUPPA] ?? null,
                'tutorId' => $student->idTuteur
            ];
        })->toArray();

        return $students;
    }



    public function runPlanning(Request $request)
    {
        $data = json_decode($request->getContent(), true);

        $binaryPath = base_path(env('ALGO_PLANNING_URL'));

        $args = [
            $data['startMorningTime'],
            $data['endMorningTime'],
            $data['startAfternoonTime'],
            $data['endAfternoonTime'],
            $data['normalPresentationLength'],
            $data['accommodatedPresentationLength'],
            $data['inBetweenBreakLength'],
            $data['maxTeachersWeeklyWorkedTime'],
        ];

        $cmd = $binaryPath . ' ' . implode(' ', $args);

        Log::info("CMD ".$cmd);

        $stdinTeachers = $this->getTeachers();
        $idStudentFormationYear = $data['idStudentFormationYear'];
        $idCurrentUnivYear = $data['idCurrentUnivYear'];

        $stdinStudents = $this->getStudentsForFormationYear($idStudentFormationYear, $idCurrentUnivYear);
        $stdinRooms =
            array_map(
                fn($salle) => [
                    'id'  => $salle['nomSalle'],
                    'tag' => (string) $salle['nomSalle'],
                ],
                $data['sallesDispo']
            );


        $stdinContent = json_encode($stdinStudents) . "\n"
            . json_encode($stdinTeachers) . "\n"
            . json_encode($stdinRooms) . "\n";

        Log::info("stdinContent ".$stdinContent);

        $descriptorSpecs = [
            0 => ['pipe', 'r'], // stdin
            1 => ['pipe', 'w'], // stdout
            2 => ['pipe', 'w']  // stderr
        ];

        $process = proc_open($cmd, $descriptorSpecs, $pipes);

        if (!is_resource($process)) {
            exit(1);
        }

        // Write JSON input in stdin and close it
        fwrite($pipes[0], $stdinContent);
        fclose($pipes[0]);

        // Read stdout and stderr
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        $returnStatus = proc_close($process);

        Log::info($stdout);


        if ($returnStatus !== 0) {
            return response()->json([
                'status' => 'error . $returnStatus',
                'exit_code' => $stderr,
                'output' => $stdout,
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'output' => $stdout,
        ]);
    }
}
