from fastapi import HTTPException
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile
from fastapi.responses import HTMLResponse
from connections.connections_manager import ConnectionManager
from game_execution.game_orchestrator import GameOrchestrator
from game_messenger.messenger import Messenger
import shutil
from database.create_db_tables import create_db_tables
from sqlmodel import Session
from database.models import Player, Room
from database.database import engine
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys


connection_managers = {}
game_orchestrators = {} #Dictionary to store game orchestrators for each room by room_id

"""
To run: uvicorn main:app --reload
"""
def main():
    print("API is running.")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, # Set the desired logging level
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)] # Output to standard output
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
def on_startup():
    print("Creating db and tables...")
    create_db_tables()

if __name__ == "__main__":
    main()


"""
Initial state API endpoints. One player must hit this HTTP endpoint to create a room.
"""
@app.post("/create-room")
async def create_room():
    with Session(engine) as session:
        new_room = Room()
        session.add(new_room)
        session.commit()
        session.refresh(new_room)
    logger.info(f"New room created via client: {new_room.id}")
    return {
        "room_id" : str(new_room.id),
        "max_players" : new_room.max_players,  
    }

@app.websocket("/connect")
async def new_player_added(websocket : WebSocket, room_id : str, user_name : str):
    await websocket.accept()
    if not user_name:
        await websocket.close(code=1008)
        logger.error("No proper username passed in.")
        return
    with Session(engine) as session: 
        room = session.get(Room, room_id)
        if not room:
            await websocket.close(code=1008)
            logger.error(f"Web socket connection closed due to invalid room_id: {room_id}")
            return
        if len(room.current_players) > 4:
            await websocket.close(code=1008)
            logger.error(f"Websocket closed due to max players reached. Rejecting player.")
            return
        #Need to init a connection_manager for a room if it doesn't already exist. Stored in memory for now
        connection_manager = get_or_create_connection_manager(room_id)
        new_player = Player(room_id = room.id, user_name=user_name)
        player_connected = await connection_manager.store_player_connection(websocket, new_player.id)
        if not player_connected:
            await websocket.close(code=1011)
            return
        try:
            session.add(room)
            session.add(new_player)
            session.commit()    
        except Exception:
            logger.info("Something went wrong with persisting relevant values")
            raise

        game_orchestrator = get_or_create_game_orchestrator(room_id, connection_manager)
        messenger = game_orchestrator.get_messenger()
        logger.info(f"Game orchestrator created and messenger created")
        if not messenger:
            await websocket.close(code=1011)
            logger.error("Failed to get messenger for game orchestrator")
            raise HTTPException(status_code=500, detail="Failed to get messenger for game orchestrator")
        # 4. The Listening Loop (Keeps the socket open!)
        try:
            while True:
                # Wait for the client to send a game move
                client_data = await websocket.receive_json()
                logger.info(f"Received client information: {client_data} and processing client action.")
                # Pass the raw data to the Messenger to figure out what to do
                await messenger.process_client_action(new_player.id, client_data)
                
        except WebSocketDisconnect:
            # 5. Cleanup when the player leaves or refreshes the page
            logger.info(f"Player {user_name} disconnected.")
            await connection_manager.disconnect(new_player.id)

"""
Initial constructor for the connection manager.
"""
def get_or_create_connection_manager(room_id):
    if room_id in connection_managers:
        logger.info(f"Connection manager for room {room_id} already exists.")
        return connection_managers[room_id]
    else:
        logger.info(f"Creating new connection manager for room {room_id}.")
        connection_manager = ConnectionManager(room_id, 4, {})
        connection_managers[room_id] = connection_manager
        return connection_manager

"""
Initial constructor for the game orchestrator.
"""
def get_or_create_game_orchestrator(room_id, connection_manager):
    if room_id in game_orchestrators:
        logger.info(f"Game orchestrator for room {room_id} already exists.")
        return game_orchestrators[room_id]
    else:
        logger.info(f"Creating new game orchestrator for room {room_id}.")
        game_orchestrator = GameOrchestrator()
        messenger = Messenger(connection_manager, game_orchestrator)
        game_orchestrator.set_messenger(messenger)
        game_orchestrators[room_id] = game_orchestrator
        return game_orchestrator