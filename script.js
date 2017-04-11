
// Server Name (Siehe Openfire Administration)
var server = 'alex-virtualbox';
// IP Adresse auf der openfire läuft (ws steht für Websocket und muss stehen bleiben)
var BOSH_SERVICE = 'ws://192.168.56.101:7070/ws/';
// Name eines beliebigen chatrooms, der vorher in der Openfire-Administration angelegt werden muss
var ROOM = 'mms@conference.' + server;
//var ROOM_SERVICE = 'conference.' + server;
var connection = null;

/**
 * Nachrichten werden in den Verlauf-Bereich der index.html und in die Debugging Konsole des Browsers geschrieben
 * @param msg Nachricht die geschrieben wird
 */
function log(msg) {
    $('#log').append('<div></div>').append(document.createTextNode(msg));
    console.log(msg);
}

/**
 * Funktion, die Ausgeführt wird, wenn der Client auf "Connect" klickt
 * @param status
 */
function onConnect(status) {

    // Nachricht während des Connecting Vorgangs
    if (status == Strophe.Status.CONNECTING) {
        log('Strophe is connecting.');
    }

    // Nachricht falls ein Verbindungsfehler zum XMPP Server auftritt
    else if (status == Strophe.Status.CONNFAIL) {
        alert("A connection to the server is not possible, check variable BOSH_SERVICE configuartion");
        log('Strophe is disconnecting. Connection to server failed.');
    }

    // Nachricht falls falsche Login Daten;
    else if (status == Strophe.Status.AUTHFAIL) {
        alert("You entered a wrong username or password");
        log('Strophe failed to connect. Wrong username or password');
        // Connect button bleibt connect button und ändert sich nicht zu disconnect button
        $('#connect').get(0).value = 'connect';
    }

    // Nachricht falls Connection erfolgreich und vollständige jabber id anzeigen
    else if (status == Strophe.Status.CONNECTED) {
        log('Strophe is connected.');
	// Setzen der vollständigen Jabber ID (nur für Entwicklungszwecke
        $('#fullID').get(0).value = connection.jid;
        // Senden der Presence (status)
        connection.send($pres());
        // Setzen von onMessage Handler und onSubscriptionRequest Handler zum erhalten von Benachrichtigungen (Nachricht und Kontaktanfrage)
        connection.addHandler(onMessage, null, 'message', null, null, null);
        connection.addHandler(onSubscriptionRequest, null, "presence", "subscribe");
    }
}

/**
 * Handler zum Erhalten von Benachrichtigungen
 * @param msg
 * @returns {boolean}
 */
function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    // Wird nur ausgeführt falls der Nachrichten Typ msg ist
    if (type == "chat" && elems.length > 0) {
        var body = elems[0];
        log('CHAT: I got a message from ' + from + ': ' + Strophe.getText(body));
    }
    // Falls false zurückgegeben würde, würde dieser Handler beendet werden
    return true;
}

/**
 * Funktion zum senden von Nachrichten
 * @param msg
 */
function sendMessage(msg) {
    // #to ist die cssID des HTML Formulars. Dort wird der Empfänger eingegeben.
    // #jid Ist die Jabber ID des Senders.
    // Der body ist die eigentliche Nachricht, hier wird die mitgegebene Nachricht
    log('CHAT: Send a message to ' + $('#to').get(0).value + ': ' + msg);
    var m = $msg({
        to: $('#to').get(0).value,
        from: $('#jid').get(0).value,
        type: 'chat'
    }).c("body").t(msg);
    connection.send(m);
}

/**
 * Setzt den Status
 * @param s
 */
function setStatus(s) {
    log('setStatus: ' + s);
    var status = $pres().c('show').t(s);
    connection.send(status);
}

/**
 * Einer Person eine Kontaktanfrage senden.
 * @param jid = Jabber ID der Person der eine Kontaktanfrage geschickt wird
 */
function subscribePresence(jid) {
    log('subscribe Person: ' + jid);
    connection.send($pres({
        to: jid,
        type: "subscribe"
    }));
}
/**
 * Den Status eines Kontakts abrufen.
 * Dafür wird der onPresenceHandler aktiviert, der jede Statusänderung des Kontakts ausgibt
 * @param jid = Kontakt dessen Satus abgerufen werden soll
 */
function getPresence(jid) {
    connection.addHandler(onPresence, null, "presence");
    log('Status: ' + jid);
    var check = $pres({
        type: 'probe',
        to: jid
    });
    connection.send(check);
}
/**
 * Abfrage der eigenen Kontaktliste
 */
