import { MongoServer } from './../mongo/mongo';
import { ON, EMMITER, CONSTANT } from '../shared/constants';
import * as SocketIO from 'socket.io';
import { MongoClient, MongoError, ObjectId, ChangeEvent, UpdateWriteOpResult } from 'mongodb';
import { Observable, Subscriber } from 'rxjs';

export class SocketServer {
  private mongoServer = new MongoServer();

  constructor(socker_server_port: number, mongo_host: string, mongo_port: number) {
    const sockertServer = SocketIO.listen(socker_server_port).sockets;
    const mongoClient: MongoClient = new MongoClient(`${mongo_host}:${mongo_port}`, { useUnifiedTopology: true });

    mongoClient.connect((err: MongoError, db: MongoClient) => {
      if (err) {
        throw err;
      }
      console.log(`connected at mongo...`);
      console.log(`listening on ${socker_server_port} socket port...`);
      sockertServer.on(ON.CONNECTION, (socket: SocketIO.Socket) => {
        socket.on(ON.CLIENT_CONNECTED, () => {
          console.log(`client ${socket.id} connected...`);
        });
        /* FIND OBJECT BY ID */
        const findObjectById = socket.on(ON.FIND, (database: string, collection: string, id: string) => {
          this.findObjectById(db, database, collection, id).then((object: any) => {
            findObjectById.emit(EMMITER.STATUS_SUCCESS, object);
          }).catch((reason: any) => {
            findObjectById.emit(EMMITER.STATUS_FAIL, { status: ON.STATUS_FAIL, reason: reason })
          });
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
        /* LIST OBJECTS FROM TARGET COLLECTION */
        const listObjectsFromCollection = socket.on(ON.LIST_OBJECTS, (database: string, collection: string, queryObject: Object) => {
          this.listObjectsFromCollection(db, database, collection, queryObject).then((objects: any[]) => {
            console.log(objects);
            listObjectsFromCollection.emit(EMMITER.STATUS_SUCCESS, objects);
          }).catch((reason: any) => {
            listObjectsFromCollection.emit(EMMITER.STATUS_FAIL, reason);
          })
        });
        /* UPDATE ONE OR MANY OBJECTS */
        const updateObjects = socket.on(ON.UPDATE, (database: string, collection: string, query: Object, fieldsAndValues: Object) => [
          this.updateObjects(db, database, collection, query, fieldsAndValues).then((object: any) => {
            console.log(object);
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
   * Find object by MondoDbId _id
   * @param db Mongo database client
   * @param databaseName Database name
   * @param collection Collection name
   * @param id Document id (_id)
   */
  private findObjectById(db: MongoClient, databaseName: string, collection: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mongoServer.findObjectById(db, databaseName, collection, id).then((result) => {
        resolve(result);
      }).catch((reason: any) => {
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
  private listCollections(db: MongoClient, databaseName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.mongoServer.listCollections(db, databaseName).then((collections: any[]) => {
        resolve(collections);
      }).catch((reason: any) => {
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
  private listAllObjectsFromCollection(db: MongoClient, databaseName: string, collection: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.mongoServer.listAllObjectsFromCollection(db, databaseName, collection).then((values: any[]) => {
        resolve(values);
      }).catch((reason: any) => {
        reject(reason);
      });
    });
  }

  private listObjectsFromCollection(db: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.mongoServer.listObjectsFromCollection(db, databaseName, collection, queryObject).then((values: any[]) => {
        resolve(values);
      }).catch((reason: any) => {
        reject(reason);
      });
    });
  }

  public updateObjects(db: MongoClient, databaseName: string, collection: string, query: Object, fieldsAndValues: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mongoServer.updateObjects(db, databaseName, collection, query, fieldsAndValues).then((documents: UpdateWriteOpResult) => {
        resolve(documents);
      }).catch((reason: any) => {
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
  private writeObject(db: MongoClient, databaseName: string, collection: string, document: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mongoServer.writeObject(db, databaseName, collection, document).then((value: any) => {
        resolve(value);
      }).catch((reason: any) => {
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
  private writeObjects(db: MongoClient, databaseName: string, collection: string, objects: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mongoServer.writeObjects(db, databaseName, collection, objects).then((value: any) => {
        resolve(value);
      }).catch((reason: any) => {
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
  private validateInsertMany(collectionSize: number): boolean {
    if (collectionSize <= CONSTANT.MAX_SIZE_INSERT_MANY_ARRAY) {
      return true;
    }
    throw { err: `Max collection size supported is ${CONSTANT.MAX_SIZE_INSERT_MANY_ARRAY}` }
  }

  /**
     *
     * @param db Database Mongo Client
     * @param databaseName Name from database
     * @param collectionName Name from collection to observer
     */
  public subscribeCollection(db: MongoClient, databaseName: string, collectionName: string): Observable<ChangeEvent<any>> {
    return new Observable((subscriber: Subscriber<any>) => {
      this.mongoServer.subscribeCollection(db, databaseName, collectionName).subscribe((doc: ChangeEvent<any>) => {
        subscriber.next(doc);
      });
    });
  }

}