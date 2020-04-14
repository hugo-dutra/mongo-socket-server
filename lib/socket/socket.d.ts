import { MongoClient, ChangeEvent } from 'mongodb';
import { Observable } from 'rxjs';
export declare class SocketServer {
    private mongoServer;
    constructor(socker_server_port: number, mongo_host: string, mongo_port: number);
    /**
     * Find object by MondoDbId _id
     * @param db Mongo database client
     * @param databaseName Database name
     * @param collection Collection name
     * @param id Document id (_id)
     */
    private findObjectById;
    /**
     * Return name and size from database collections
     * @param db MongoDbClient
     * @param databaseName Name from database
     * @return Promise with arry array with collections(Name and size)
     */
    private listCollections;
    /**
     * List all objects from collection
     * @param db Mongo client
     * @param databaseName databasename
     * @param collection collection to get objects
     */
    private listAllObjectsFromCollection;
    private listObjectsFromCollection;
    updateObjects(db: MongoClient, databaseName: string, collection: string, query: Object, fieldsAndValues: Object): Promise<any>;
    /**
     * Write single object
     * @param db Mongo database client
     * @param databaseName Database name
     * @param collection Collection name
     * @param document Object to write
     * @returns Promise from any
     */
    private writeObject;
    /**
    * Write multiples object
    * @param db Mongo database client
    * @param databaseName Database name
    * @param collection Collection name
    * @param objects Array from Objects to write
    * @returns Promise from any
    */
    private writeObjects;
    /**
     * Validade write documents limit size from collection size to write object method.
     * Value is configurable
     * @param collectionSize array size limit
     * @returns booleand value
     */
    private validateInsertMany;
    /**
       *
       * @param db Database Mongo Client
       * @param databaseName Name from database
       * @param collectionName Name from collection to observer
       */
    subscribeCollection(db: MongoClient, databaseName: string, collectionName: string): Observable<ChangeEvent<any>>;
}
//# sourceMappingURL=socket.d.ts.map