from dataclasses import asdict
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
        

    def create_deck(self):
        import random
        deck = []
        for _ in range(6):            
            deck.append((CardType.DEFUSE).value)
        
        for _ in range(5):  
            deck.append((CardType.EXPLODING_KITTEN).value)
            deck.append((CardType.SEE_THE_FUTURE).value)
            deck.append((CardType.SKIP).value)
        
        for _ in range(4):            
            deck.append((CardType.ATTACK).value)
            deck.append((CardType.SHUFFLE).value)
            deck.append((CardType.FAVOR).value)
            deck.append((CardType.DRAW_FROM_BOTTOM).value)
            deck.append((CardType.NOPE).value)

        for _ in range(15):            
            deck.append((CardType.CAT_CARD).value)

        #Shuffle deck
        random.shuffle(deck)
        return deck
    
    def create_turn_order(self, players : List[uuid.UUID]) -> List[uuid.UUID]:
        import random
        turn_order = players.copy()
        random.shuffle(turn_order)
        return turn_order
    

    def generate_initial_hand(self):
        import random
        hand = []
        hand.append((CardType.DEFUSE).value)
        #For simplicity's sake this function will spawn new cards
        all_card_types = list(CardType)
        remainder_cards = random.sample(all_card_types, 4)
        for remainder_card in remainder_cards:
            hand.append(remainder_card.value)
        logger.info(f"Intial hand for player is: {hand}")
        return hand
            

   
    async def handle_player_action(self, player_id, player_data):
        # 0. Need to verify if the game has started or not(that request should come from the front-end)
        #Later half just verify it now with a simple front-end request
        # 1. Validate turn
        # 2. Apply game logic
        # 3. Update internal state
        if player_data['event'] == 'PLAYER_JOINED':
            if player_id not in self.player_states:
                logger.info(f"Player joined with an id {player_id}")
                self.player_states[player_id] = PlayerGameState(
                    player_id=str(player_id),
                    player_cards=[],  # Empty at join, assign cards at game start
                    alive=True
                )
            if len(self.player_states) == 4:
                logger.info(f"Starting the game now")
                await self.initiate_game_state()
                await self.set_up_individual_players()


        else:
            #TODO: Evolve this functionality as main game loop evolves
            logger.info("New player action taken.")
            update_payload = {
                "type": "GAME_UPDATE",
                "state": self.build_public_state()
            }
            await self.messenger.build_public_game_updates(update_payload)


    async def set_up_individual_players(self):
        curr_messenger = self.messenger
        for player_id, player_state in self.player_states.items():
            player_hand = self.generate_initial_hand()
            logger.info(f"Assigning player: {player_id}, hand: {player_hand}")
            player_state.player_cards = player_hand
            update_message = {
                "type" : "PRIVATE_UPDATE",
                "player_game_state" : asdict(player_state)
            }
            #Broadcast the update to all connected clients
            await curr_messenger.broadcast_private_game_state(player_id, update_message)
    
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
            public_game_state=PublicGameStateEnum.IN_PROGRESS.value,
            num_players=4
        ) 
        await curr_messenger.broadcast_public_game_state({
            "type" : "FINAL_PLAYER_JOINED",
            "current_player_turn" : self.public_game_state.current_turn_player_id
            ,"num_players" : self.public_game_state.num_players
            , "deck_size" : self.public_game_state.deck_size, 
            "public_game_state" : asdict(self.public_game_state), 
            "game_started" : "true"
        })
        
            


    async def build_public_game_updates(self):
        #Need to build the public game state for the orchestrator
        return {
            "deck_size": self.public_game_state.deck_size,
            "discard_pile": [card.card_type.value for card in self.public_game_state.discard_pile],
            "current_turn_player_id": asdict(self.public_game_state.current_turn_player_id)
        }

    

    def get_num_players(self) -> int:
        return len(self.player_states)

   

