import { MongoClient, ChangeEvent } from 'mongodb';
import { Observable } from 'rxjs';
export declare class SocketServer {
    private mongoServer;
    private utils;
    constructor(socker_server_port: number, mongo_host: string, mongo_port: number);
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
    private deleteObjects;
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
    private deleteObjectById;
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Find object by MondoDbId _id
     * @param db Mongo database client
     * @param databaseName Database name
     * @param collection Collection name
     * @param id Document id (_id)
     */
    private findObjectById;
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Return name and size from database collections
     * @param db MongoDbClient
     * @param databaseName Name from database
     * @return Promise with arry array with collections(Name and size)
     */
    private listCollections;
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * List all objects from collection
     * @param db Mongo client
     * @param databaseName databasename
     * @param collection collection to get objects
     */
    private listAllObjectsFromCollection;
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
    private findObjects;
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
    updateObjects(db: MongoClient, databaseName: string, collection: string, queryObject: Object, fieldsAndValues: Object): Promise<any>;
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
    private writeObject;
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
    private writeObjects;
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Validade write documents limit size from collection size to write object method.
     * Value is configurable
     * @param collectionSize array size limit
     * @returns booleand value
     */
    private validateInsertMany;
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
    subscribeCollection(db: MongoClient, databaseName: string, collectionName: string): Observable<ChangeEvent<any>>;
}
//# sourceMappingURL=socket.d.ts.map