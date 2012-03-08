#CouchBook

This web application serves to evaluate couchDB both as a datastore and as a standalone web platform.

A live test can be found at http://tejohnso.iriscouch.com/addressbook/_design/main/AddressBook.html

The html, js, and css files can all hosted and served to web clients by the database.

###Features:
HTML5 with AJAX for dynamic data updates to the database.
No plugins, addons, libraries, or templates.  Just core javascript, HTML, and CSS.
Tested on Chrome, Firefox, and Blackberry 7.

###Alternatives:
Currently the files are stored as document attachments in the database.  CouchDB has support for 
storing everything directly in design documents, along with views and "show"s all working together (also templating).

contentEditable could be used rather than changing the field tags when clicking on a document value.

Websockets could be used instead of AJAX but this isn't directly supported in couchDB and a third layer is
out of scope here.  

###Issues:
CouchDB currently doesn't support server sent events (EventSource) in the _changes api but this application
does contain code expecting that.  It is as yet untested.  