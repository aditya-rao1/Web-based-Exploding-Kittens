from sqlmodel import Session


class RoomManager:
    def __init__(self):
        self.rooms = {}

    def get_or_create_room(self, room_id):
