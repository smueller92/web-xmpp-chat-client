# Web-based XMPP Realtime Chat Client
This web-based Chatsystem is using the XMPP-Protocol to communicate with a Server (ORACLE Virtual Box Ubuntu & Openfire). 
Therefore the Javascript Library 'strophe.js' has been used to enable web-based Realtime-XMPP Applications.
You can:
- Send/Receive Text Messages
- Change your current Status
- Get the Status of other Users
- Send Contact Requests
- Lists your Contacts (Roster)
- Enter/Exit Group Chats
# Installation
- Download and Install Oracle Virtual Box: https://www.virtualbox.org/
- Download Ubuntu Desktop: https://www.ubuntu.com/download/desktop
- Download Openfire RTC Server'openfire_4.0.4_all.deb' from this repository <br />
(NOTE: This application works only with Openfire Version 4.0.4!)
- Create a new virtual Machine with the Ubuntu Desktop Image inside Virtual Box and complete the OS Setup

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
#### Install Openfire Websocket Plugin:
- Plugins -> Available Plugins -> Openfire WebSocket Plugin: Hit the green cross to install (If you can't find it download and upload the plugin manually: https://www.igniterealtime.org/projects/openfire/plugins.jsp)
#### Virtual Box Terminal:
```
$ sudo /etc/init.d/openfire restart
$ sudo chmod -R 777 /var/www
$ sudo chown -R [username] /var/www
```
## Application Project Setup
- Download 'xmpp' folder from this repository
- Copy this folder to /var/www/html or create /var/www/html/xmpp and extract files
- Change Virtual Box 

