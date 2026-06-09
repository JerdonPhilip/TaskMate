import React from 'react';
import { KanbanBoard } from './components/board/KanbanBoard';
import { useProgression } from './hooks/useProgression';

function App() {
  // Initialize progression system
  useProgression();

  return (
    <div className="min-h-screen bg-gray-900">
      <KanbanBoard />
    </div>
  );
}

export default App;