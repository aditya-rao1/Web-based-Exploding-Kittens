import GameCard from './GameCard';
import { useState, useEffect } from 'react';

function Room({ publicGameState, privateGameState, roomId, userName, sendToServer }) {
    const isGameStarted =
        !!publicGameState &&
        (publicGameState.game_started ||
            Boolean(publicGameState.current_turn_player_id) ||
            Boolean(publicGameState.turn_order));
    
    const [currentCard, setCurrentCard] = useState([])
    const [playerHand, setPlayerHand] = useState([]);
    const [publicDeck, setPublicDeck] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState(null);
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
    
    if (!isGameStarted) {
        return (
            <div style={{ padding: '2rem' }}>
                <p>Waiting for game to start...</p>
            </div>
        );
    }

    // Update the public deck
    useEffect(() => {
        console.log("Public updates: ")
        updatePublicDeck()
        updateCurrentPlayerTurn()
        updateDsicardPile()
        console.log("Public deck: ", publicDeck)
        console.log("Public current player: ", currentPlayerTurn)
        console.log("Public discard pile: ", discardPile)
    }, [publicGameState]);


    // Update the player's private hand
    useEffect(() => {
        console.log("Updating hand since private game state has changed")
        updateInitialHand()
    }, [privateGameState]);


    function handlePlay(cardToPlay) {
        const current_player_state = privateGameState.player_game_state
        if(current_player_state.player_id === currentPlayerTurn && cardToPlay != null) {
            const cardPlayedEvent = {
                'event' : 'CARD_PLAYED', 
                'current_player_id' : publicGameState.public_game_state.current_turn_player_id, 
                'card_played' : cardToPlay,
                'current_player_state' : privateGameState.player_game_state
            }
            sendToServer(cardPlayedEvent)
            console.log("Sent playing card event to server: ", cardPlayedEvent)
        }   
        else  {
            console.error("Playing card failed")
        }
    }

    function handleDraw(cardToDraw) {
        const current_player_state = privateGameState.player_game_state
        if(current_player_state.player_id === currentPlayerTurn) {
            const cardDrawedEvent = {
                'event' : 'CARD_DRAWN', 
                'current_player_id' : publicGameState.public_game_state.current_turn_player_id, 
                'card_drawn' : cardToDraw,
                'current_player_state' : privateGameState.player_game_state
            } 
            sendToServer(cardDrawedEvent)
            console.log("Sent drawing card event to server ", cardDrawedEvent)
        }
        
    }
    
    function updateInitialHand() {
        if (privateGameState?.player_game_state?.player_cards) {
            setPlayerHand(privateGameState.player_game_state.player_cards);
        }
    }

    function updatePublicDeck() {
        if (publicGameState?.public_game_state?.deck) {
            setPublicDeck(publicGameState.public_game_state.deck);
        }
    } 
    
    function updateDsicardPile() {
        if(publicGameState?.public_game_state?.discard_pile) {
            setDiscardPile(publicGameState.public_game_state.discard_pile);
        }
    }
    
    function updateCurrentPlayerTurn() {
        if (publicGameState?.public_game_state?.current_turn_player_id) {
            setCurrentPlayerTurn(publicGameState.public_game_state.current_turn_player_id)
        }
        console.log("The current player's turn is ", currentPlayerTurn)
    }
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
                    {currentPlayerTurn
                        ? `Player ${String(currentPlayerTurn)}`
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
                            {/* Face-down deck stack */}
                            <div
                                style={{
                                    position: 'relative',
                                    width: '60px',
                                    height: '90px',
                                }}
                            >
                                {publicDeck.map((card, index) => {
                                    // Keep the visible stack compact while still rendering
                                    // multiple cards for depth.
                                    const stackIndex = Math.min(index, 7);
                                    return (
                                        <div
                                            key={`${card}-${index}`}
                                            style={{
                                                position: 'absolute',
                                                top: `${stackIndex * 2}px`,
                                                left: `${stackIndex * 1}px`,
                                                zIndex: stackIndex,
                                            }}
                                        >
                                            <GameCard
                                                cardType={card}
                                                isFaceDown={true}
                                                onClick={() => handleDraw(card)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
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
                            {discardPile.length === 0 ? (
                                <span>No cards discarded yet</span>
                            ) : (
                                discardPile
                                    .slice(-1) 
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
                        <GameCard key={`${card}-${index}`} cardType={card} onClick={() => handlePlay(card)}/>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Room;
