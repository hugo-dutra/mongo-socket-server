### mongo-socket-server
Server do mongo-socket-client repository

> mpm init
> mpn install mongo-socket-server
> Create index.js

`const socketPort = 3000;`
`const mongoDbHost = 'mongodb://127.0.0.1';`
`const mongoPort= 27017;`
`const mongoServer = require('mongo-socket-server');`
`const simpleServer = new mongoServer.default(socketPort, mongoDbHost, mongoPort);`

> node  index.js


###create project with mongo mongo-socket-client and have fun...