function getRoster() {
    log('Request to server...');
    var iq = $iq({
        type: 'get'
    }).c('query', {
        xmlns: 'jabber:iq:roster'
    });
    connection.sendIQ(iq, rosterCallback);
}

function rosterCallback(iq) {
    log('...Answer:');
    $(iq).find('item').each(function () {
        var jid = $(this).attr('jid'); // The jabber_id of your contact
        // You can probably put them in a unordered list and and use their jids as ids.
        log('	>' + jid);
    });
}

/**
 * Information: Funktioniert nur, wenn Person noch nicht in der Kontaktliste
 * @param stanza
 * @returns {boolean}
 */
function onSubscriptionRequest(stanza) {
    if (stanza.getAttribute("type") == "subscribe") {
        var from = $(stanza).attr('from');
        log('onSubscriptionRequest: from=' + from);
        // Send a 'subscribed' notification back to accept the incoming
        // subscription request
        connection.send($pres({
            to: from,
            type: "subscribed"
        }));
    }
    return true;
}

/**
 * Handler der Statusänderungen der abgerufenen Personen mitteilt
 * @param presence
 * @returns {boolean}
 */
function onPresence(presence) {

    // Standard Status
    var presence_type = $(presence).attr('type');
    // Jabber ID des Kontakts
    var from = $(presence).attr('from');
    if (!presence_type) presence_type = "online";
    log('Status of ' + from + ' : ' + presence_type);
    if (presence_type != 'error') {
        if (presence_type === 'unavailable') {
            // Markiere Kontakte als offline
        } else {
            // Diese Variable gibt away oder ähnliches aus (Z.b do not disturb)
            var show = $(presence).find("show").text();
            if (show === 'away') {
                log(' Status of: ' + from + ' : ' + show);
            } else {
                // Hier können weitere Statusse implementiert werden
            }
        }
    }
    return true;
}

/**
 * Funktion zum beitreten eines rooms
 * @param room
 */
function enterRoom(room) {
    log("enterRoom: " + room);
    connection.muc.init(connection);
    connection.muc.join(room, $('#jid').get(0).value, room_msg_handler, room_pres_handler);
    //connection.muc.setStatus(room, $('#jid').get(0).value, 'subscribed', 'chat');
}

// Funktionen für Room basierte Nachrichten
function room_msg_handler(a, b, c) {
    log('MUC: Nachrichten im Raum abboniert');
    return true;
}
function room_pres_handler(a, b, c) {
    log('MUC: Statusse im Raum aboniert');
    return true;
}
function exitRoom(room) {
    log("exitRoom: " + room);
}

//Rawinput und Output: Schreibt rohe Daten nur in die Datenkonsole (von Strophe benötigt)
function rawInput(data) {
    console.log('RECV: ' + data);
}

function rawOutput(data) {
    console.log('SENT: ' + data);
}
/**
 * Wird geladen wenn das Javascript geladen wird
 */
$(document).ready(function () {

    // Daten die vorausgefüllt für das Dokument sind
    $('#jid').get(0).value = "admin@alex-virtualbox";
    $('#pass').get(0).value = "admin";

    // Führt die Connection zum Server durch
    $('#connect').bind('click', function () {
        var url = BOSH_SERVICE;
        connection = new Strophe.Connection(url);
        connection.rawInput = rawInput;
        connection.rawOutput = rawOutput;
        var button = $('#connect').get(0);

        //Führt die Funktionen durch, die nach dem Connect auf der Website stattfinden.
        if (button.value == 'connect') {
            button.value = 'disconnect';
            // Führt Connection funktion durch
            connection.connect($('#jid').get(0).value, $('#pass').get(0).value, onConnect);
        } else {
            button.value = 'connect';
            connection.disconnect();
            alert("You are disconnected");
            log('Strophe is disconnected.');
        }
    });

    // Folgend werden die Klickaktionen beschrieben und die Daten der jeweiligen Funktionen mitgegeben.
    $('#send').bind('click', function () {
        var msg = $('#msg').val();
        sendMessage(msg);
    });

    $('#btnGetPres').bind('click', function () {
        var jid = $('#to').val();
        getPresence(jid);
    });

    $('#btnSubPres').bind('click', function () {
        var jid = $('#to').val();
        subscribePresence(jid);
    });

    $('#btnRoster').bind('click', function () {
        getRoster();
    });

    $('#btnAway').bind('click', function () {
        setStatus('away');
    });

    $('#room').val(ROOM);

    $('#btnEnter').bind('click', function () {
        enterRoom($('#room').val());
    });

    $('#btnExit').bind('click', function () {
        exitRoom($('#room').val());
    });

});
