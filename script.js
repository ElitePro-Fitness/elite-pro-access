document.getElementById("message").innerHTML = "Démarrage de la caméra...";

const html5QrCode = new Html5Qrcode("reader");

html5QrCode.start(
    { facingMode: "environment" },
    {
        fps: 10,
        qrbox: 250
    },
    function(decodedText) {

        document.getElementById("message").innerHTML =
            "QR détecté : " + decodedText;

    },
    function(errorMessage) {

    }

).catch(function(err){

    document.getElementById("message").innerHTML =
        "Erreur caméra : " + err;

});
