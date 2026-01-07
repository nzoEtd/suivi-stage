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

    public function runPlanning($startMorningTime, $endMorningTime, $startAfternoonTime, $endAfternoonTime, $normalPresentationLength, $accommodatedPresentationLength, $inBetweenBreakLength, $maxTeachersWeeklyWorkedTime)
    {
        $scriptPath = base_path(env('ALGO_PLANNING_URL'));

        $cmd = "$scriptPath $startMorningTime $endMorningTime $startAfternoonTime $endAfternoonTime $normalPresentationLength $accommodatedPresentationLength $inBetweenBreakLength $maxTeachersWeeklyWorkedTime";
        $output = [];
        // $code = null;
        $status = 0;
        exec($cmd . ' 2>&1', $output, /*$code*/$status);

        if ($status != 0)
        {
            foreach ($output as $line) { echo $line . "\n"; }
            echo "Error: " . $status . "\n";
            exit(1);
        }

        foreach ($output as $line) { echo $line . "\n"; }
        // return response()->json([
        //     'exit_code' => $code,
        //     'output' => $output,
        // ]);
    }
}
