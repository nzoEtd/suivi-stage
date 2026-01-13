<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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


    public function runPlanning($startMorningTime, $endMorningHour, $startAfternoonTime, $endAfternoonTime, $normalPresentationLength, $accommodatedPresentationLength, $inBetweenBreakLength, $maxTeachersWeeklyWorkedTime)
    {

        $binaryPath = base_path(env('ALGO_PLANNING_URL'));

        $endMorningTime = $endMorningHour * 60 + 30;
        $accommodatedPresentationLength = $normalPresentationLength + 20;

        $jsonDirPath = "/var/www/html/suivi-stage/json";


        $args = [
            $startMorningTime,
            $endMorningTime,
            $startAfternoonTime,
            $endAfternoonTime,
            $normalPresentationLength,
            $accommodatedPresentationLength,
            $inBetweenBreakLength,
            $maxTeachersWeeklyWorkedTime,
            $jsonDirPath
        ];

        $cmd = $binaryPath . " " . implode(" ", $args);

        exec($cmd, $output, $status);


        if ($status !== 0) {
            return response()->json([
                'status' => 'error',
                'exit_code' => $status,
                'output' => $output,
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'output' => $output,
        ]);
    }
}
