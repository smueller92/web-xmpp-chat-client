# Web-based XMPP Realtime Chat Client
This web-based Chatsystem is using the XMPP-Protocol to communicate with a Ubuntu Server (ORACLE Virtual Box & Openfire) and allows the user to access the Chat Client on any Device Browser. Therefore the Javascript Library 'strophe.js' has been used to enable web-based Realtime-XMPP Applications. <br />
An image of the User Interface can be found here: http://bit.ly/2oVjnPz <br />
The Chat Application allows you to:
- Send/Receive Text Messages
- Change your current Status
- Get the Status of other Users
- Send Contact Requests
- List your Contacts (Roster)
- Enter/Exit Group Chats
# Installation
- Download and Install Oracle Virtual Box: https://www.virtualbox.org/
- Download Ubuntu Desktop: https://www.ubuntu.com/download/desktop
- Download Openfire RTC Server 'openfire_4.0.4_all.deb': https://github.com/igniterealtime/Openfire/releases/tag/v4.0.4  <br />
(NOTE: This application works only with Openfire Version 4.0.4!)
- Create a new virtual Machine with the Ubuntu Desktop Image inside Virtual Box. Set your Username to 'test' and complete the OS Setup

## Virtual Box Setup
Open Virtual Box Terminal:
```
$ apt-get update
$ apt-get upgrade
$ sudo apt-get install default-jre
($ cd LOCATION OF openfire_4.0.4_all.deb)
$ sudo dpkg --install openfire_4.0.4_all.deb 
$ sudo apt-get install apache2 apache2-doc
```
#### Open Virtual Box Webbrowser
- Type 'localhost:9090' to access Openfire Administration
- Create an Administrator (Email: admin@example.com | Name: admin | Password: admin)
- Login with previous created Account: Username: admin | Password: admin
#### Inside Openfire Administration change:
- Server Settings -> Client Connections -> Plain Text -> STARTTLS policy: DISABLED!
- Server Settings -> Compression Settings -> Client Compression Policy: NOT ENABLED!
- Server Settings -> HTTP Binding -> Script Syntax: ENABLED!
- Users/Groups -> Create New User: Create 2 new Testusers (e.g. admin2 and admin3)
- Group Chat -> Create New Room: Room ID: defaultroom | Room Name: defaultroom | Description: Test Room
#### Install Openfire Websocket Plugin:
- Plugins -> Available Plugins -> Openfire WebSocket Plugin: Hit the green cross to install<br />
(If you can't find it download and upload the plugin manually: https://www.igniterealtime.org/projects/openfire/plugins.jsp)
#### Virtual Box Terminal:
```
$ sudo /etc/init.d/openfire restart
$ sudo chmod -R 777 /var/www
$ sudo chown -R [username] /var/www
```
## Application Project Setup
- Download 'xmpp' folder from this repository
- Copy this folder to /var/www/html or create /var/www/html/xmpp and extract files
- Change Virtual Box Network Mode to "Host-only Adapter": <br />
Open Virtual Box Manager and go to the Settings of your current virtual Machine. Then select the Network Tab and change 'NAT' to 'Host-only Adapter'. Now you can access your Openfire Server from any other device in your Network.
- Note the IP-Adress of the Virtual Box (type 'ifconfig' inside Terminal)
- Open the file 'script.js' inside /var/www/html/xmpp and change following lines:
```
// Servername (Can be found inside Openfire Administration -> Server Information -> Server Properties)
var server = 'YOUR_USERNAME-virtualbox';
// Variable containig the IP of your Virtual Box (ws stands for Websocket)
var BOSH_SERVICE = 'ws://YOUR_VIRTUALBOX_IP:7070/ws/';
```
For example change it to:
```
var server = 'test-virtualbox';
var BOSH_SERVICE = 'ws://192.168.2.1:7070/ws/';
```
### You have completed the Setup!
### Open up the Browser on any device and enter 'VIRTUALBOX_IP/xmpp' (e.g. 192.168.2.1/xmpp)
### Enjoy your own web-based XMPP Realtime Chatapplication
