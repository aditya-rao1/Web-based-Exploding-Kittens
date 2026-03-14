import React from 'react';

function Room({ gameState, roomId, userName }) {
    if (!gameState || !gameState.game_started) {
        return (
            <div style={{ padding: '2rem' }}>
                <p>Waiting for game to start...</p>
            </div>
        );
    }

    const { turn_order, current_turn_player_id } = gameState;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1rem' }}>Exploding Kittens - Game Started!</h1>
            
            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f78b0fc5', borderRadius: '4px' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Game Information</h2>
                <p><strong>Room ID:</strong> {roomId}</p>
                <p><strong>Your Name:</strong> {userName}</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Turn Order</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {turn_order && turn_order.map((playerId, index) => (
                        <div
                            key={playerId}
                            style={{
                                padding: '0.75rem',
                                backgroundColor: playerId === current_turn_player_id ? '#fff3cd26' : '#f8f9fa48',
                                border: playerId === current_turn_player_id ? '2px solid #ffc107' : '1px solid #dee2e6',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span>
                                {index + 1}. Player {playerId.substring(0, 8)}
                                {playerId === current_turn_player_id && (
                                    <span style={{ marginLeft: '0.5rem', color: '#856404' }}>← Current Turn</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#e3f2fd40', borderRadius: '4px' }}>
                <p><strong>Current Turn:</strong> Player {current_turn_player_id?.substring(0, 8) || 'Unknown'}</p>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}>
                    <strong>Note:</strong> This is the initial game state. Game logic and card interactions will be implemented next.
                </p>
            </div>
        </div>
    );
}

export default Room;
