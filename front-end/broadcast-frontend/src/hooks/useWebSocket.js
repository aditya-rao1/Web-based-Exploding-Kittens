import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

/**
 * WebSocket hook for joining a game room.
 * - Does NOT auto-connect
 * - Caller must explicitly call connect()
 */
export function useWebSocket(roomId, userName) {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(false);

  const connect = useCallback(() => {
    if (!roomId || !userName) {
      console.warn('Missing roomId or userName — cannot connect');
      return;
    }

    // Prevent duplicate connections
    if (wsRef.current) {
      wsRef.current.close();
    }

    shouldReconnectRef.current = true;

    const wsUrl = `${WS_BASE_URL}/connect?room_id=${roomId}&user_name=${encodeURIComponent(
      userName
    )}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      //send intial player join message 
      const playerInitial = {
        'event' : 'PLAYER_JOINED'
      }
      ws.send(JSON.stringify(playerInitial))
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received game state:', message);

        // Derive a basic "game started" flag when the backend begins
        // sending turn/deck information, so the UI can switch views
        // even if the backend does not explicitly set game_started yet.

        const hasTurnInfo =
          Boolean(message.current_player_turn) || Boolean(message.deck_size);
        console.log("Has turn info flag is " + hasTurnInfo)
        const normalized = {
          ...message,
          game_started: Boolean(message.game_started) ?? hasTurnInfo,
        };
        console.log("Normalized object: " + Boolean(message.game_started) ?? hasTurnInfo)
        // Initial game state
        setGameState(normalized);
        console.log("State setter called with:", normalized);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      console.error('WebSocket error occurred');
      setError('WebSocket connection error');
      ws.close(); // ensure onclose fires
    };

    ws.onclose = (event) => {
      console.log(
        'WebSocket disconnected',
        `code=${event.code}`,
        `reason=${event.reason}`
      );

      setIsConnected(false);

      if (shouldReconnectRef.current && event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting WebSocket reconnect...');
          connect();
        }, 3000);
      }
    };

    wsRef.current = ws;
  }, [roomId, userName]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnected');
      wsRef.current = null;
    }

    setIsConnected(false);
    setGameState(null);
  }, []);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    gameState,
    error,
    connect,    // explicitly join room
    disconnect // explicitly leave room
  };
}

/**
 * HTTP-only room creation. No web sockets
 */
export async function createRoom() {
  const response = await fetch(`${API_BASE_URL}/create-room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to create room: ${response.statusText}`);
  }

  return response.json();
}
