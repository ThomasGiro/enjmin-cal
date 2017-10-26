/*-------------------
 |      GOOGLE      |
 |   CALENDAR API   |
 -------------------*/
// Quickstart code from https://developers.google.com/google-apps/calendar/quickstart/nodejs

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.error('Error loading client secret file: ' + err);
    return;
  }
  authorize(JSON.parse(content), syncEvents);
  setInterval(authorize, 21600000, JSON.parse(content), syncEvents);
});

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/* -------------------------------------------- */


/*-------------------
 |       SYNC       |
 |      AGENDA      |
 -------------------*/

const https = require("https");
const cheerio = require('cheerio'); // Fake jQuery
const config = require("./config.js");

function syncEvents(auth) {
    console.log("Sync started");

    var calendar = google.calendar('v3');

    clear(calendar, auth, function() {
        
        https.get('https://iscople.gescicca.net/Planning.aspx?uid=' + config.auth.uid + '&code_scolarite=' + config.auth.code, (res) => {

            let data = "";
            res.on('data', d => data += d);
          
            res.on('end', () => {
                console.log('Agenda get');
                console.log('Add events');
                const $ = cheerio.load(data);
                var i = 0;
                // Parcours les infos-bulles et extraits les evenements
                $('a.bulleAuditeur1, a.bulleAuditeur2, a.bulleEnseignant1').each(function(id) {
                    var event = $(this).text();
                    // Regex degeu :
                    var res =  /^\s*([A-Z0-9]{6}).*Date et horaire :  (\d\d)\/(\d\d)\/(\d\d\d\d) ?(\d\d:\d\d) - (\d\d:\d\d).*Salle : *(.*).*Cnam Nouvelle-Aquitaine$/g.exec(event);
                    
                    if(res)
                        setTimeout(createEvent, ++i * 150, calendar, auth, res);
                });
            });
    
        }).on('error', (e) => {
            console.error(e);
        });
    });
}

// Retient les evenements a supprimer, puis execute le callback puis supprime
function clear(calendar, auth, callback) {
    // Liste les evenements a supprimer

    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);

    calendar.events.list({
        auth: auth,
        calendarId: config.calendarId,
        timeMin: d.toISOString(),
        minResults: 250,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        if (err) {
          console.error('Clear error: ' + err);
          return;
        }

        callback();

        setTimeout(console.log, 20000, "Clearing old");
        // Delai pour limiter le nombre de requetes simultanés
        for (var i = 0; i < response.items.length; i++)
            setTimeout(deleteEvent, i * 125 + 20000, calendar, auth, response.items[i].id); // Supprime les anciens evenements
        setTimeout(console.log, response.items.length * 125 + 21000, "Done"); // Delai approximatif de fin
      });
}

function deleteEvent(calendar, auth, id) {
    calendar.events.delete({
        auth: auth,
        calendarId: config.calendarId,
        eventId: id,
    }, function(err) {
        if (err) { 
          //console.warn('The API returned an error: ' + err);
          deleteEvent(calendar, auth, id); // En cas d'erreur : reessayer
          return;
        }
        //console.log("Event deleted");
    });
}

function createEvent(calendar, auth, res) {

    var d = new Date();
    var t = new Date(res[4]+'-'+res[3]+'-'+res[2]+'T00:00');
    t.setDate(t.getDate() + 1);
    if(t < d) return;

    var cours = {
        title: "Erreur",
        color: 0
    }
    switch(res[1]) {
        case "RJMIN1":
            cours.title = "Réunion M1";
            cours.color = 8;
            break;
        case "US332D":
            cours.title = "Anglais";
            cours.color = 3;
            break;
        case "US332M":
            cours.title = "Prog";
            cours.color = 6;
            break;
        case "US335S":
            cours.title = "Bases de l'interaction";
            cours.color = 5;
            break;
        case "US332G":
            cours.title = "Conception visuel";
            cours.color = 4;
            break;
        case "US332F":
            cours.title = "Conception sonore";
            cours.color = 7;
            break;
        case "US335T":
            cours.title = "Ergonomie";
            cours.color = 10;
            break;
        case "US332K":
            cours.title = "Management";
            cours.color = 9;
            break;
        case "US335U":
            cours.title = "Atelier";
            cours.color = 2;
            break; 
    }

    var data = {
        'summary': cours.title + " - " + res[1],
        'location': res[7],
        'description': res[1],
        'start': {
            'dateTime': res[4]+'-'+res[3]+'-'+res[2]+'T'+res[5]+':00',
            'timeZone': 'Europe/Paris',
        },
        'end': {
            'dateTime': res[4]+'-'+res[3]+'-'+res[2]+'T'+res[6]+':00',
            'timeZone': 'Europe/Paris',
        },
        'reminders': {
            'useDefault': true
        },
        colorId: cours.color
    };

    calendar.events.insert({
        auth: auth,
        calendarId: config.calendarId,
        resource: data,
    }, function(err, event) {
        if (err) {
            //console.warn('The API returned an error: ' + err);
            createEvent(calendar, auth, res); // En cas d'erreur : reessayer
            return;
        }
        //console.log("Event created : " + res[1]);
    });
}