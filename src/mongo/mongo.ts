import { Collection, MongoClient, MongoError, ObjectId, ChangeEvent, ChangeStream, Cursor, UpdateWriteOpResult, DeleteWriteOpResultObject } from 'mongodb';
import { Observable, Subscriber } from 'rxjs';

export class MongoServer {

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
  public deleteObjectById(db: MongoClient, databaseName: string, collection: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      db.db(databaseName)
        .collection(collection)
        .deleteOne(({ _id: new ObjectId(id) })).then((value: DeleteWriteOpResultObject) => {
          resolve(value)
        }).catch((reason: any) => {
          reject(reason)
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
  public deleteObjects(db: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      db.db(databaseName)
        .collection(collection)
        .deleteMany(queryObject, (err: MongoError, values: DeleteWriteOpResultObject) => {
          if (err) {
            reject(err);
          }
          resolve(values);
        })
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
  public findObjectById(db: MongoClient, databaseName: string, collection: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      db.db(databaseName)
        .collection(collection)
        .find({ _id: new ObjectId(id) })
        .toArray((err: MongoError, result: any[]) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        })
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
  public listAllObjectsFromCollection(db: MongoClient, databaseName: string, collection: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const cursor: Cursor<any> = db.db(databaseName).collection(collection).find();
      cursor.toArray().then((values: any[]) => {
        resolve(values)
      }).catch((reason: any) => {
        reject(reason)
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
  public findObjects(db: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const cursor: Cursor<any> = db.db(databaseName).collection(collection).find(queryObject);
      cursor.toArray().then((values: any[]) => {
        resolve(values)
      }).catch((reason: any) => {
        reject(reason)
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
  public listCollections(db: MongoClient, databaseName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.db(databaseName).collections((err: MongoError, result: Collection[]) => {
        if (err) {
          reject(err);
        } else {
          let arrayOfCollections = new Array<any>();
          let idxResult = 0;
          result.forEach((collection: Collection) => {
            let collectionName: string = collection.collectionName;
            let collectionSize: number;
            collection.countDocuments((err: MongoError, res: number) => {
              if (err) {
                reject(err)
              } else {
                collectionSize = res;
                arrayOfCollections.push({ collectionName: collectionName, collectionSize: collectionSize });
                idxResult++;
                if (idxResult == result.length) {
                  resolve(arrayOfCollections)
                }
              }
            })
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
  public updateObjects(db: MongoClient, databaseName: string, collection: string, query: Object, fieldsAndValues: Object): Promise<UpdateWriteOpResult> {
    return new Promise((resolve, reject) => {
      const setPluskeysAndValues = { $set: fieldsAndValues }
      db.db(databaseName).collection(collection).updateMany(query, setPluskeysAndValues).then((documents: UpdateWriteOpResult) => {
        resolve(documents);
      }).catch((reason: any) => {
        reject(ServiceWorkerRegistration)
      })
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
  public writeObject(db: MongoClient, databaseName: string, collection: string, document: Object): Promise<any> {
    return new Promise((resolve, reject) => {
      db.db(databaseName).collection(collection).insertOne(document).then((value: any) => {
        resolve(value);
      }).catch((reason: any) => {
        reject(reason);
      })
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
  public writeObjects(db: MongoClient, databaseName: string, collection: string, objects: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      db.db(databaseName).collection(collection).insertMany(objects).then((values: any) => {
        resolve(values);
      }).catch((reason: any) => {
        reject(reason);
      })
    });
  }

  /**
  * @author Hugo Alves Dutra
  * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
  * @param db Database Mongo Client
  * @param databaseName Name from database
  * @param collectionName Name from collection to observer
  */
  public subscribeCollection(db: MongoClient, databaseName: string, collectionName: string): Observable<ChangeEvent<any>> {
    return new Observable((subscriber: Subscriber<any>) => {
      const changeStream: ChangeStream = db.db(databaseName).collection(collectionName).watch();
      changeStream.on('change', (doc: ChangeEvent<any>) => {
        subscriber.next((doc));
      });
    });
  }


}