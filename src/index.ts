import { SocketServer } from './socket/socket';

export default class MongoSocketServer {
  /**
   * @author Hugo Alves Dutra
   * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
   * Just put server parameters
   * @param socketServerPort Socket server port (Ex.:3000)
   * @param mongoHost Mongo host (Ex.: mongodb://10.221.37.110 )
   * @param mongoPort Mongo port (Ex.:27017)
   */
  constructor(socketServerPort: number, mongoHost: string, mongoPort: number) {
    const socketServer: SocketServer = new SocketServer(socketServerPort, mongoHost, mongoPort);
  }
}