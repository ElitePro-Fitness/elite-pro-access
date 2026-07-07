const API =
"https://script.google.com/macros/s/AKfycbwUc0fDv1S9YdEMmnslGakQYssQeJvgMPRSavN2VPLtr8GaM2EQ8d_hqT9RRtSNG-6c/exec";

const message = document.getElementById("message");
const photo = document.getElementById("photo");
const reader = document.getElementById("reader");
const successSound = document.getElementById("successSound");
const errorSound = document.getElementById("errorSound");let scannerBloque = false;

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

    async function(decodedText) {

        if(scannerBloque) return;

        scannerBloque = true;

        try{

            await html5QrCode.pause(true);

            message.innerHTML = "Vérification...";

            const reponse = await fetch(
                API + "?id=" + encodeURIComponent(decodedText),
                {
                    method:"GET",
                    cache:"no-store"
                }
            );

            const client = await reponse.json();
if(client.statut==="DEJA_UTILISE"){

    document.body.style.background="#b60000";

    photo.src = client.photo + "&t=" + Date.now();

    photo.style.display="block";

    message.innerHTML =
    "<div style='font-size:50px'>⛔</div>" +
    "<div style='font-size:36px;font-weight:bold'>ACCÈS DÉJÀ UTILISÉ</div><br>" +
    "<div style='font-size:28px'>" +
    client.nom + " " + client.prenom +
    "</div><br>" +
    "<div style='font-size:24px'>Dernière entrée :</div>" +
    "<div style='font-size:34px;font-weight:bold'>" +
    client.derniereHeure +
    "</div>";

}
else if(client.statut==="ACTIF"){
if(client.statut==="ACTIF"){

                document.body.style.background="#008f39";
successSound.currentTime = 0;

successSound.play().catch(function(e){
    console.log(e);
});
                photo.src = "";

                photo.style.display="none";

                photo.onload=function(){

                    photo.style.display="block";

                };

                photo.onerror=function(){

                    console.log("Impossible de charger la photo.");

                };

                photo.src = client.photo + "&t=" + Date.now();

                message.innerHTML=
                "<div style='font-size:50px'>✅</div>" +
                "<div style='font-size:38px;font-weight:bold'>ACCÈS AUTORISÉ</div><br>" +
                "<div style='font-size:30px'>" +
                client.nom + " " + client.prenom +
                "</div>";

            }

            else{

                document.body.style.background="#b60000";
errorSound.currentTime = 0;

errorSound.play().catch(function(e){
    console.log(e);
});
                photo.style.display="none";

                let dateExp = "";

if (client.expiration) {

    const d = new Date(client.expiration);

    dateExp =
        d.getDate().toString().padStart(2,"0") + "." +
        (d.getMonth()+1).toString().padStart(2,"0") + "." +
        d.getFullYear();

}

message.innerHTML =
"<div style='font-size:50px'>❌</div>" +
"<div style='font-size:38px;font-weight:bold'>ACCÈS REFUSÉ</div><br>" +
"<div style='font-size:26px'>" +
client.nom + " " + client.prenom +
"</div><br>" +
"<div style='font-size:22px'>Abonnement expiré le :</div>" +
"<div style='font-size:30px;font-weight:bold'>" +
dateExp +
"</div>";

            }

        }

        catch(e){

            document.body.style.background="#d98300";

            photo.style.display="none";

            message.innerHTML=
            "<b>Erreur</b><br><br>"+e;

        }

        setTimeout(async function(){

            document.body.style.background="#111";

            photo.style.display="none";

            photo.src="";

            message.innerHTML="Présentez votre QR Code";

            scannerBloque=false;

            await html5QrCode.resume();

        },8000);

    },

    function(errorMessage){

    }

).catch(function(err){

    message.innerHTML="Erreur caméra : "+err;

});
