"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    /**
     * Validate imput
     * @param database database name
     * @param collection colletion name
     * @param objectQuery object query
     */
    validateRequestDatabaseCollectionObjectQuery(database, collection, objectQuery) {
        if (database == null || database == undefined || database == '') {
            return false;
        }
        if (collection == null || collection == undefined || collection == '') {
            return false;
        }
        if (objectQuery == null || objectQuery == undefined) {
            return false;
        }
        return true;
    }
    /**
     * Validate imput
     * @param database database name
     * @param collection colletion name
     */
    validateRequestDatabaseCollection(database, collection) {
        if (database == null || database == undefined || database == '') {
            return false;
        }
        if (collection == null || collection == undefined || collection == '') {
            return false;
        }
        return true;
    }
    /**
     * Validate imput
     * @param database database name
     */
    validateRequestDatabase(database) {
        if (database == null || database == undefined || database == '') {
            return false;
        }
        return true;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map