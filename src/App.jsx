import './App.css';
import Board from './Board';

function App() {
  return (
    <div>
      <h1>React Chess</h1>
      <Board />
      <button style={{marginTop: '20px'}}>Start Game</button>
    </div>

  );
}

export default App;
