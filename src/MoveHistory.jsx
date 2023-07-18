function MoveHistory({ moves }) {
    const toAlgebraicNotation = ({ i, j }) => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return `${files[j]}${8 - i}`;
    };

    const determineKingSideOrQueenSide = (rook) => {
        return rook.start.j === 0 ? 'queen' : 'king';
    };

    return (
        <div className='move-history'>
            <h2>Move History</h2>
            <ol style={{textAlign: 'left'}}>
                {moves.map((move, index) => (
                    <li key={index}>
                        {move.piece.color} {move.piece.type} moved from {toAlgebraicNotation(move.start)} to {toAlgebraicNotation(move.end)}
                        {(move.enPassant && ` and captured ${move.capturedPiece.color} pawn en passant`) || move.capturedPiece && ` and captured ${move.capturedPiece.color} ${move.capturedPiece.type}`}                        
                        {move.rook && ` and castled with the ${determineKingSideOrQueenSide(move.rook)} side rook`}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default MoveHistory;