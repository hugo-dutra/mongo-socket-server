import { MongoServer } from './../mongo/mongo';
import { ON, EMMITER, CONSTANT } from '../shared/constants';
import * as SocketIO from 'socket.io';
import { MongoClient, MongoError, ObjectId, ChangeEvent, UpdateWriteOpResult, WriteOpResult, ReplaceWriteOpResult } from 'mongodb';
import { Observable, Subscriber } from 'rxjs';
import { reject } from 'bluebird';
import { Utils } from '../shared/utils';

export class SocketServer {
  private mongoServer = new MongoServer();
  private utils = new Utils();

  constructor(socker_server_port: number, mongo_host: string, mongo_port: number) {
    const socketServer = SocketIO.listen(socker_server_port).sockets;
    const mongoClient: MongoClient = new MongoClient(`${mongo_host}:${mongo_port}`, { useUnifiedTopology: true });

    mongoClient.connect((err: MongoError, mc: MongoClient) => {
      if (err) {
        throw err;
      }
      console.log(`connected at mongo...`);
      console.log(`listening on ${socker_server_port} socket port...`);
      socketServer.on(ON.CONNECTION, (socket: SocketIO.Socket) => {
        console.log(`client ${socket.id} connected...`);
        /* DELETE OBJECT BY ID */
        const deleteObjectById = socket.on(ON.DELETE_ONE, (database: string, collection: string, ObjectId: string) => {
          this.deleteObjectById(mc, database, collection, ObjectId).then((object: any) => {
            deleteObjectById.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            deleteObjectById.emit(EMMITER.STATUS_FAIL, reason);
          });
        });
        /* DELETE ON OR MANY OBJECTS FROM TARGET COLLECTON */
        const deleteObjects = socket.on(ON.DELETE_MANY, (database: string, collection: string, queryObject: Object) => {
          this.deleteObjects(mc, database, collection, queryObject).then((object: any) => {
            deleteObjects.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            deleteObjects.emit(EMMITER.STATUS_FAIL, reason);
          })
        });
        /* FIND OBJECT BY ID */
        const findObjectById = socket.on(ON.FIND, (database: string, collection: string, id: string) => {
          this.findObjectById(mc, database, collection, id).then((object: any) => {
            findObjectById.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            findObjectById.emit(EMMITER.STATUS_FAIL, { status: ON.STATUS_FAIL, reason: reason })
          });
        });
        /* LIST OBJECTS FROM TARGET COLLECTION */
        const findObjects = socket.on(ON.LIST_OBJECTS, (database: string, collection: string, queryObject: Object) => {
          this.findObjects(mc, database, collection, queryObject).then((objects: any[]) => {
            findObjects.emit(EMMITER.STATUS_SUCCESS, objects);
          }).catch((reason: any) => {
            findObjects.emit(EMMITER.STATUS_FAIL, reason);
          })
        });
        /* LIST COLLECTIONS FROM DATABASE */
        const listCollectionsByDatabaseName = socket.on(ON.LIST_COLLECTION, (database: string) => {
          this.listCollections(mc, database).then((objects: any[]) => {
            listCollectionsByDatabaseName.emit(EMMITER.STATUS_SUCCESS, objects);
          }).catch((reason: any) => {
            listCollectionsByDatabaseName.emit(EMMITER.STATUS_FAIL, reason);
          });
        });
        /* LIST ALL OBJECTS FROM TARGET COLLECTION */
        const listAllObjectsFromCollection = socket.on(ON.LIST_ALL_OBJECTS, (database: string, collection: string) => {
          this.listAllObjectsFromCollection(mc, database, collection).then((objects: any[]) => {
            listAllObjectsFromCollection.emit(EMMITER.STATUS_SUCCESS, objects);
          }).catch((reason: any) => {
            listAllObjectsFromCollection.emit(EMMITER.STATUS_FAIL, reason);
          })
        });
        /* REPLACE OBJECTS */
        const replaceOne = socket.on(ON.REPLACE_ONE, (database: string, collection: string, query: Object, fieldsAndValues: Object) => [
          this.replaceOne(mc, database, collection, query, fieldsAndValues).then((object: any) => {
            replaceOne.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            replaceOne.emit(EMMITER.STATUS_FAIL, reason);
          })
        ]);
        /* UPDATE MANY OBJECTS */
        const updateMany = socket.on(ON.UPDATE_MANY, (database: string, collection: string, query: Object, fieldsAndValues: Object) => [
          this.updateMany(mc, database, collection, query, fieldsAndValues).then((object: any) => {
            updateMany.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            updateMany.emit(EMMITER.STATUS_FAIL, reason);
          })
        ]);
        /* UPDATE ONE OBJECTS */
        const updateOne = socket.on(ON.UPDATE_ONE, (database: string, collection: string, query: Object, fieldsAndValues: Object) => [
          this.updateOne(mc, database, collection, query, fieldsAndValues).then((object: any) => {
            updateOne.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            updateOne.emit(EMMITER.STATUS_FAIL, reason);
          })
        ]);
        /* WRITE ONE */
        const writeObject = socket.on(ON.INSERT_ONE, (database: string, collection: string, document: Object) => {
          this.writeObject(mc, database, collection, document).then((object: any) => {
            writeObject.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            writeObject.emit(EMMITER.STATUS_FAIL, { status: EMMITER.STATUS_FAIL, reason: reason });
          });
        });
        /* WRITE MANY */
        const writeObjects = socket.on(ON.INSERT_MANY, (database: string, collection: string, documents: any[]) => {
          if (this.validateInsertMany(documents.length)) {
            this.writeObjects(mc, database, collection, documents).then((objects: any) => {
              writeObjects.emit(EMMITER.STATUS_SUCCESS, objects);
            }).catch((reason: any) => {
              writeObjects.emit(EMMITER.STATUS_FAIL, { status: EMMITER.STATUS_FAIL, reason: reason });
            });
          } else {
            writeObjects.emit(EMMITER.STATUS_FAIL, { status: EMMITER.STATUS_FAIL, reason: 'size message above the limit' });
          }
        });
        /* WATCH COLLECTION */
        const subscribeCollection = socket.on(ON.SUBSCRIBE_COLLECTION, (database: string, collection: string) => {
          this.subscribeCollection(mc, database, collection).subscribe((object: ChangeEvent<any>) => {
            subscribeCollection.emit(EMMITER.COLLECTION_CHANGED, object);
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
  private deleteObjects(mc: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.deleteObjects(mc, databaseName, collection, queryObject).then((result) => {
        resolve(result);
      }).catch((reason: any) => {
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
  private deleteObjectById(mc: MongoClient, databaseName: string, collection: string, ObjectId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database or collection null or undefined' });
      }
      this.mongoServer.deleteObjectById(mc, databaseName, collection, ObjectId).then((result) => {
        resolve(result);
      }).catch((reason: any) => {
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
  private findObjectById(mc: MongoClient, databaseName: string, collection: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database or collection null or undefined' });
      }
      this.mongoServer.findObjectById(mc, databaseName, collection, id).then((result) => {
        resolve(result);
      }).catch((reason: any) => {
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
  private listCollections(mc: MongoClient, databaseName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabase(databaseName)) {
        reject({ reason: 'database or undefined' });
      }
      this.mongoServer.listCollections(mc, databaseName).then((collections: any[]) => {
        resolve(collections);
      }).catch((reason: any) => {
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
  private listAllObjectsFromCollection(mc: MongoClient, databaseName: string, collection: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database or collection null or undefined' });
      }
      this.mongoServer.listAllObjectsFromCollection(mc, databaseName, collection).then((values: any[]) => {
        resolve(values);
      }).catch((reason: any) => {
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
  private findObjects(mc: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.findObjects(mc, databaseName, collection, queryObject).then((values: any[]) => {
        resolve(values);
      }).catch((reason: any) => {
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
  public replaceOne(mc: MongoClient, databaseName: string, collection: string, queryObject: Object, fieldsAndValues: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.replaceOne(mc, databaseName, collection, queryObject, fieldsAndValues).then((documents: ReplaceWriteOpResult) => {
        resolve(documents);
      }).catch((reason: any) => {
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
  public updateMany(mc: MongoClient, databaseName: string, collection: string, queryObject: Object, fieldsAndValues: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.updateMany(mc, databaseName, collection, queryObject, fieldsAndValues).then((documents: UpdateWriteOpResult) => {
        resolve(documents);
      }).catch((reason: any) => {
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
  public updateOne(mc: MongoClient, databaseName: string, collection: string, queryObject: Object, fieldsAndValues: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.updateOne(mc, databaseName, collection, queryObject, fieldsAndValues).then((documents: UpdateWriteOpResult) => {
        resolve(documents);
      }).catch((reason: any) => {
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
  private writeObject(mc: MongoClient, databaseName: string, collection: string, document: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database, collection null or undefined' });
      }
      this.mongoServer.writeObject(mc, databaseName, collection, document).then((value: any) => {
        resolve(value);
      }).catch((reason: any) => {
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
  private writeObjects(mc: MongoClient, databaseName: string, collection: string, objects: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database, collection null or undefined' });
      }
      this.mongoServer.writeObjects(mc, databaseName, collection, objects).then((value: any) => {
        resolve(value);
      }).catch((reason: any) => {
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
  private validateInsertMany(collectionSize: number): boolean {
    if (collectionSize <= CONSTANT.MAX_SIZE_INSERT_MANY_ARRAY) {
      return true;
    }
    throw { err: `Max collection size supported is ${CONSTANT.MAX_SIZE_INSERT_MANY_ARRAY}` }
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
  public subscribeCollection(mc: MongoClient, databaseName: string, collectionName: string): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collectionName)) {
        subscriber.next({ reason: 'database or collection null or empty' });
        subscriber.unsubscribe();
      } else {
        this.mongoServer.subscribeCollection(mc, databaseName, collectionName).subscribe((doc: any) => {
          subscriber.next(doc);
        });
      }
    });
  }
}