import uuid
from requests import Session
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from database.database import engine
from database.models import Player

class ConnectionManager:
    """
    Let the connection manager handle all websocket connections and mange their connection, disconnection, and message sending.
    The GAME ORCHESTRATOR should handle game state and logic.

    """
    def __init__(self, room_id, max_connections, player_sockets : dict[uuid.UUID, WebSocket]):
        self.max_connections = max_connections
        self.player_sockets = player_sockets
        self.room_id = room_id

    async def store_player_connection(self, new_connection : WebSocket, player_id : uuid.UUID):
        try:
            self.player_sockets[player_id] = new_connection
            return True
        except Exception as e:
            print(f"Error accepting connection: {e}")
            return False
        
    async def disconnect(self, player_id : uuid.UUID):
        if player_id in self.player_sockets:
            del self.player_sockets[player_id]



