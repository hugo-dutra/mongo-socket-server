import { MongoClient, ChangeEvent, UpdateWriteOpResult } from 'mongodb';
import { Observable } from 'rxjs';
export declare class MongoServer {
    /**
         * Find object by MondoDbId _id
         * @param db Mongo database client
         * @param databaseName Database name
         * @param collection Collection name
         * @param id Document id (_id)
         */
    findObjectById(db: MongoClient, databaseName: string, collection: string, id: string): Promise<any>;
    /**
    * List all objects from collection
    * @param db MongoClient
    * @param databaseName Database
    * @param collection Target collection
    * @return Array from all objects from collection
    */
    listAllObjectsFromCollection(db: MongoClient, databaseName: string, collection: string): Promise<any[]>;
    /**
   * List from documents match queryObject
   * @param db MongoClient
   * @param databaseName Data base name
   * @param collection Collection target
   * @param queryObject Query object. Fiels and values
   * @return Array from objects from collection
   */
    listObjectsFromCollection(db: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any[]>;
    /**
     * Return name and size from database collections
     * @param db MongoDbClient
     * @param databaseName Name from database
     * @return Promise with arry array with collections(Name and size)
     */
    listCollections(db: MongoClient, databaseName: string): Promise<any[]>;
    /**
     * Update single or multiples objects
     * @param db MongoClient
     * @param databaseName Target database
     * @param collection Target colleciton
     * @param query Query criteria
     * @param fieldValues Value to updated
     */
    updateObjects(db: MongoClient, databaseName: string, collection: string, query: Object, fieldsAndValues: Object): Promise<UpdateWriteOpResult>;
    /**
         * Write single object
         * @param db Mongo database client
         * @param databaseName Database name
         * @param collection Collection name
         * @param document Object to write
         * @returns Promise from any
         */
    writeObject(db: MongoClient, databaseName: string, collection: string, document: Object): Promise<any>;
    /**
  * Write multiples object
  * @param db Mongo database client
  * @param databaseName Database name
  * @param collection Collection name
  * @param objects Array from Objects to write
  * @returns Promise from any
  */
    writeObjects(db: MongoClient, databaseName: string, collection: string, objects: any[]): Promise<any>;
    /**
   *
   * @param db Database Mongo Client
   * @param databaseName Name from database
   * @param collectionName Name from collection to observer
   */
    subscribeCollection(db: MongoClient, databaseName: string, collectionName: string): Observable<ChangeEvent<any>>;
}
//# sourceMappingURL=mongo.d.ts.map