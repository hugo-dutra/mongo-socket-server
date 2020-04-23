import { MongoClient, ChangeEvent, UpdateWriteOpResult, ReplaceWriteOpResult } from 'mongodb';
import { Observable } from 'rxjs';
export declare class MongoServer {
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
    deleteObjectById(mc: MongoClient, databaseName: string, collection: string, id: string): Promise<any>;
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
    deleteObjects(mc: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any>;
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * Find object by MondoDbId _id
    * @param db Mongo database client
    * @param databaseName Database name
    * @param collection Collection name
    * @param id Document id (_id)
    */
    findObjectById(mc: MongoClient, databaseName: string, collection: string, id: string): Promise<any>;
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * List all objects from collection
    * @param db MongoClient
    * @param databaseName Database
    * @param collection Target collection
    * @return Array from all objects from collection
    */
    listAllObjectsFromCollection(mc: MongoClient, databaseName: string, collection: string): Promise<any[]>;
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
    findObjects(mc: MongoClient, databaseName: string, collection: string, queryObject: Object): Promise<any[]>;
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Return name and size from database collections
     * @param db MongoDbClient
     * @param databaseName Name from database
     * @return Promise with arry array with collections(Name and size)
     */
    listCollections(mc: MongoClient, databaseName: string): Promise<any[]>;
    /**
      * @author Hugo Alves Dutra
      * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
      * Replace single documento
      * @param db MongoClient
      * @param databaseName Target database
      * @param collection Target colleciton
      * @param query Query criteria {@link https://docs.mongomc.com/manual/tutorial/query-documents/}
      * @param fieldValues Value to updated
      */
    replaceOne(mc: MongoClient, databaseName: string, collection: string, query: Object, fieldsAndValues: Object): Promise<ReplaceWriteOpResult>;
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
    updateMany(mc: MongoClient, databaseName: string, collection: string, query: Object, fieldsAndValues: Object): Promise<UpdateWriteOpResult>;
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
    updateOne(mc: MongoClient, databaseName: string, collection: string, query: Object, fieldsAndValues: Object): Promise<UpdateWriteOpResult>;
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
    writeObject(mc: MongoClient, databaseName: string, collection: string, document: Object): Promise<any>;
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
    writeObjects(mc: MongoClient, databaseName: string, collection: string, objects: any[]): Promise<any>;
    /**
    * @author Hugo Alves Dutra
    * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
    * @param db Database Mongo Client
    * @param databaseName Name from database
    * @param collectionName Name from collection to observer
    */
    subscribeCollection(mc: MongoClient, databaseName: string, collectionName: string): Observable<ChangeEvent<any>>;
}
//# sourceMappingURL=mongo.d.ts.map