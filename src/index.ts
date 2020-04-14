import { SocketServer } from './socket/socket';
import { Promise } from 'bluebird';

export default class MongoSocketServer {
  /**
   * Just put server parameters
   * @param socketServerPort Socket server port (Ex.:3000)
   * @param mongoHost Mongo host (Ex.: mongodb://10.221.37.110 )
   * @param mongoPort Mongo port (Ex.:27017)
   */
  constructor(socketServerPort: number, mongoHost: string, mongoPort: number) {
    const socketServer: SocketServer = new SocketServer(socketServerPort, mongoHost, mongoPort);
  }
}