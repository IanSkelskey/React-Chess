function MoveHistory({ moves }) {
    const toAlgebraicNotation = ({ i, j }) => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        return `${files[j]}${8 - i}`;
    };

    return (
        <div className='move-history'>
            <h2>Move History</h2>
            <ol>
                {moves.map((move, index) => (
                    <li key={index}>
                        {move.piece.color} {move.piece.type} moved from {toAlgebraicNotation(move.start)} to {toAlgebraicNotation(move.end)}
                        {move.capturedPiece && ` and captured ${move.capturedPiece.color} ${move.capturedPiece.type}`}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default MoveHistory;