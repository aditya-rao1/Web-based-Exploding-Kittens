import React, { useState, useEffect } from 'react';
import { useWebSocket, createRoom } from '../hooks/useWebSocket';
import Room from './Room';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


function Lobby({ createRoom: isCreateRoom }) {
    const [userName, setUserName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [roomCreated, setRoomCreated] = useState(false);
    const [createdRoomId, setCreatedRoomId] = useState(null);
    const [idModal, setIdModal] = useState(false);
    


    const { connect, isConnected, publicGameState, privateGameState, wsError} =
        useWebSocket(roomId, userName);


    useEffect(() => {
        if (publicGameState?.game_started) {
            console.log('Game started!', publicGameState);
        }
    }, [publicGameState]);


    //check if relevant info has changed for a web socket connection to occur
    useEffect(() => {
    if (roomId && userName) {
        connect();
    }
    }, [roomId, userName, connect]);

    const handleCreateRoom = async () => {
        setIsLoading(true);
        try {
            const data = await createRoom();
            setCreatedRoomId(data.room_id);
            setIdModal(true);        // open popup for room creation.
            setRoomCreated(true);
        } catch (err) {
            setError("Failed to create room");
        } finally {
            setIsLoading(false);
        }

    };

    const handleCloseModal = async () => {
        setIdModal(false)
    }


    const handleJoinRoom = () => {
        if (roomCode == "" || roomCode == null) {
            console.log("Error: these variables are not set")
        }
        setRoomId(roomCode);
    };

    const displayError = error || wsError;


    const hasGameStarted = !!publicGameState && (
        publicGameState.game_started
    );

    // If game has started, show Room component
    if (hasGameStarted && privateGameState) {
        return <Room publicGameState={publicGameState} privateGameState={privateGameState} roomId={roomId} userName={userName} />;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            {!roomId ? (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="userName" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Your Name:
                        </label>
                        <input
                            id="userName"
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                fontSize: '1rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    {(isCreateRoom && !roomCreated) ? (
                        <div className="create-room-container">
                            <h1 style={{ marginBottom: '1rem' }}>Create Room</h1>
                            <button
                                className="create-button"
                                onClick={handleCreateRoom}
                                disabled={isLoading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '1rem',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                            >
                                {isLoading ? "Creating..." : "Create Room"}
                            </button>
                        </div>
                    ) : (
                        <div className="join-room-container">
                            <h1 style={{ marginBottom: '1rem' }}>Join Room</h1>
                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="roomCode" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Room Code:
                                </label>
                                <input
                                    id="roomCode"
                                    type="text"
                                    placeholder="Enter Room Code"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <button
                                className="join-button"
                                onClick={handleJoinRoom}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '1rem',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Join
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="waiting-room">
                    <h1 style={{ marginBottom: '1rem' }}>Waiting for Players</h1>
                    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                        <p><strong>Room Code:</strong> {roomCode}</p>
                        <p><strong>Your Name:</strong> {userName}</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <p>
                            Connection Status: {isConnected ? (
                                <span style={{ color: 'green' }}>Connected</span>
                            ) : (
                                <span style={{ color: 'orange' }}>Connecting...</span>
                            )}
                        </p>
                        {publicGameState && (
                            <p>
                                Players: {publicGameState.current_players || 0} / 4
                            </p>
                        )}
                    </div>
                    {publicGameState && !hasGameStarted && (
                        <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                            <p>Waiting for more players to join...</p>
                            <p>Current players: {publicGameState.current_players || 0} / 4</p>
                        </div>
                    )}
                </div>
            )}

            {displayError && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px'
                }}>
                    {displayError}
                </div>
            )}

            <Dialog open={idModal} onClose={handleCloseModal}>
                <DialogTitle>Room Created 🎉</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Share this Room ID with your friends:
                    </DialogContentText>

                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        {createdRoomId}
                    </div>
                </DialogContent>
                <DialogActions>
                    <button
                        onClick={handleCloseModal}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        OK
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Lobby;