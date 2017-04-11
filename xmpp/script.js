
// Servername (Can be found inside Openfire Administration)
var server = 'test-virtualbox';
// Variable containig the IP of your Virtual Box (ws stands for Websocket)
var BOSH_SERVICE = 'ws://YOUR_VIRTUALBOX_IP:7070/ws/';
// Name of the Chatroom, as created before inside the Openfire-Administration.
var ROOM = 'defaultroom@conference.' + server;
//var ROOM_SERVICE = 'conference.' + server;
var connection = null;

/**
 * Messages will be displayed in the 'History' area and the Browser's debug console
 * @param msg Message 
 */

function log(msg) {
    $('#log').append('<div></div>').append(document.createTextNode(msg));
    console.log(msg);
}

/**
 * Gets called when the Client presses the Button 'Connect'
 * @param status
 */
function onConnect(status) {

    // Message during Connection
    if (status == Strophe.Status.CONNECTING) {
        log('Strophe is connecting.');
    }

	// Error Message in case the XMPP Server cannot be connected
    else if (status == Strophe.Status.CONNFAIL) {
        alert("A connection to the server is not possible, check variable BOSH_SERVICE configuartion");
        log('Strophe is disconnecting. Connection to server failed.');
    }

    // Error Message for wrong username or password
    else if (status == Strophe.Status.AUTHFAIL) {
        alert("You entered a wrong username or password");
        log('Strophe failed to connect. Wrong username or password');
        // Connect button doesn't change to disconnect button
        $('#connect').get(0).value = 'connect';
    }

	// Message for successful Connection and display full JabberID
    else if (status == Strophe.Status.CONNECTED) {
        log('Strophe is connected.');
	// Set the complete Jabber ID (for developement purposes only)
        $('#fullID').get(0).value = connection.jid;
        // Sending of Presence (status)
        connection.send($pres());
		// Set onMessage/onSubscriptionRequest Handler to receive Notifications (Messages and Contact Requests)
        connection.addHandler(onMessage, null, 'message', null, null, null);
        connection.addHandler(onSubscriptionRequest, null, "presence", "subscribe");
    }
}

/**
 * Handler for the Receiving of Notifications
 * @param msg
 * @returns {boolean}
 */
function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

	// Only execute if the Message-Type is msg
    if (type == "chat" && elems.length > 0) {
        var body = elems[0];
        log('CHAT: I got a message from ' + from + ': ' + Strophe.getText(body));
    }
	// If this would return false, this Handler would be terminated
    return true;
}

/**
 * Function for Message Sending
 * @param msg
 */
function sendMessage(msg) {
	// #to is the cssID of the HTML Formular. You need to enter the receiver here
	// #jid is the JabberID of the transmitting user
	// body is the content of the Message itself
    log('CHAT: Send a message to ' + $('#to').get(0).value + ': ' + msg);
    var m = $msg({
        to: $('#to').get(0).value,
        from: $('#jid').get(0).value,
        type: 'chat'
    }).c("body").t(msg);
    connection.send(m);
}

/**
 * Set the status
 * @param s
 */
function setStatus(s) {
    log('setStatus: ' + s);
    var status = $pres().c('show').t(s);
    connection.send(status);
}

/**
 * Send a contact request to another user
 * @param jid = Jabber ID of the requested user
 */
function subscribePresence(jid) {
    log('subscribe Person: ' + jid);
    connection.send($pres({
        to: jid,
        type: "subscribe"
    }));
}
/**
 * Get the Status of a single user
 * The onPresenceHandler will be activated to get every Status-Change of the contact
 * @param jid = Contact whose status will be queried
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
 * Query and list your own Contactlist (Roster)
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
 * This only works if the Person is not in your Contact List
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
 * This Handler notifies about Status-Changes from the requested Person
 * @param presence
 * @returns {boolean}
 */
function onPresence(presence) {

    // Standard Status
    var presence_type = $(presence).attr('type');
    // Jabber ID from the Contact
    var from = $(presence).attr('from');
    if (!presence_type) presence_type = "online";
    log('Status of ' + from + ' : ' + presence_type);
    if (presence_type != 'error') {
        if (presence_type === 'unavailable') {
            // Mark Contacts as offline
        } else {
            // This variable returns away or a similiar status (e.g. do not disturb)
            var show = $(presence).find("show").text();
            if (show === 'away') {
                log(' Status of: ' + from + ' : ' + show);
            } else {
                // Here you can implement more Statuses
            }
        }
    }
    return true;
}

/**
 * Function for entering Chatrooms
 * @param room
 */
function enterRoom(room) {
    log("enterRoom: " + room);
    connection.muc.init(connection);
    connection.muc.join(room, $('#jid').get(0).value, room_msg_handler, room_pres_handler);
}

// Function for Messages and Notifications inside Chatrooms
function room_msg_handler(a, b, c) {
    log('MUC: Subscribed to all Messages inside this Room');
    return true;
}
function room_pres_handler(a, b, c) {
    log('MUC: Subscribed to all Status-Changes inside this Room');
    return true;
}
function exitRoom(room) {
    log("exitRoom: " + room);
}

//Rawinput und Output: Write raw Data inside console (required by strophe.js)
function rawInput(data) {
    console.log('RECV: ' + data);
}

function rawOutput(data) {
    console.log('SENT: ' + data);
}
/**
 * Gets called when Javascript is loaded
 */
$(document).ready(function () {

    // Prefilled Login Data
    $('#jid').get(0).value = "admin@test-virtualbox";
    $('#pass').get(0).value = "admin";

    // Execute Server Connection
    $('#connect').bind('click', function () {
        var url = BOSH_SERVICE;
        connection = new Strophe.Connection(url);
        connection.rawInput = rawInput;
        connection.rawOutput = rawOutput;
        var button = $('#connect').get(0);

		// Executes different Website Functions after Connection
        if (button.value == 'connect') {
            button.value = 'disconnect';
            // Execute Connection
            connection.connect($('#jid').get(0).value, $('#pass').get(0).value, onConnect);
        } else {
            button.value = 'connect';
            connection.disconnect();
            alert("You are disconnected");
            log('Strophe is disconnected.');
        }
    });

	// Various Events for Mouseclicks on different items
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
