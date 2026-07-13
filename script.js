const SALLE_SCANNER = "TXADA";
const COLONNE_ACCES_SALLES = 11;

function doGet(e) {
  if (!e || !e.parameter || !e.parameter.id) {
    return HtmlService.createHtmlOutputFromFile("index");
  }

  return ContentService
    .createTextOutput(getClient(e.parameter.id))
    .setMimeType(ContentService.MimeType.JSON);
}

function getClient(id) {
  var feuille = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Cliente");
  var donnees = feuille.getDataRange().getValues();

  for (var i = 1; i < donnees.length; i++) {
    if (String(donnees[i][0]) === String(id)) {
      return getClientResponse(donnees[i]);
    }
  }

  return JSON.stringify({
    nom: "Client",
    prenom: "introuvable",
    photo: "",
    statut: ""
  });
}

function getClientResponse(client) {
  var id = String(client[0]);
  var statutClient = String(client[6] || "").toUpperCase();
  var expiration = new Date(client[7]);
  var employe = id.startsWith("E");
  var expire = isSubscriptionExpired(expiration, employe);
  var abonnementActif = statutClient === "ACTIF" && !expire;
  var accesSalles = getAccessSalles(client, employe);
  var salleAutorisee = isSalleAutorisee(accesSalles);
  var actif = abonnementActif && salleAutorisee;
  var entree = getEntryStatus(id, actif);

  if (actif && entree.autoriser) {
    addEntry(client);
  }

  return JSON.stringify({
    nom: client[1],
    prenom: client[2],
    photo: getPhotoUrl(client),
    statut: getAccessStatus(
      abonnementActif,
      salleAutorisee,
      entree.autoriser
    ),
    expiration: client[7],
    derniereHeure: entree.derniereHeure,
    salle: SALLE_SCANNER
  });
}

function getAccessSalles(client, employe) {
  if (employe) {
    return "AMBAS";
  }

  var acces = String(
    client[COLONNE_ACCES_SALLES - 1] || ""
  ).toUpperCase();

  if (acces === "BAIXO" || acces === "AMBAS") {
    return acces;
  }

  return "TXADA";
}

function isSalleAutorisee(accesSalles) {
  return accesSalles === "AMBAS" ||
    accesSalles === SALLE_SCANNER;
}

function isSubscriptionExpired(expiration, employe) {
  if (employe) {
    return false;
  }

  if (isNaN(expiration.getTime())) {
    return true;
  }

  expiration.setHours(23, 59, 59, 999);

  return expiration.getTime() < new Date().getTime();
}

function getEntryStatus(id, actif) {
  var resultat = { autoriser: actif, derniereHeure: "" };

  if (!actif || id.startsWith("E")) {
    return resultat;
  }

  var entradas = getEntradasSheet();
  var derniereLigne = entradas.getLastRow();

  if (derniereLigne <= 1) {
    return resultat;
  }

  var entrees = entradas
    .getRange(2, 1, derniereLigne - 1, 4)
    .getValues();

  for (var i = entrees.length - 1; i >= 0; i--) {
    if (String(entrees[i][1]) === id) {
      var derniereEntree = new Date(entrees[i][0]);
      var differenceMinutes =
        (new Date() - derniereEntree) / 1000 / 60;

      if (differenceMinutes < 540) {
        resultat.autoriser = false;
        resultat.derniereHeure = formatTime(derniereEntree);
      }

      break;
    }
  }

  return resultat;
}

function getEntradasSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  return ss.getSheetByName("Entradas") ||
    ss.getSheetByName("ENTRADAS");
}

function addEntry(client) {
  getEntradasSheet().appendRow([
    new Date(),
    client[0],
    client[1] + " " + client[2],
    client[6]
  ]);
}

function getAccessStatus(abonnementActif, salleAutorisee, autoriser) {
  if (!abonnementActif) {
    return "EXPIRE";
  }

  if (!salleAutorisee) {
    return "SALLE_NON_AUTORISEE";
  }

  return autoriser ? "ACTIF" : "DEJA_UTILISE";
}

function getPhotoUrl(client) {
  var photoUrl = String(client[5] || "");

  if (photoUrl.indexOf("http") === 0) {
    return photoUrl;
  }

  var fileId = photoUrl || String(client[4] || "");

  if (!fileId) {
    return "";
  }

  return "https://drive.google.com/thumbnail?id=" +
    fileId + "&sz=w500";
}

function formatTime(date) {
  return date.getHours().toString().padStart(2, "0") +
    ":" + date.getMinutes().toString().padStart(2, "0");
}

function traiterPaiements() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var clients = ss.getSheetByName("Cliente");
  var paiements = ss.getSheetByName("Pagamento");
  var dataPaiements = paiements.getDataRange().getValues();
  var dataClients = clients.getDataRange().getValues();

  for (var i = 1; i < dataPaiements.length; i++) {
    if (dataPaiements[i][7] === "OK") {
      continue;
    }

    var id = dataPaiements[i][1];
    var mois = Number(dataPaiements[i][4]);

    for (var j = 1; j < dataClients.length; j++) {
      if (dataClients[j][0] === id) {
        var aujourdHui = new Date();
        var dateFin = new Date(dataClients[j][7]);
        var nouvelleDate = dateFin >= aujourdHui
          ? new Date(dateFin)
          : new Date(aujourdHui);

        nouvelleDate.setMonth(nouvelleDate.getMonth() + mois);
        clients.getRange(j + 1, 8).setValue(nouvelleDate);
        paiements.getRange(i + 1, 8).setValue("OK");
        break;
      }
    }
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Elite Pro")
    .addItem("Traiter les paiements", "traiterPaiements")
    .addToUi();
}
