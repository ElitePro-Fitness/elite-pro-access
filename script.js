const API =
"https://script.google.com/macros/s/AKfycbwUc0fDv1S9YdEMmnslGakQYssQeJvgMPRSavN2VPLtr8GaM2EQ8d_hqT9RRtSNG-6c/exec";

const message = document.getElementById("message");
const photo = document.getElementById("photo");

const html5QrCode = new Html5Qrcode("reader");

message.innerHTML = "Démarrage de la caméra...";

html5QrCode.start(
    { facingMode: "environment" },
    {
        fps: 10,
        qrbox: 250
    },

    async function(decodedText) {

        try {

            html5QrCode.pause();

            message.innerHTML = "Vérification...";

            const reponse = await fetch(
                API + "?id=" + encodeURIComponent(decodedText)
            );

            const client = await reponse.json();

            if(client.statut=="ACTIF"){

                document.body.style.background="#0f8f32";
                console.log(client);
alert(client.photo);
                photo.src = client.photo;
                photo.onload = function() {
    photo.style.display = "block";
};                

                message.innerHTML =
                "✅ ACCÈS AUTORISÉ<br><br>" +
                client.nom + " " + client.prenom;

            }

            else{

                document.body.style.background="#b30000";

                photo.style.display = "none";

                message.innerHTML =
                "❌ ACCÈS REFUSÉ";

            }

        }

        catch(e){

            photo.style.display = "none";

            document.body.style.background="orange";

            message.innerHTML =
            "Erreur : " + e;

        }

        setTimeout(function(){

            document.body.style.background="#111";

            photo.style.display="none";

            message.innerHTML =
            "Présentez votre QR Code";

            html5QrCode.resume();

        },3000);

    },

    function(errorMessage){}

);
