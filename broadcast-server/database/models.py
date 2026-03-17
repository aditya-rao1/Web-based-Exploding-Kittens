from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
import uuid
from fastapi import Depends
from sqlalchemy import Column, Enum
from dataclasses import dataclass
from database.enums import CardType
from database.enums import PublicGameStateEnum

"""
Defines all the models/classes needed to be used in the database. 



1/20: Define dataclasses for stateful models, define sqlModels for persisted models.
"""

"""Player model for database"""
class Player(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_name: str = Field(default=f"player-{str(uuid.uuid4())[:8]}")
    connected: bool = Field(default=False)
    room_id: Optional[uuid.UUID] = Field(default=None, foreign_key="room.id")
    room: Optional["Room"] = Relationship(back_populates="current_players")


"""
Room model for database
"""
class Room(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    max_players: int = Field(default=4)
    current_players: List["Player"] = Relationship(back_populates="room")



"""
Dataclasses for in-memory stateful models
"""

"""
Represents card state
"""
@dataclass
class CoreCardTypeState:
    card_type: CardType

"""
Represents a player's game state
"""
@dataclass 
class PlayerGameState:
    player_id : uuid.UUID
    player_cards : List[CoreCardTypeState]
    alive: bool = True

@dataclass
class PublicGameState:
    deck_size: int
    deck : List[CoreCardTypeState]
    discard_pile: List[CoreCardTypeState]
    current_turn_player_id: uuid.UUID
    public_game_state: PublicGameStateEnum
    num_players: int

@dataclass
class GameSessionState:
    room_id: uuid.UUID
    players: dict[uuid.UUID, PlayerGameState]
    deck: list[CoreCardTypeState]
    discard_pile: list[CoreCardTypeState]
    turn_order: list[uuid.UUID]
    current_turn_index: int
    started: bool = False
    ended: bool = False