const API =
"https://script.google.com/macros/s/AKfycbwUc0fDv1S9YdEMmnslGakQYssQeJvgMPRSavN2VPLtr8GaM2EQ8d_hqT9RRtSNG-6c/exec";

const message = document.getElementById("message");
const photo = document.getElementById("photo");
const reader = document.getElementById("reader");

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

            if(client.statut==="ACTIF"){

                document.body.style.background="#008f39";

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

                photo.style.display="none";

                message.innerHTML=
                "<div style='font-size:50px'>❌</div>" +
                "<div style='font-size:38px;font-weight:bold'>ACCÈS REFUSÉ</div>";

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

        },10000);

    },

    function(errorMessage){

    }

).catch(function(err){

    message.innerHTML="Erreur caméra : "+err;

});
