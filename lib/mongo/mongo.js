"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const rxjs_1 = require("rxjs");
class MongoServer {
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
    deleteObjectById(db, databaseName, collection, id) {
        return new Promise((resolve, reject) => {
            db.db(databaseName)
                .collection(collection)
                .deleteOne(({ _id: new mongodb_1.ObjectId(id) })).then((value) => {
                resolve(value);
            }).catch((reason) => {
                reject(reason);
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
    * @param queryObject Query select objects to delete {@link https://docs.mongodb.com/manual/tutorial/query-documents/}
    * @result Objects deleted infomation
    */
    deleteObjects(db, databaseName, collection, queryObject) {
        return new Promise((resolve, reject) => {
            db.db(databaseName)
                .collection(collection)
                .deleteMany(queryObject, (err, values) => {
                if (err) {
                    reject(err);
                }
                resolve(values);
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
    findObjectById(db, databaseName, collection, id) {
        return new Promise((resolve, reject) => {
            db.db(databaseName)
                .collection(collection)
                .find({ _id: new mongodb_1.ObjectId(id) })
                .toArray((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * List all objects from collection
    * @param db MongoClient
    * @param databaseName Database
    * @param collection Target collection
    * @return Array from all objects from collection
    */
    listAllObjectsFromCollection(db, databaseName, collection) {
        return new Promise((resolve, reject) => {
            const cursor = db.db(databaseName).collection(collection).find();
            cursor.toArray().then((values) => {
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
    * @param queryObject Query object. Fiels and values {@link https://docs.mongodb.com/manual/tutorial/query-documents/}
    * @return Array from objects from collection
    */
    findObjects(db, databaseName, collection, queryObject) {
        return new Promise((resolve, reject) => {
            const cursor = db.db(databaseName).collection(collection).find(queryObject);
            cursor.toArray().then((values) => {
                resolve(values);
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
    listCollections(db, databaseName) {
        return new Promise((resolve, reject) => {
            db.db(databaseName).collections((err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    let arrayOfCollections = new Array();
                    let idxResult = 0;
                    result.forEach((collection) => {
                        let collectionName = collection.collectionName;
                        let collectionSize;
                        collection.countDocuments((err, res) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                collectionSize = res;
                                arrayOfCollections.push({ collectionName: collectionName, collectionSize: collectionSize });
                                idxResult++;
                                if (idxResult == result.length) {
                                    resolve(arrayOfCollections);
                                }
                            }
                        });
                    });
                }
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
     * @param query Query criteria {@link https://docs.mongodb.com/manual/tutorial/query-documents/}
     * @param fieldValues Value to updated
     */
    updateObjects(db, databaseName, collection, query, fieldsAndValues) {
        return new Promise((resolve, reject) => {
            const setPluskeysAndValues = { $set: fieldsAndValues };
            db.db(databaseName).collection(collection).updateMany(query, setPluskeysAndValues).then((documents) => {
                resolve(documents);
            }).catch((reason) => {
                reject(ServiceWorkerRegistration);
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
    writeObject(db, databaseName, collection, document) {
        return new Promise((resolve, reject) => {
            db.db(databaseName).collection(collection).insertOne(document).then((value) => {
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
    writeObjects(db, databaseName, collection, objects) {
        return new Promise((resolve, reject) => {
            db.db(databaseName).collection(collection).insertMany(objects).then((values) => {
                resolve(values);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * @param db Database Mongo Client
    * @param databaseName Name from database
    * @param collectionName Name from collection to observer
    */
    subscribeCollection(db, databaseName, collectionName) {
        return new rxjs_1.Observable((subscriber) => {
            const changeStream = db.db(databaseName).collection(collectionName).watch();
            changeStream.on('change', (doc) => {
                subscriber.next((doc));
            });
        });
    }
}
exports.MongoServer = MongoServer;
//# sourceMappingURL=mongo.js.map