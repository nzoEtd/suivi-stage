<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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


    public function generateTeachers(int $count = 15): array
    {
        $teachers = [];
        for ($i = 0; $i < $count; $i++) {
            $name = sprintf("Teacher_%02d", $i);
            $teachers[] = [
                "id" => $i,
                "name" => $name,
                "isTechnical" => (mt_rand(0, 1) === 1),
                "weeklyRemainingMinutes" => 1200
            ];
        }
        return $teachers;
    }

    public function generateStudents(int $count = 60, int $teacherCount = 15): array
    {
        $students = [];
        for ($i = 0; $i < $count; $i++) {
            $name = sprintf("Student_%02d", $i);
            $students[] = [
                "id" => $i,
                "name" => $name,
                "hasAccommodations" => (mt_rand(1, 4) === 1),
                "referentTeacherId" => mt_rand(0, max(0, $teacherCount - 1)),
                "tutorId" => $i
            ];
        }
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

        Log::info($cmd);

        $stdinTeachers = $this->generateTeachers();
        $stdinStudents = $this->generateStudents(60, count($stdinTeachers));
        $stdinRooms =
            array_map(
                fn($salle) => [
                    'id'  => $salle['nomSalle'],
                    'tag' =>(string) $salle['nomSalle'],
                ],
                $data['sallesDispo']
            );


        $stdinContent = json_encode($stdinStudents) . "\n"
            . json_encode($stdinTeachers) . "\n"
            . json_encode($stdinRooms) . "\n";

        Log::info($stdinContent);

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
