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

    async function(decodedText){

        if(scannerBloque) return;

        scannerBloque = true;

        try{

            await html5QrCode.pause(true);

            message.innerHTML="Vérification...";

            const reponse = await fetch(

                API + "?id=" + encodeURIComponent(decodedText),

                {
                    method:"GET",
                    cache:"no-store"
                }

            );

            const client = await reponse.json();

            photo.style.display="none";
            photo.src="";

            if(client.photo){

                photo.onload=function(){

                    photo.style.display="block";

                };

                photo.onerror=function(){

                    photo.style.display="none";

                };

                photo.src=client.photo+"&t="+Date.now();

            }

            if(client.statut==="ACTIF"){

                document.body.style.background="#008f39";

                message.innerHTML=

                "<div style='font-size:55px'>✅</div>"+

                "<div style='font-size:38px;font-weight:bold'>ACCÈS AUTORISÉ</div><br>"+

                "<div style='font-size:30px'>"+

                client.nom+" "+client.prenom+

                "</div>";

            }

            else if(client.statut==="DEJA_UTILISE"){

                document.body.style.background="#b60000";

                message.innerHTML=

                "<div style='font-size:55px'>⛔</div>"+

                "<div style='font-size:36px;font-weight:bold'>ACCÈS DÉJÀ UTILISÉ</div><br>"+

                "<div style='font-size:30px'>"+

                client.nom+" "+client.prenom+

                "</div><br>"+

                "<div style='font-size:22px'>Dernière entrée</div>"+

                "<div style='font-size:34px;font-weight:bold'>"+

                client.derniereHeure+

                "</div>";

            }

            else{

                let dateExp="";

                if(client.expiration){

                    const d=new Date(client.expiration);

                    dateExp=

                    d.getDate().toString().padStart(2,"0")+"."+

                    (d.getMonth()+1).toString().padStart(2,"0")+"."+

                    d.getFullYear();

                }

                document.body.style.background="#b60000";

                message.innerHTML=

                "<div style='font-size:55px'>❌</div>"+

                "<div style='font-size:36px;font-weight:bold'>ACCÈS REFUSÉ</div><br>"+

                "<div style='font-size:30px'>"+

                client.nom+" "+client.prenom+

                "</div><br>"+

                "<div style='font-size:22px'>Abonnement expiré le</div>"+

                "<div style='font-size:34px;font-weight:bold'>"+

                dateExp+

                "</div>";

            }

        }

        catch(e){

            photo.style.display="none";

            document.body.style.background="#d98b00";

            message.innerHTML=

            "<b>Erreur</b><br><br>"+e;

        }

        setTimeout(async function(){

            document.body.style.background="#111";

            photo.style.display="none";

            photo.src="";

            message.innerHTML="Présentez votre QR Code";

            scannerBloque=false;

            try{

                await html5QrCode.resume();

            }
            catch(e){

            }

        },10000);

    },

    function(errorMessage){

    }

).catch(function(err){

    message.innerHTML="Erreur caméra : "+err;

});
