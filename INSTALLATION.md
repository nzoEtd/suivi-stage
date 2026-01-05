
## Table des matières

- [Guide d'installation](#guide-d-installation-de-l-environnement-de-developpement)
  - [Prérequis](#prérequis)
  - [Démarrage rapide](#démarrage-rapide)
  - [Informations importantes](#informations-importantes)
  - [Mise en place de l'environnement d'éxécution d'Angular](#mise-en-place-de-l-environnement-d-execution-d-angular)
  - [Mise en place de l'environnement d'éxécution de Laravel](#mise-en-place-de-l-environnement-d-execution-de-laravel)
- [Sauvegarde du projet](#sauvegarde-du-projet)

---
## Guide d'installation de l'environnement de développement

> [!TIP]
> Section liée à l'installation de l'environnement de développement identique à celle des développeurs à l'origine du projet.  

### <ins>Prérequis</ins> :

> Afin d'obtenir le même environnement, il est nécessaire d'avoir GIT, DOCKER et Docker Desktop installés sur sa machine. Selon les OS (Windows, Mac ou Linux), l'installation des outils peut différer mais ne sera pas traitée ici.

[Git](https://git-scm.com/downloads)  
[Docker](https://docs.docker.com/get-started/get-docker/)  
[Docker Desktop](https://www.docker.com/products/docker-desktop/)  

### <ins>Démarrage rapide</ins> :

Pour télécharger le projet en local, il faut cloner le projet. 

> Se placer dans le dossier où l'on veut télécharger le projet

```bash
git clone https://github.com/GauthierGmx/suivi-stage
cd suivi-stage/
```

Une fois dans le dossier, il faut lancer Docker et les conteneurs du projet depuis un terminal. 

> PS : Ne pas oublier de se placer dans le dossier du projet

```bash
docker compose up -d
```


### <ins>Informations importantes</ins>

> [!WARNING]
> Nous avons procédé de manière simple. Pour éviter tout conflit avec la branche de travail principale, il est impossible de pousser directement du code dessus. Il est donc nécessaire de passer par des branches. 

> Création d'une branche (être placée sur la main)

```bash
git branch nomBranche
```

> Se déplacer dans cette dernière

```bash
git switch nomBranche
```

C'est bon, vous pouvez développer ! 

### <ins>Mise en place de l'environnement d'éxécution d'Angular</ins> : 

> [!CAUTION]
> Section en cours de construction

### <ins>Mise en place de l'environnement d'éxécution de Laravel</ins> :
Tout d'abord, vous devez configurer dans le fichier .env (qui se situe dans le dossier laravel) pour pouvoir créer la connexion à votre base de données.

>[!WARNING]
>Les valeurs pour le nom de la base de données, de l'utilisateur et du mot de passe sont donnée à valeur d'exemple

```bash
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=nom_bdd
DB_USERNAME=username
DB_PASSWORD=password
```

Voud devez également lui fournir les informations relatives au cas pour l'authentification :

```bash
UPPA_CAS_HOSTNAME=
UPPA_CAS_PORT=
UPPA_CAS_URI=/cas
UPPA_CAS_BASENAME=http://localhost:8000/api
```

Ensuite, lancez le docker-compose et placez vous DANS le container de Laravel afin de pouvoir y exécuter des commandes.
Vous pouvez le faire directement depuis Docker Desktop, ou par ligne de commande avec "docker exec"

Une fois connecté au container, placez vous dans le dossier "suivi-stage"
```bash
cd suivi-stage
```

Ensuite, installez les dépendances pour le projet Laravel
>[!WARNING]
>Vérifiez bien que les dépendances "apereo/phpcas" et "maatwebsite/excel" sont installées : ces dépendances sont utilisées respectivement pour la connexion via le portail CAS de l'UPPA et pour la génération de fichier Excel sur l'affectation d'un enseignant à un étudiant 
```bash
composer install
```

Par la suite, dans le même dossier, générez une clé artisan
>[!NOTE] La clé s'ajoutera en tant que valeur de la variable APP_KEY dans le fichier .env
```bash
php artisan key:generate
```

Après cela, il faudra créer les tables de la base de données et les données qui vont avec.
>[!TIP]
>Les données sont modifiables dans les fichiers Seeder
```bash
php artisan migrate:fresh --seed
```

Et enfin, pour permettre aux appels API de fonctionner, il faut éxécuter la commande suivante :
```bash
chown -R www-data:www-data *
```

Votre environnement de backend est prêt !

---
## Sauvegarde du projet

Pour le versionning du code, il est donc utile d'utiliser les commandes GIT

Sauvegarde du projet (sur le dossier courant): 

```bash
git add .
git commit -m "MESSAGE"
```
> [!WARNING]
> Si vous n'avez pas lié votre branche avec votre dépôt distant, il est nécessaire de le faire

```bash
git branch --set-upstream nomBranche origin/nomBranche
```

Pour pousser le code sur GITHUB : 

```bash
git push
```
