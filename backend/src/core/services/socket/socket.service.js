import { createGroupRoom } from './socket.helpers.js';

class SocketService {
    #io = null;

    setIO(socketServer) {
        this.#io = socketServer;
    }

    getIO() {
        return this.#io;
    }

    emitToGroup(groupId, event, payload) {
        if (!this.#io) {
            return false;
        }

        this.#io.to(createGroupRoom(groupId)).emit(event, payload);
        return true;
    }
}

export default new SocketService();
