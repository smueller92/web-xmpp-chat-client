# Web-based XMPP Realtime Chat Client
This web-based Chatsystem is using the XMPP-Protocol to communicate with a Server (ORACLE Virtual Box & Openfire). 
Therefore the Javascript Library 'strophe.js' has been used to enable web-based Realtime-XMPP Applications.
You can:
- Send/Receive Text Messages
- Change your current Status
- Get the Status of other Users
- Send Contact Requests
- Lists your Contacts (Roster)
- Enter/Exit Group Chats
## Installation
- Download and Install Oracle Virtual Box: https://www.virtualbox.org/
- Download Openfire RTC Server'openfire_4.0.4_all.deb' from this repository 
(NOTE: This application works only with Openfire Version 4.0.4!)
### Virtual Box Terminal:
- $ apt-get update
- $ apt-get upgrade
- $ sudo apt-get install default-jre
- ($ cd LOCATION OF openfire_4.0.4_all.deb)
- $ sudo dpkg --install openfire_4.0.4_all.deb 
### Open Virtual Box Webbrowser
- Type 'localhost:9090' to access Openfire Administration
- Create an Administrator (Email: admin@example.com | Name: admin | Password: admin)
- Login with previous created Account: Username: admin | Password: admin
Inside Openfire Administration change:
- Server Settings -> Client Connections -> Plain Text -> STARTTLS policy: DISABLED!
- Server Settings -> Compression Settings -> Client Compression Policy: NOT ENABLED!
- Server Settings -> HTTP Binding -> Script Syntax: ENABLED!
Install Openfire Websocket Plugin:
