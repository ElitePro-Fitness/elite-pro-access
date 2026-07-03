const API =
"https://script.google.com/macros/s/AKfycbwUc0fDv1S9YdEMmnslGakQYssQeJvgMPRSavN2VPLtr8GaM2EQ8d_hqT9RRtSNG-6c/exec";

document.getElementById("message").innerHTML = "Démarrage de la caméra...";

const html5QrCode = new Html5Qrcode("reader");

html5QrCode.start(
    { facingMode: "environment" },
    {
        fps: 10,
        qrbox: 250
    },

    async function(decodedText) {

        html5QrCode.pause();

        document.getElementById("message").innerHTML =
        "Vérification...";

        try {

            const reponse = await fetch(API + "?id=" + encodeURIComponent(decodedText));

            const texte = await reponse.text();

alert(texte);

const client = JSON.parse(texte);

            if(client.statut=="ACTIF"){

                document.body.style.background="green";

                document.getElementById("message").innerHTML=
                "✅ ACCÈS AUTORISÉ<br><br>"
                +client.nom+" "+client.prenom;

            }

            else{

                document.body.style.background="red";

                document.getElementById("message").innerHTML=
                "❌ ACCÈS REFUSÉ";

            }

        }

        catch(e){

            document.body.style.background="orange";

            document.getElementById("message").innerHTML=
            "Erreur : "+e;

        }

        setTimeout(function(){

            document.body.style.background="#111";

            document.getElementById("message").innerHTML=
            "Présentez un QR Code";

            html5QrCode.resume();

        },3000);

    },

    function(errorMessage){}

);
