import { Collection, MongoClient, MongoError, ObjectId, ChangeEvent, ChangeStream, Cursor, UpdateWriteOpResult } from 'mongodb';
import { Observable, Subscriber } from 'rxjs';

export class MongoServer {
  /**
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
 * List from documents match queryObject
 * @param db MongoClient
 * @param databaseName Data base name
 * @param collection Collection target
 * @param queryObject Query object. Fiels and values
 * @return Array from objects from collection
 */
  public listObjectsFromCollection(db: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any[]> {
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
   * Update single or multiples objects
   * @param db MongoClient
   * @param databaseName Target database
   * @param collection Target colleciton
   * @param query Query criteria
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
 *
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