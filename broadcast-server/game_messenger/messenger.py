import logging
import sys
import uuid
from connections.connections_manager import ConnectionManager
from game_execution.game_orchestrator import GameOrchestrator

# Configure logging
logging.basicConfig(
    level=logging.INFO, # Set the desired logging level
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)] # Output to standard output
)
logger = logging.getLogger(__name__)

class Messenger:
    def __init__(self, connection_manager: ConnectionManager, game_orchestrator: GameOrchestrator):
        self.connection_manager = connection_manager
        self.game_orchestrator = game_orchestrator


    # Client -> Server
    async def process_client_action(self, player_id, action):
        await self.game_orchestrator.handle_player_action(player_id, action)
    


    #Server -> Client(publicly)
    async def broadcast_public_game_state(self, game_state_message: dict):
        """
        Broadcast the current game state to all connected players.
        """
        for player_id, websocket in self.connection_manager.player_sockets.items():
            try:
                await websocket.send_json(game_state_message)
            except Exception as e:
                print(f"Error sending game state to player {player_id}: {e}")


    # Server -> Each client(privately)
    async def broadcast_private_game_state(self, player_id: uuid.UUID, message: dict):
        websocket = self.connection_manager.player_sockets.get(player_id)
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending private message to player {player_id}: {e}")