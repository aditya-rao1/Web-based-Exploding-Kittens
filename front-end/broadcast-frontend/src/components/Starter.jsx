import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Starter() {

    const navigate = useNavigate();

    const handleCreateRoom = () => {
        navigate('/create-room');
    };

    const handleJoinRoom = () => {
        navigate('/join-room');
    };

    return (
        <div>
            <button onClick={handleCreateRoom }>Create Room</button>
            <button onClick={handleJoinRoom}>Join Room</button>
        </div>
    );
}