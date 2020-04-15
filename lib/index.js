"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./socket/socket");
class MongoSocketServer {
    /**
     * @author Hugo Alves Dutra
     * Feel free to colaborate github: {@link https://github.com/hugo-dutra/mongo-socket-server}
     * Just put server parameters
     * @param socketServerPort Socket server port (Ex.:3000)
     * @param mongoHost Mongo host (Ex.: mongodb://10.221.37.110 )
     * @param mongoPort Mongo port (Ex.:27017)
     */
    constructor(socketServerPort, mongoHost, mongoPort) {
        const socketServer = new socket_1.SocketServer(socketServerPort, mongoHost, mongoPort);
    }
}
exports.default = MongoSocketServer;
//# sourceMappingURL=index.js.map