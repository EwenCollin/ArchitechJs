# ArchitechJs
Architecture tool to make 3D buildings made by Ewen Collin. Its goal is to quickly prototype buildings.

Inspired by NEM (Nested Explorative Maps by Pauline Olivier, Renaud Chabrier, Damien Rohmer, Eric de Thoisy, Marie-Paule Cani. Nested Explorative Maps: A new 3D canvas for conceptual design in architecture. Computers and Graphics, Elsevier, 2019, Special Section on SMI 2019, pp.203-213. ff10.1016/j.cag.2019.05.027ff. ffhal-02158131).

## How to use

 - clone this repo locally
 - run http-server
 - go to localhost:8080 on your browser

### To create forms

 - use Z (azerty keyboard) or W (qwerty keyboard) to create 3D form (keep pressed to change size)
 - use A (azerty keyboard) or Q (qwerty keyboard) to draw (3D lines)

### To select multiple meshes

 - use S to select or deselect objects (rotation and scale transformations are relative to the whole selection)
 - use C to copy selection
 - use V to paste copied selection at same position it was copied

## Library used in this web app

 - ThreeJs r124
 - THREE-CSGMesh (TS version)

The whole code added is in the /js folder (all the logic of the 3D editor). It is written in several files and classes to be more human readable and upgradable.

## Screeshots
![House](/screenshots/house.png?raw=true "House")
![Street](/screenshots/facades.png?raw=true "Street")
![Balcony](/screenshots/balcony.png?raw=true "Balcony")


