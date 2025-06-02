# CommunautoStats
 Informations en direct des véhicules de la flotte Flex à Montréal


## Exécuter:
  - npm install
  - node main.mjs
**Note: application testée sur Windows

## Fonctionnalités:
- Prend les données des véhicules FLEX de la requête en json et convertit le tout en fichier Excel.
- Chaque prise de donnée crée une feuille sur le fichier (/data/FLEXs.xlsx)
- Arrêter le code pour avoir qu'un seul échantillon instantané (voir console: "données inscrites!"), sinon ajuster le délai auquel prendre les données (default=15min).
- Le fichier vehicles.json est toujours la dernière prise de données.

## Crédits:
- Projet inspiré de: https://github.com/evert/communauto-car-notify
- Communauto: https://montreal.communauto.com/?city=montreal
