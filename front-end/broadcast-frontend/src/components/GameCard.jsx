import React from 'react';

const CARD_ABBREVIATIONS = {
  NOPE: 'N',
  ATTACK: 'A',
  DEFUSE: 'D',
  SHUFFLE: 'S',
  FAVOR: 'F',
  DRAW_FROM_BOTTOM: 'B',
  SEE_THE_FUTURE: 'FUT',
  SKIP: 'SK',
  EXPLODING_KITTEN: 'EK',
  CAT_CARD: 'C',
};

function getAbbreviation(cardType) {
  if (!cardType) {
    return '?';
  }
  const upper = String(cardType).toUpperCase();
  return CARD_ABBREVIATIONS[upper] || upper.charAt(0);
}

function GameCard({ cardType, isFaceDown = false, onClick }) {
  const displayText = isFaceDown ? 'Deck' : getAbbreviation(cardType);
  const title = isFaceDown ? 'Deck' : String(cardType);

  return (
    <div
      onClick={onClick}
      title={title}
      style={{
        width: '60px',
        height: '90px',
        borderRadius: '8px',
        border: '2px solid #333',
        backgroundColor: isFaceDown ? '#333' : '#fff',
        color: isFaceDown ? '#fff' : '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {displayText}
    </div>
  );
}

export default GameCard;

