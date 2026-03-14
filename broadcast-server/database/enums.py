from enum import Enum

class PrivateGameState(Enum):
    WAITING_FOR_PLAYERS = "waiting_for_players"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class PublicGameStateEnum(Enum):
    WAITING_FOR_PLAYERS = "waiting_for_players"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class CardType(Enum):
    EXPLODING_KITTEN = "exploding_kitten"
    DEFUSE = "defuse"
    NOPE = "nope"
    ATTACK = "attack"
    SKIP = "skip"
    FAVOR = "favor"
    SHUFFLE = "shuffle"
    SEE_THE_FUTURE = "see_the_future"
    DRAW_FROM_BOTTOM = "draw_from_bottom"
    CAT_CARD = "cat_card"

