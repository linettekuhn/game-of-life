import styles from "./App.module.css";
import GameOfLife from "./components/GameOfLife";

function App() {
  return (
    <div className={styles.main}>
      <div className={styles.info}>
        <h1>This is Game of Life</h1>
        <h2>by: Linette Kühn</h2>
        <div className={styles.about}>
          <p>
            This Game of Life implementation began as a C++ desktop application
            built with wxWidgets.
          </p>
          <p>
            It was later recompiled as a WebAssembly module using Emscripten,
            allowing the core C++ logic to run directly in the browser with a
            modern React interface.
          </p>
        </div>
      </div>
      <div className={styles.gameOfLife}>
        <GameOfLife />
      </div>
    </div>
  );
}

export default App;
