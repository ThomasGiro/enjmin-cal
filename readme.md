# ENJMIN-Calendar
#### Ou comment se debarasser du site du CNAM

Necesite Node.js

### Installation :

Installez les packages necessaire : 
```
npm install
```

Suivre l'étape 1 du quickstart de l'API de Google Calendar enfin d'avoir dans le repertoire le fichier `client_secret.json`:  
https://developers.google.com/google-apps/calendar/quickstart/nodejs?hl=Fr#step_1_turn_on_the_api_name

Copiez le fichier `default-config.js`, renommez le `config.js` et remplacez les variables avec l'identifiant unique et le code de scolarité utilisez sur l'ENT du CNAM pour avoir le planning.

Creez egalement un Calendrier sur votre compte Google et mettez son identifiants dans le fichier de configuration.

Enfin executez le programme : 
```
node index.js
```