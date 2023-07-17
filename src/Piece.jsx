import React from 'react';

const Piece = ({ type, color }) => {
    const spriteMap = {
        'pawn': { 'light': '0px 0px', 'dark': '0px -32px' },
        'bishop': { 'light': '-16px 0px', 'dark': '-16px -32px' },
        'king': { 'light': '-32px 0px', 'dark': '-32px -32px' },
        'rook': { 'light': '0px -16px', 'dark': '0px -48px' },
        'knight': { 'light': '-16px -16px', 'dark': '-16px -48px' },
        'queen': { 'light': '-32px -16px', 'dark': '-32px -48px' },
    };

    const spritePosition = spriteMap[type][color];

    return (
        <div className='piece' style={{ backgroundPosition: spritePosition }}/>
    );
};

export default Piece;
