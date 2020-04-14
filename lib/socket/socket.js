"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("./../mongo/mongo");
const constants_1 = require("../shared/constants");
const SocketIO = __importStar(require("socket.io"));
const mongodb_1 = require("mongodb");
const rxjs_1 = require("rxjs");
class SocketServer {
    constructor(socker_server_port, mongo_host, mongo_port) {
        this.mongoServer = new mongo_1.MongoServer();
        const sockertServer = SocketIO.listen(socker_server_port).sockets;
        const mongoClient = new mongodb_1.MongoClient(`${mongo_host}:${mongo_port}`, { useUnifiedTopology: true });
        mongoClient.connect((err, db) => {
            if (err) {
                throw err;
            }
            console.log(`connected at mongo...`);
            console.log(`listening on ${socker_server_port} socket port...`);
            sockertServer.on(constants_1.ON.CONNECTION, (socket) => {
                socket.on(constants_1.ON.CLIENT_CONNECTED, () => {
                    console.log(`client ${socket.id} connected...`);
                });
                /* FIND OBJECT BY ID */
                const findObjectById = socket.on(constants_1.ON.FIND, (database, collection, id) => {
                    this.findObjectById(db, database, collection, id).then((object) => {
                        findObjectById.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        findObjectById.emit(constants_1.EMMITER.STATUS_FAIL, { status: constants_1.ON.STATUS_FAIL, reason: reason });
                    });
                });
                /* LIST COLLECTIONS FROM DATABASE */
                const listCollectionsByDatabaseName = socket.on(constants_1.ON.LIST_COLLECTION, (database) => {
                    this.listCollections(db, database).then((objects) => {
                        listCollectionsByDatabaseName.emit(constants_1.EMMITER.STATUS_SUCCESS, objects);
                    }).catch((reason) => {
                        listCollectionsByDatabaseName.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* LIST ALL OBJECTS FROM TARGET COLLECTION */
                const listAllObjectsFromCollection = socket.on(constants_1.ON.LIST_ALL_OBJECTS, (database, collection) => {
                    this.listAllObjectsFromCollection(db, database, collection).then((objects) => {
                        listAllObjectsFromCollection.emit(constants_1.EMMITER.STATUS_SUCCESS, objects);
                    }).catch((reason) => {
                        listAllObjectsFromCollection.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* LIST OBJECTS FROM TARGET COLLECTION */
                const listObjectsFromCollection = socket.on(constants_1.ON.LIST_OBJECTS, (database, collection, queryObject) => {
                    this.listObjectsFromCollection(db, database, collection, queryObject).then((objects) => {
                        console.log(objects);
                        listObjectsFromCollection.emit(constants_1.EMMITER.STATUS_SUCCESS, objects);
                    }).catch((reason) => {
                        listObjectsFromCollection.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* UPDATE ONE OR MANY OBJECTS */
                const updateObjects = socket.on(constants_1.ON.UPDATE, (database, collection, query, fieldsAndValues) => [
                    this.updateObjects(db, database, collection, query, fieldsAndValues).then((object) => {
                        console.log(object);
                        updateObjects.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        updateObjects.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    })
                ]);
                /* WRITE ONE */
                const writeObject = socket.on(constants_1.ON.INSERT_ONE, (database, collection, document) => {
                    this.writeObject(db, database, collection, document).then((object) => {
                        writeObject.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        writeObject.emit(constants_1.EMMITER.STATUS_FAIL, { status: constants_1.EMMITER.STATUS_FAIL, reason: reason });
                    });
                });
                /* WRITE MANY */
                const writeObjects = socket.on(constants_1.ON.INSERT_MANY, (database, collection, documents) => {
                    if (this.validateInsertMany(documents.length)) {
                        this.writeObjects(db, database, collection, documents).then((objects) => {
                            writeObjects.emit(constants_1.EMMITER.STATUS_SUCCESS, objects);
                        }).catch((reason) => {
                            writeObjects.emit(constants_1.EMMITER.STATUS_FAIL, { status: constants_1.EMMITER.STATUS_FAIL, reason: reason });
                        });
                    }
                    else {
                        writeObjects.emit(constants_1.EMMITER.STATUS_FAIL, { status: constants_1.EMMITER.STATUS_FAIL, reason: 'size message above the limit' });
                    }
                });
                /* WATCH COLLECTION */
                const subscribeCollection = socket.on(constants_1.ON.SUBSCRIBE_COLLECTION, (database, collection) => {
                    this.subscribeCollection(db, database, collection).subscribe((object) => {
                        subscribeCollection.emit(constants_1.EMMITER.COLLECTION_CHANGED, object);
                    });
                });
            });
        });
    }
    /**
     * Find object by MondoDbId _id
     * @param db Mongo database client
     * @param databaseName Database name
     * @param collection Collection name
     * @param id Document id (_id)
     */
    findObjectById(db, databaseName, collection, id) {
        return new Promise((resolve, reject) => {
            this.mongoServer.findObjectById(db, databaseName, collection, id).then((result) => {
                resolve(result);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * Return name and size from database collections
     * @param db MongoDbClient
     * @param databaseName Name from database
     * @return Promise with arry array with collections(Name and size)
     */
    listCollections(db, databaseName) {
        return new Promise((resolve, reject) => {
            this.mongoServer.listCollections(db, databaseName).then((collections) => {
                resolve(collections);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * List all objects from collection
     * @param db Mongo client
     * @param databaseName databasename
     * @param collection collection to get objects
     */
    listAllObjectsFromCollection(db, databaseName, collection) {
        return new Promise((resolve, reject) => {
            this.mongoServer.listAllObjectsFromCollection(db, databaseName, collection).then((values) => {
                resolve(values);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    listObjectsFromCollection(db, databaseName, collection, queryObject) {
        return new Promise((resolve, reject) => {
            this.mongoServer.listObjectsFromCollection(db, databaseName, collection, queryObject).then((values) => {
                resolve(values);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    updateObjects(db, databaseName, collection, query, fieldsAndValues) {
        return new Promise((resolve, reject) => {
            this.mongoServer.updateObjects(db, databaseName, collection, query, fieldsAndValues).then((documents) => {
                resolve(documents);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * Write single object
     * @param db Mongo database client
     * @param databaseName Database name
     * @param collection Collection name
     * @param document Object to write
     * @returns Promise from any
     */
    writeObject(db, databaseName, collection, document) {
        return new Promise((resolve, reject) => {
            this.mongoServer.writeObject(db, databaseName, collection, document).then((value) => {
                resolve(value);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * Write multiples object
    * @param db Mongo database client
    * @param databaseName Database name
    * @param collection Collection name
    * @param objects Array from Objects to write
    * @returns Promise from any
    */
    writeObjects(db, databaseName, collection, objects) {
        return new Promise((resolve, reject) => {
            this.mongoServer.writeObjects(db, databaseName, collection, objects).then((value) => {
                resolve(value);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * Validade write documents limit size from collection size to write object method.
     * Value is configurable
     * @param collectionSize array size limit
     * @returns booleand value
     */
    validateInsertMany(collectionSize) {
        if (collectionSize <= constants_1.CONSTANT.MAX_SIZE_INSERT_MANY_ARRAY) {
            return true;
        }
        throw { err: `Max collection size supported is ${constants_1.CONSTANT.MAX_SIZE_INSERT_MANY_ARRAY}` };
    }
    /**
       *
       * @param db Database Mongo Client
       * @param databaseName Name from database
       * @param collectionName Name from collection to observer
       */
    subscribeCollection(db, databaseName, collectionName) {
        return new rxjs_1.Observable((subscriber) => {
            this.mongoServer.subscribeCollection(db, databaseName, collectionName).subscribe((doc) => {
                subscriber.next(doc);
            });
        });
    }
}
exports.SocketServer = SocketServer;
//# sourceMappingURL=socket.js.map