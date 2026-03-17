import json
import logging
import sys
from typing import List
import uuid
from database.models import CoreCardTypeState, PlayerGameState, PublicGameState, GameSessionState
from database.models import GameSessionState
from database.enums import CardType, PublicGameStateEnum

# Configure logging
logging.basicConfig(
    level=logging.INFO, # Set the desired logging level
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)] # Output to standard output
)
logger = logging.getLogger(__name__)
class GameOrchestrator:
    def __init__(self):
        self.player_states = {}
        self.public_game_state = None
        self.game_session_state = None
        self.messenger = None  # will be injected later

    def set_messenger(self, messenger):
        self.messenger = messenger
    

    def get_messenger(self):
        return self.messenger
        

    def create_deck(self) -> List[CoreCardTypeState]:
        import random
        deck = []
        for _ in range(6):            
            deck.append(CoreCardTypeState(card_type=CardType.DEFUSE))
        
        for _ in range(5):  
            deck.append(CoreCardTypeState(card_type=CardType.EXPLODING_KITTEN))
            deck.append(CoreCardTypeState(card_type=CardType.SEE_THE_FUTURE))
            deck.append(CoreCardTypeState(card_type=CardType.SKIP))
        
        for _ in range(4):            
            deck.append(CoreCardTypeState(card_type=CardType.ATTACK))
            deck.append(CoreCardTypeState(card_type=CardType.SHUFFLE))
            deck.append(CoreCardTypeState(card_type=CardType.FAVOR))
            deck.append(CoreCardTypeState(card_type=CardType.DRAW_FROM_BOTTOM))
            deck.append(CoreCardTypeState(card_type=CardType.NOPE))

        for _ in range(15):            
            deck.append(CoreCardTypeState(card_type=CardType.CAT_CARD))

        #Shuffle deck
        random.shuffle(deck)
        return deck
    
    def create_turn_order(self, players : List[uuid.UUID]) -> List[uuid.UUID]:
        import random
        turn_order = players.copy()
        random.shuffle(turn_order)
        return turn_order
    

   
    async def handle_player_action(self, player_id, player_data):
        # 0. Need to verify if the game has started or not(that request should come from the front-end)
        #Later half just verify it now with a simple front-end request
        # 1. Validate turn
        # 2. Apply game logic
        # 3. Update internal state
        
        if player_data['event'] == 'PLAYER_JOINED':
            # Handle PLAYER_JOINED event: 
            # - Add the player to internal state if not present
            # - Broadcast updated public game state to all clients
            # Add new player if not already present
            if player_id not in self.player_states:
                # Initialize player game state with empty hand for now
                logger.info(f"Player joined with an id {player_id}")
                self.player_states[player_id] = PlayerGameState(
                    player_id=player_id,
                    player_cards=[],  # Empty at join, assign cards at game start
                    alive=True
                )
            if len(self.player_states) == 4:
                logger.info(f"Starting the game now")
                await self.initiate_game_state()

        else:
            logger.info("New player action taken.")
            update_payload = {
                "type": "GAME_UPDATE",
                "state": self.build_public_state()
            }
            await self.messenger.broadcast_public_game_state(update_payload)


    async def initiate_game_state(self):
        """
        Initialize core game state once enough players have joined.
        """
        curr_messenger = self.messenger
        if not curr_messenger:
            logger.info("The messenger is null") 
        game_deck = self.create_deck()
        logger.info("Created the deck sucessfully.")
        turn_order = self.create_turn_order(players=list(self.player_states.keys()))
        logger.info("Created the turn order sucessfully.")

        self.public_game_state = PublicGameState(
            deck_size=len(game_deck),
            deck=game_deck,
            discard_pile=[],
            current_turn_player_id=str(turn_order[0]),
            public_game_state=PublicGameStateEnum.IN_PROGRESS,
            num_players=4
        )
        await curr_messenger.broadcast_public_game_state({
            "type" : "FINAL_PLAYER_JOINED",
            "current_player_turn" : self.public_game_state.current_turn_player_id
            ,"num_players" : self.public_game_state.num_players
            , "deck_size" : self.public_game_state.deck_size, 
            "public_game_state" : str(self.public_game_state), 
            "game_started" : "true"
        })
        


    def build_public_state(self):
        #Need to build the public game state for the orchestrator
        return {
            "deck_size": self.public_game_state.deck_size,
            "discard_pile": [card.card_type.value for card in self.public_game_state.discard_pile],
            "current_turn_player_id": str(self.public_game_state.current_turn_player_id)
        }

    

    def get_num_players(self) -> int:
        return len(self.player_states)

   

