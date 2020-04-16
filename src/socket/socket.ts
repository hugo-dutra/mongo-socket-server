import { MongoServer } from './../mongo/mongo';
import { ON, EMMITER, CONSTANT } from '../shared/constants';
import * as SocketIO from 'socket.io';
import { MongoClient, MongoError, ObjectId, ChangeEvent, UpdateWriteOpResult } from 'mongodb';
import { Observable, Subscriber } from 'rxjs';
import { reject } from 'bluebird';
import { Utils } from '../shared/utils';

export class SocketServer {
  private mongoServer = new MongoServer();
  private utils = new Utils();

  constructor(socker_server_port: number, mongo_host: string, mongo_port: number) {
    const socketServer = SocketIO.listen(socker_server_port).sockets;
    const mongoClient: MongoClient = new MongoClient(`${mongo_host}:${mongo_port}`, { useUnifiedTopology: true });

    mongoClient.connect((err: MongoError, db: MongoClient) => {
      if (err) {
        throw err;
      }
      console.log(`connected at mongo...`);
      console.log(`listening on ${socker_server_port} socket port...`);
      socketServer.on(ON.CONNECTION, (socket: SocketIO.Socket) => {
        console.log(`client ${socket.id} connected...`);
        /* DELETE OBJECT BY ID */
        const deleteObjectById = socket.on(ON.DELETE_ONE, (database: string, collection: string, ObjectId: string) => {
          this.deleteObjectById(db, database, collection, ObjectId).then((object: any) => {
            deleteObjectById.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            deleteObjectById.emit(EMMITER.STATUS_FAIL, reason);
          });
        });
        /* DELETE ON OR MANY OBJECTS FROM TARGET COLLECTON */
        const deleteObjects = socket.on(ON.DELETE_MANY, (database: string, collection: string, queryObject: Object) => {
          this.deleteObjects(db, database, collection, queryObject).then((object: any) => {
            deleteObjects.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            deleteObjects.emit(EMMITER.STATUS_FAIL, reason);
          })
        });
        /* FIND OBJECT BY ID */
        const findObjectById = socket.on(ON.FIND, (database: string, collection: string, id: string) => {
          this.findObjectById(db, database, collection, id).then((object: any) => {
            findObjectById.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            findObjectById.emit(EMMITER.STATUS_FAIL, { status: ON.STATUS_FAIL, reason: reason })
          });
        });
        /* LIST OBJECTS FROM TARGET COLLECTION */
        const findObjects = socket.on(ON.LIST_OBJECTS, (database: string, collection: string, queryObject: Object) => {
          this.findObjects(db, database, collection, queryObject).then((objects: any[]) => {
            findObjects.emit(EMMITER.STATUS_SUCCESS, objects);
          }).catch((reason: any) => {
            findObjects.emit(EMMITER.STATUS_FAIL, reason);
          })
        });
        /* LIST COLLECTIONS FROM DATABASE */
        const listCollectionsByDatabaseName = socket.on(ON.LIST_COLLECTION, (database: string) => {
          this.listCollections(db, database).then((objects: any[]) => {
            listCollectionsByDatabaseName.emit(EMMITER.STATUS_SUCCESS, objects);
          }).catch((reason: any) => {
            listCollectionsByDatabaseName.emit(EMMITER.STATUS_FAIL, reason);
          });
        });
        /* LIST ALL OBJECTS FROM TARGET COLLECTION */
        const listAllObjectsFromCollection = socket.on(ON.LIST_ALL_OBJECTS, (database: string, collection: string) => {
          this.listAllObjectsFromCollection(db, database, collection).then((objects: any[]) => {
            listAllObjectsFromCollection.emit(EMMITER.STATUS_SUCCESS, objects);
          }).catch((reason: any) => {
            listAllObjectsFromCollection.emit(EMMITER.STATUS_FAIL, reason);
          })
        });
        /* UPDATE ONE OR MANY OBJECTS */
        const updateObjects = socket.on(ON.UPDATE, (database: string, collection: string, query: Object, fieldsAndValues: Object) => [
          this.updateObjects(db, database, collection, query, fieldsAndValues).then((object: any) => {
            updateObjects.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            updateObjects.emit(EMMITER.STATUS_FAIL, reason);
          })
        ]);
        /* WRITE ONE */
        const writeObject = socket.on(ON.INSERT_ONE, (database: string, collection: string, document: Object) => {
          this.writeObject(db, database, collection, document).then((object: any) => {
            writeObject.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            writeObject.emit(EMMITER.STATUS_FAIL, { status: EMMITER.STATUS_FAIL, reason: reason });
          });
        });
        /* WRITE MANY */
        const writeObjects = socket.on(ON.INSERT_MANY, (database: string, collection: string, documents: any[]) => {
          if (this.validateInsertMany(documents.length)) {
            this.writeObjects(db, database, collection, documents).then((objects: any) => {
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
          this.subscribeCollection(db, database, collection).subscribe((object: ChangeEvent<any>) => {
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
   * @param queryObject Query select objects to delete {@link https://docs.mongodb.com/manual/tutorial/query-documents/}
   * @result Objects deleted infomation
   */
  private deleteObjects(db: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.deleteObjects(db, databaseName, collection, queryObject).then((result) => {
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
  private deleteObjectById(db: MongoClient, databaseName: string, collection: string, ObjectId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database or collection null or undefined' });
      }
      this.mongoServer.deleteObjectById(db, databaseName, collection, ObjectId).then((result) => {
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
  private findObjectById(db: MongoClient, databaseName: string, collection: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database or collection null or undefined' });
      }
      this.mongoServer.findObjectById(db, databaseName, collection, id).then((result) => {
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
  private listCollections(db: MongoClient, databaseName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabase(databaseName)) {
        reject({ reason: 'database or undefined' });
      }
      this.mongoServer.listCollections(db, databaseName).then((collections: any[]) => {
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
  private listAllObjectsFromCollection(db: MongoClient, databaseName: string, collection: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database or collection null or undefined' });
      }
      this.mongoServer.listAllObjectsFromCollection(db, databaseName, collection).then((values: any[]) => {
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
  * @param queryObject Query object. Fiels and values {@link https://docs.mongodb.com/manual/tutorial/query-documents/}
  * @return Array from objects from collection
  */
  private findObjects(db: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.findObjects(db, databaseName, collection, queryObject).then((values: any[]) => {
        resolve(values);
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
  * @param query Query criteria {@link https://docs.mongodb.com/manual/tutorial/query-documents/}
  * @param fieldValues Value to updated
  */
  public updateObjects(db: MongoClient, databaseName: string, collection: string, queryObject: Object, fieldsAndValues: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollectionObjectQuery(databaseName, collection, queryObject)) {
        reject({ reason: 'database, collection or queryObject null or undefined' });
      }
      this.mongoServer.updateObjects(db, databaseName, collection, queryObject, fieldsAndValues).then((documents: UpdateWriteOpResult) => {
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
  private writeObject(db: MongoClient, databaseName: string, collection: string, document: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database, collection null or undefined' });
      }
      this.mongoServer.writeObject(db, databaseName, collection, document).then((value: any) => {
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
  private writeObjects(db: MongoClient, databaseName: string, collection: string, objects: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collection)) {
        reject({ reason: 'database, collection null or undefined' });
      }
      this.mongoServer.writeObjects(db, databaseName, collection, objects).then((value: any) => {
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
  public subscribeCollection(db: MongoClient, databaseName: string, collectionName: string): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      if (!this.utils.validateRequestDatabaseCollection(databaseName, collectionName)) {
        subscriber.next({ reason: 'database or collection null or empty' });
        subscriber.unsubscribe();
      } else {
        this.mongoServer.subscribeCollection(db, databaseName, collectionName).subscribe((doc: any) => {
          subscriber.next(doc);
        });
      }
    });
  }

}