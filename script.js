const API =
  "https://script.google.com/macros/s/AKfycbwUc0fDv1S9YdEMmnslGakQYssQeJvgMPRSavN2VPLtr8GaM2EQ8d_hqT9RRtSNG-6c/exec";

const message = document.getElementById("message");
const photo = document.getElementById("photo");

let scannerBloque = false;

const html5QrCode = new Html5Qrcode("reader");

message.innerHTML = "Démarrage de la caméra...";

html5QrCode.start(
  { facingMode: "environment" },
  {
    fps: 15,
    qrbox: {
      width: 260,
      height: 260
    }
  },
  async function (decodedText) {
    if (scannerBloque) {
      return;
    }

    scannerBloque = true;

    try {
      await html5QrCode.pause(true);

      message.innerHTML = "Vérification...";

      const reponse = await fetch(
        API + "?id=" + encodeURIComponent(decodedText),
        {
          method: "GET",
          cache: "no-store"
        }
      );
      const client = await reponse.json();

      showClientPhoto(client.photo);
      showScanResult(client);
    } catch (error) {
      photo.style.display = "none";
      document.body.style.background = "#d98b00";
      message.innerHTML = "<b>Erreur</b><br><br>" + error;
    }

    setTimeout(resetScanner, 10000);
  },
  function () {
  }
).catch(function (error) {
  message.innerHTML = "Erreur caméra : " + error;
});

function showClientPhoto(photoUrl) {
  photo.style.display = "none";
  photo.src = "";

  if (!photoUrl) {
    return;
  }

  photo.onload = function () {
    photo.style.display = "block";
  };

  photo.onerror = function () {
    photo.style.display = "none";
  };

  photo.src = photoUrl + "&t=" + Date.now();
}

function showScanResult(client) {
  if (client.statut === "ACTIF") {
    document.body.style.background = "#008f39";
    message.innerHTML =
      "<div style='font-size:55px'>✅</div>" +
      "<div style='font-size:38px;font-weight:bold'>ACCÈS AUTORISÉ</div><br>" +
      "<div style='font-size:30px'>" +
      escapeHtml(client.nom + " " + client.prenom) +
      "</div>";
    return;
  }

  if (client.statut === "BIENTOT_EXPIRE") {
    document.body.style.background = "#d98b00";
    message.innerHTML =
      "<div style='font-size:55px'>⚠️</div>" +
      "<div style='font-size:36px;font-weight:bold'>RENOUVELLEMENT BIENTÔT</div><br>" +
      "<div style='font-size:30px'>" +
      escapeHtml(client.nom + " " + client.prenom) +
      "</div><br>" +
      "<div style='font-size:24px'>" +
      getRenewalMessage(client.joursRestants) +
      "</div>";
    return;
  }

  if (client.statut === "DEJA_UTILISE") {
    document.body.style.background = "#b60000";
    message.innerHTML =
      "<div style='font-size:55px'>⛔</div>" +
      "<div style='font-size:36px;font-weight:bold'>ACCÈS DÉJÀ UTILISÉ</div><br>" +
      "<div style='font-size:30px'>" +
      escapeHtml(client.nom + " " + client.prenom) +
      "</div><br>" +
      "<div style='font-size:22px'>Dernière entrée</div>" +
      "<div style='font-size:34px;font-weight:bold'>" +
      escapeHtml(client.derniereHeure || "") +
      "</div>";
    return;
  }

  if (client.statut === "SALLE_NON_AUTORISEE") {
    document.body.style.background = "#b60000";
    message.innerHTML =
      "<div style='font-size:55px'>🚫</div>" +
      "<div style='font-size:36px;font-weight:bold'>SALLE NON AUTORISÉE</div><br>" +
      "<div style='font-size:30px'>" +
      escapeHtml(client.nom + " " + client.prenom) +
      "</div>";
    return;
  }

  document.body.style.background = "#b60000";
  message.innerHTML =
    "<div style='font-size:55px'>❌</div>" +
    "<div style='font-size:36px;font-weight:bold'>ACCÈS REFUSÉ</div><br>" +
    "<div style='font-size:30px'>" +
    escapeHtml(client.nom + " " + client.prenom) +
    "</div><br>" +
    "<div style='font-size:22px'>Abonnement expiré le</div>" +
    "<div style='font-size:34px;font-weight:bold'>" +
    escapeHtml(formatExpiration(client.expiration)) +
    "</div>";
}

function getRenewalMessage(days) {
  const remainingDays = Number(days);

  if (remainingDays === 0) {
    return "L'abonnement se termine aujourd’hui — prévenir le client.";
  }

  return "Il reste " + remainingDays +
    " jour" + (remainingDays > 1 ? "s" : "") +
    " — prévenir le client.";
}

function formatExpiration(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.getDate().toString().padStart(2, "0") + "." +
    (date.getMonth() + 1).toString().padStart(2, "0") + "." +
    date.getFullYear();
}

function resetScanner() {
  document.body.style.background = "#111";
  photo.style.display = "none";
  photo.src = "";
  message.innerHTML = "Présentez votre QR Code";
  scannerBloque = false;

  html5QrCode.resume().catch(function () {
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
