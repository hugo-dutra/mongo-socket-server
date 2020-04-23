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
const utils_1 = require("../shared/utils");
class SocketServer {
    constructor(socker_server_port, mongo_host, mongo_port) {
        this.mongoServer = new mongo_1.MongoServer();
        this.utils = new utils_1.Utils();
        const socketServer = SocketIO.listen(socker_server_port).sockets;
        const mongoClient = new mongodb_1.MongoClient(`${mongo_host}:${mongo_port}`, { useUnifiedTopology: true });
        mongoClient.connect((err, mc) => {
            if (err) {
                throw err;
            }
            console.log(`connected at mongo...`);
            console.log(`listening on ${socker_server_port} socket port...`);
            socketServer.on(constants_1.ON.CONNECTION, (socket) => {
                console.log(`client ${socket.id} connected...`);
                /* DELETE OBJECT BY ID */
                const deleteObjectById = socket.on(constants_1.ON.DELETE_ONE, (database, collection, ObjectId) => {
                    this.deleteObjectById(mc, database, collection, ObjectId).then((object) => {
                        deleteObjectById.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        deleteObjectById.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* DELETE ON OR MANY OBJECTS FROM TARGET COLLECTON */
                const deleteObjects = socket.on(constants_1.ON.DELETE_MANY, (database, collection, queryObject) => {
                    this.deleteObjects(mc, database, collection, queryObject).then((object) => {
                        deleteObjects.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        deleteObjects.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* FIND OBJECT BY ID */
                const findObjectById = socket.on(constants_1.ON.FIND, (database, collection, id) => {
                    this.findObjectById(mc, database, collection, id).then((object) => {
                        findObjectById.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        findObjectById.emit(constants_1.EMMITER.STATUS_FAIL, { status: constants_1.ON.STATUS_FAIL, reason: reason });
                    });
                });
                /* LIST OBJECTS FROM TARGET COLLECTION */
                const findObjects = socket.on(constants_1.ON.LIST_OBJECTS, (database, collection, queryObject) => {
                    this.findObjects(mc, database, collection, queryObject).then((objects) => {
                        findObjects.emit(constants_1.EMMITER.STATUS_SUCCESS, objects);
                    }).catch((reason) => {
                        findObjects.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* LIST COLLECTIONS FROM DATABASE */
                const listCollectionsByDatabaseName = socket.on(constants_1.ON.LIST_COLLECTION, (database) => {
                    this.listCollections(mc, database).then((objects) => {
                        listCollectionsByDatabaseName.emit(constants_1.EMMITER.STATUS_SUCCESS, objects);
                    }).catch((reason) => {
                        listCollectionsByDatabaseName.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* LIST ALL OBJECTS FROM TARGET COLLECTION */
                const listAllObjectsFromCollection = socket.on(constants_1.ON.LIST_ALL_OBJECTS, (database, collection) => {
                    this.listAllObjectsFromCollection(mc, database, collection).then((objects) => {
                        listAllObjectsFromCollection.emit(constants_1.EMMITER.STATUS_SUCCESS, objects);
                    }).catch((reason) => {
                        listAllObjectsFromCollection.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    });
                });
                /* REPLACE OBJECTS */
                const replaceOne = socket.on(constants_1.ON.REPLACE_ONE, (database, collection, query, fieldsAndValues) => [
                    this.replaceOne(mc, database, collection, query, fieldsAndValues).then((object) => {
                        replaceOne.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        replaceOne.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    })
                ]);
                /* UPDATE MANY OBJECTS */
                const updateMany = socket.on(constants_1.ON.UPDATE_MANY, (database, collection, query, fieldsAndValues) => [
                    this.updateMany(mc, database, collection, query, fieldsAndValues).then((object) => {
                        updateMany.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        updateMany.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    })
                ]);
                /* UPDATE ONE OBJECTS */
                const updateOne = socket.on(constants_1.ON.UPDATE_ONE, (database, collection, query, fieldsAndValues) => [
                    this.updateOne(mc, database, collection, query, fieldsAndValues).then((object) => {
                        updateOne.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        updateOne.emit(constants_1.EMMITER.STATUS_FAIL, reason);
                    })
                ]);
                /* WRITE ONE */
                const writeObject = socket.on(constants_1.ON.INSERT_ONE, (database, collection, document) => {
                    this.writeObject(mc, database, collection, document).then((object) => {
                        writeObject.emit(constants_1.EMMITER.STATUS_SUCCESS, object);
                    }).catch((reason) => {
                        writeObject.emit(constants_1.EMMITER.STATUS_FAIL, { status: constants_1.EMMITER.STATUS_FAIL, reason: reason });
                    });
                });
                /* WRITE MANY */
                const writeObjects = socket.on(constants_1.ON.INSERT_MANY, (database, collection, documents) => {
                    if (this.validateInsertMany(documents.length)) {
                        this.writeObjects(mc, database, collection, documents).then((objects) => {
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
                    this.subscribeCollection(mc, database, collection).subscribe((object) => {
                        subscribeCollection.emit(constants_1.EMMITER.COLLECTION_CHANGED, object);
                    });
                });
            });
        });
    }
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Delete all objects match with queryObject
     * @param db MongoClient
     * @param databaseName Target database
     * @param collection Target collection
     * @param queryObject Query select objects to delete {@link https://docs.mongomc.com/manual/tutorial/query-documents/}
     * @result Objects deleted infomation
     */
    deleteObjects(mc, databaseName, collection, queryObject) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
                reject({ reason: 'database, collection or queryObject null or undefined' });
            }
            this.mongoServer.deleteObjects(mc, databaseName, collection, queryObject).then((result) => {
                resolve(result);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Delete single object by ObjectId informed
     * @param db MongoClient
     * @param databaseName Target database
     * @param collection Target collection
     * @param id Target object do delete
     * @result object deleted informations
     */
    deleteObjectById(mc, databaseName, collection, ObjectId) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
                reject({ reason: 'database or collection null or undefined' });
            }
            this.mongoServer.deleteObjectById(mc, databaseName, collection, ObjectId).then((result) => {
                resolve(result);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Find object by MondoDbId _id
     * @param db Mongo database client
     * @param databaseName Database name
     * @param collection Collection name
     * @param id Document id (_id)
     */
    findObjectById(mc, databaseName, collection, id) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
                reject({ reason: 'database or collection null or undefined' });
            }
            this.mongoServer.findObjectById(mc, databaseName, collection, id).then((result) => {
                resolve(result);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Return name and size from database collections
     * @param db MongoDbClient
     * @param databaseName Name from database
     * @return Promise with arry array with collections(Name and size)
     */
    listCollections(mc, databaseName) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabase(databaseName)) {
                reject({ reason: 'database or undefined' });
            }
            this.mongoServer.listCollections(mc, databaseName).then((collections) => {
                resolve(collections);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * List all objects from collection
     * @param db Mongo client
     * @param databaseName databasename
     * @param collection collection to get objects
     */
    listAllObjectsFromCollection(mc, databaseName, collection) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
                reject({ reason: 'database or collection null or undefined' });
            }
            this.mongoServer.listAllObjectsFromCollection(mc, databaseName, collection).then((values) => {
                resolve(values);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * List from documents match queryObject
    * @param db MongoClient
    * @param databaseName Data base name
    * @param collection Collection target
    * @param queryObject Query object. Fiels and values {@link https://docs.mongomc.com/manual/tutorial/query-documents/}
    * @return Array from objects from collection
    */
    findObjects(mc, databaseName, collection, queryObject) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
                reject({ reason: 'database, collection or queryObject null or undefined' });
            }
            this.mongoServer.findObjects(mc, databaseName, collection, queryObject).then((values) => {
                resolve(values);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * Replace single
    * @param db MongoClient
    * @param databaseName Target database
    * @param collection Target colleciton
    * @param query Query criteria {@link https://docs.mongomc.com/manual/tutorial/query-documents/}
    * @param fieldValues Value to updated
    */
    replaceOne(mc, databaseName, collection, queryObject, fieldsAndValues) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
                reject({ reason: 'database, collection or queryObject null or undefined' });
            }
            this.mongoServer.replaceOne(mc, databaseName, collection, queryObject, fieldsAndValues).then((documents) => {
                resolve(documents);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * Update single or multiples objects
    * @param db MongoClient
    * @param databaseName Target database
    * @param collection Target colleciton
    * @param query Query criteria {@link https://docs.mongomc.com/manual/tutorial/query-documents/}
    * @param fieldValues Value to updated
    */
    updateMany(mc, databaseName, collection, queryObject, fieldsAndValues) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
                reject({ reason: 'database, collection or queryObject null or undefined' });
            }
            this.mongoServer.updateMany(mc, databaseName, collection, queryObject, fieldsAndValues).then((documents) => {
                resolve(documents);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * Update single object
    * @param db MongoClient
    * @param databaseName Target database
    * @param collection Target colleciton
    * @param query Query criteria {@link https://docs.mongomc.com/manual/tutorial/query-documents/}
    * @param fieldValues Value to updated
    */
    updateOne(mc, databaseName, collection, queryObject, fieldsAndValues) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
                reject({ reason: 'database, collection or queryObject null or undefined' });
            }
            this.mongoServer.updateOne(mc, databaseName, collection, queryObject, fieldsAndValues).then((documents) => {
                resolve(documents);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * Write single object
    * @param db Mongo database client
    * @param databaseName Database name
    * @param collection Collection name
    * @param document Object to write
    * @returns Promise from any
    */
    writeObject(mc, databaseName, collection, document) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
                reject({ reason: 'database, collection null or undefined' });
            }
            this.mongoServer.writeObject(mc, databaseName, collection, document).then((value) => {
                resolve(value);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * Write multiples object
    * @param db Mongo database client
    * @param databaseName Database name
    * @param collection Collection name
    * @param objects Array from Objects to write
    * @returns Promise from any
    */
    writeObjects(mc, databaseName, collection, objects) {
        return new Promise((resolve, reject) => {
            if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
                reject({ reason: 'database, collection null or undefined' });
            }
            this.mongoServer.writeObjects(mc, databaseName, collection, objects).then((value) => {
                resolve(value);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
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
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * Watch target collections
    * *** ONLY WORKS ON REPLYCA SET MONGO DB SERVER ***
    * @param db Database Mongo Client
    * @param databaseName Name from database
    * @param collectionName Name from collection to observer
    * @result Object changed
    */
    subscribeCollection(mc, databaseName, collectionName) {
        return new rxjs_1.Observable((subscriber) => {
            if (!this.utils.validateRequestDatabaseCollection(databaseName, collectionName)) {
                subscriber.next({ reason: 'database or collection null or empty' });
                subscriber.unsubscribe();
            }
            else {
                this.mongoServer.subscribeCollection(mc, databaseName, collectionName).subscribe((doc) => {
                    subscriber.next(doc);
                });
            }
        });
    }
}
exports.SocketServer = SocketServer;
//# sourceMappingURL=socket.js.map