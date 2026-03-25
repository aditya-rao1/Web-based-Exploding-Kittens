import GameCard from './GameCard';
import { useState, useEffect } from 'react';

function Room({ publicGameState, privateGameState, roomId, userName }) {
    const isGameStarted =
        !!publicGameState &&
        (publicGameState.game_started ||
            Boolean(publicGameState.current_turn_player_id) ||
            Boolean(publicGameState.turn_order));
    
    const [playerHand, setPlayerHand] = useState([]);
    if (!isGameStarted) {
        return (
            <div style={{ padding: '2rem' }}>
                <p>Waiting for game to start...</p>
            </div>
        );
    }


    useEffect(() => {
        console.log("Updating hand since private game state has changed")
        updateInitialHand()
    }, [privateGameState]);

    
    function updateInitialHand() {
        if (privateGameState?.player_game_state?.player_cards) {
            setPlayerHand(privateGameState.player_game_state.player_cards);
        }
    }
    
    const {
        turn_order,
        current_turn_player_id,
        deck,
        deck_size,
        discard_pile,
    } = publicGameState || {};

    const visibleDeckCount =
        typeof deck_size === 'number'
            ? deck_size
            : Array.isArray(deck)
            ? deck.length
            : 0;

    const visibleDiscardPile = Array.isArray(discard_pile) ? discard_pile : [];
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                boxSizing: 'border-box',
            }}
        >
            {/* Top: game info */}
            <div
                style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f78b0fc5',
                    borderRadius: '4px',
                }}
            >
                <h1 style={{ marginBottom: '0.5rem' }}>
                    Exploding Kittens
                </h1>
                <p>
                    <strong>Room ID:</strong> {roomId}
                </p>
                <p>
                    <strong>Your Name:</strong> {userName}
                </p>
                <p>
                    <strong>Current Turn:</strong>{' '}
                    {current_turn_player_id
                        ? `Player ${String(current_turn_player_id)}`
                        : 'Unknown'}
                </p>
            </div>

            {/* Middle: deck + discard + (optional) turn order summary */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3rem',
                    }}
                >
                    {/* Deck area */}
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Deck</h3>
                        <div
                            style={{
                                position: 'relative',
                                width: '60px',
                                height: '90px',
                            }}
                        >
                            {/* Single visible card representing the deck */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                            >
                                <GameCard isFaceDown cardType={null} />
                            </div>
                        </div>
                        <p style={{ marginTop: '0.5rem' }}>
                            Cards remaining: {visibleDeckCount}
                        </p>
                    </div>

                    {/* Discard pile area */}
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Discard Pile</h3>
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                justifyContent: 'center',
                            }}
                        >
                            {visibleDiscardPile.length === 0 ? (
                                <span>No cards discarded yet</span>
                            ) : (
                                visibleDiscardPile
                                    .slice(-3)
                                    .map((card, index) => (
                                        <GameCard
                                            key={`${card}-${index}`}
                                            cardType={card.card_type || card}
                                            isFaceDown={false}
                                        />
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Optional simple turn order display if present */}
                {Array.isArray(turn_order) && turn_order.length > 0 && (
                    <div
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#e3f2fd40',
                            borderRadius: '4px',
                            minWidth: '280px',
                        }}
                    >
                        <h3 style={{ marginBottom: '0.5rem' }}>Turn Order</h3>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                            }}
                        >
                            {turn_order.map((playerId, index) => (
                                <div
                                    key={playerId}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        border:
                                            playerId === current_turn_player_id
                                                ? '2px solid #ffc107'
                                                : '1px solid #dee2e6',
                                        backgroundColor:
                                            playerId === current_turn_player_id
                                                ? '#fff3cd26'
                                                : '#f8f9fa48',
                                    }}
                                >
                                    {index + 1}. Player{' '}
                                    {String(playerId).substring(0, 8)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom: player hand(PRIVATE) */}
            <div
                style={{
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                }}
            >
                <h3 style={{ marginBottom: '0.5rem' }}>Your Hand</h3>
                <div
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        paddingBottom: '0.25rem',
                    }}
                >
                    {playerHand.map((card, index) => (
                        <GameCard key={`${card}-${index}`} cardType={card} />
                    ))}
                </div>
                <p
                    style={{
                        marginTop: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#555',
                    }}
                >
                    This is an initial placeholder hand. Future iterations will
                    show your real cards from the server.
                </p>
            </div>
        </div>
    );
}

export default Room;
