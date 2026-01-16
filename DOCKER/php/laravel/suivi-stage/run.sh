#!/bin/bash

if [ -f "/var/www/html/suivi-stage/AlgorithmePlanning" ]; then
    /var/www/html/suivi-stage/AlgorithmePlanning "$@"
else
    echo "File AlgorithmePlanning does not exist"
fi