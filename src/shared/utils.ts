export class Utils {

  /**
   * Validate imput
   * @param database database name
   * @param collection colletion name
   * @param objectQuery object query
   */
  public validateRequestDatabaseCollectionObjectQuery(database: string, collection: string, objectQuery: Object): boolean {
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
  public validateRequestDatabaseCollection(database: string, collection: string): boolean {
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
  public validateRequestDatabase(database: string): boolean {
    if (database == null || database == undefined || database == '') {
      return false;
    }
    return true;
  }
}