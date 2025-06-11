document.addEventListener('DOMContentLoaded', () => {
  let isMuted = localStorage.getItem('isMuted') === 'true' || true; // Muted for testing
  const statusElements = {
    memory: document.getElementById('memoryStatus'),
    tictactoe: document.getElementById('tictactoeStatus'),
    rps: document.getElementById('rpsStatus')
  };

  window.showGames = function() {
    try {
      const gameSection = document.getElementById('gameSection');
      const noMessage = document.getElementById('noMessage');
      if (!gameSection || !noMessage) {
        throw new Error('Game section or no message element missing');
      }
      gameSection.style.display = 'block';
      noMessage.style.display = 'none';
      updateScores();
    } catch (e) {
      console.error('Show games failed:', e);
      alert('Failed to load games. Ensure games.js is loaded and refresh the page.');
    }
  };

  window.showNoMessage = function() {
    try {
      const gameSection = document.getElementById('gameSection');
      const noMessage = document.getElementById('noMessage');
      if (!gameSection || !noMessage) {
        throw new Error('Game section or no message element missing');
      }
      gameSection.style.display = 'none';
      noMessage.style.display = 'block';
    } catch (e) {
      console.error('Show no message failed:', e);
      alert('Failed to show message. Please refresh.');
    }
  };

  window.goBack = function() {
    try {
      window.location.href = 'index.html';
    } catch (e) {
      console.error('Navigation failed:', e);
      alert('Unable to navigate back. Ensure index.html exists and refresh.');
    }
  };

  function playSound(id) {
    if (!isMuted) {
      try {
        const audio = document.getElementById(id);
        if (audio) {
          audio.play().catch(() => console.log('Sound blocked'));
        }
      } catch (e) {
        console.error('Sound error:', e);
      }
    }
  }

  function showError(game, message) {
    if (statusElements[game]) {
      statusElements[game].textContent = message;
    }
    console.error(`Error in ${game}: ${message}`);
  }

  function createConfetti() {
    try {
      for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.background = ['#ff5e62', '#40c4ff', '#ffeb3b'][Math.floor(Math.random() * 3)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }
    } catch (e) {
      console.error('Confetti error:', e);
    }
  }

  // Scoreboard
  function updateScores() {
    try {
      let scores = JSON.parse(localStorage.getItem('scores') || '{"memoryHuman":0,"memoryAI":0,"tictactoeHuman":0,"tictactoeAI":0,"rpsHuman":0,"rpsAI":0,"memoryLastWin":"-","tictactoeLast":"-","rpsLast":"-"}');
      const elements = {
        memoryHumanScore: 'memoryHuman',
        memoryAIScore: 'memoryAI',
        tictactoeHumanScore: 'tictactoeHuman',
        tictactoeAIScore: 'tictactoeAI',
        rpsHumanScore: 'rpsHuman',
        rpsAIScore: 'rpsAI',
        memoryscoreboard: 'memoryLastWin',
        tictactoeLastWin: 'tictactoeLast',
        rpsLastWin: 'rpsLastWin'
      };
      for (let id in elements) {
        const el = document.getElementById(id);
        if (el) {
          el.textContent = scores[elements[id]];
        }
      }
      checkAllGamesWon();
    } catch (e) {
      console.error('Scoreboard update failed:', e);
    }
  }

  function saveScore(game, player) {
    try {
      let scores = JSON.parse(localStorage.getItem('scores') || '{"memoryHuman":0,"memoryAI":0,"tictactoeHuman":0,"tictactoeAI":0,"rpsHuman":0,"rpsAI":0,"memoryLast":"-","tictactoeLast":"-","rpsLast":"-"}');
      scores[`${game}${player}`]++;
      scores[`${game}LastWin`] = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi' });
      localStorage.setItem('scores', JSON.stringify(scores));
      updateScores();
    } catch (e) {
      console.error('Score save failed:', e);
    }
  }

  window.resetScoreboard = function() {
    try {
      localStorage.setItem('scores', '{"memoryHuman":0,"memoryAI":0,"tictactoeHuman":0,"tictactoeAI":0,"rpsHuman":0,"rpsAI":0,"memoryLast":"-","tictactoeLast":"-","rpsLast":"-"}');
      updateScores();
    } catch (e) {
      console.error('Scoreboard reset failed:', e);
      alert('Failed to reset scores. Please refresh.');
    }
  };

  function checkAllGamesWon() {
    try {
      let scores = JSON.parse(localStorage.getItem('scores') || '{"memoryHuman":0,"memoryAI":0,"tictactoeHuman":0,"tictactoeAI":0,"rpsHuman":0,"rpsAI":0,"memoryLast":"-","tictactoeLast":"-","rpsLast":"-"}');
      if (scores.memoryHuman > 0 && scores.tictactoeHuman > 0 && scores.rpsHuman > 0) {
        const modal = document.getElementById('celebrationModal');
        if (modal) {
          modal.style.display = 'flex';
          createConfetti();
          playSound('winSound');
        }
      }
    } catch (e) {
      console.error('Check all games won failed:', e);
    }
  }

  window.closeCelebration = function() {
    try {
      const modal = document.getElementById('celebrationModal');
      if (modal) {
        modal.style.display = 'none';
      }
    } catch (e) {
      console.error('Close celebration failed:', e);
    }
  };

  // Memory Game
  let memoryCards = ['🎈', '🎈', '🎂', '🎂', '🎁', '🎁', '🎉', '🎉', '🎊', '🎊', '🎶', '🎶', '🌟', '🌟', '🍰', '🍰', '🎇', '🎇', '🎆', '🎆', '🥳', '🥳', '🎈🎉', '🎈🎉'];
  let memoryState = { first: null, second: null, locked: false, moves: 0, ai: true, known: {}, aiTimeout: null };

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function initMemory() {
    try {
      const grid = document.getElementById('memoryGrid');
      if (!grid) throw new Error('Memory grid not found');
      grid.innerHTML = '';
      shuffle(memoryCards);
      memoryState = { first: null, second: null, locked: false, moves: 0, ai: document.getElementById('memoryAIToggle').checked, known: {}, aiTimeout: null };
      statusElements.memory.textContent = `Match all pairs! Moves: ${memoryState.moves}`;
      grid.addEventListener('click', memoryClickHandler);
      memoryCards.forEach((symbol, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = idx;
        card.innerHTML = `
          <div class="card-inner">
            <div class="card-front"></div>
            <div class="card-back">${symbol}</div>
          </div>
        `;
        grid.appendChild(card);
      });
      if (memoryState.ai) {
        memoryState.aiTimeout = setTimeout(aiMemory, 600);
      }
    } catch (e) {
      showError('memory', 'Failed to load game. Please refresh.');
      console.error('Memory init error:', e);
    }
  }

  function memoryClickHandler(e) {
    const card = e.target.closest('.card');
    if (!card || memoryState.locked || card.classList.contains('flipped') || memoryState.ai) return;
    const idx = parseInt(card.dataset.index);
    flipMemoryCard(card, idx);
  }

  function flipMemoryCard(card, idx) {
    try {
      card.classList.add('flipped');
      playSound('flipSound');
      memoryState.moves++;
      statusElements.memory.textContent = `Match all pairs! Moves: ${memoryState.moves}`;
      memoryState.known[memoryCards[idx]] = memoryState.known[memoryCards[idx]] || [];
      if (!memoryState.known[memoryCards[idx]].includes(idx)) {
        memoryState.known[memoryCards[idx]].push(idx);
      }
      if (!memoryState.first) {
        memoryState.first = { card, idx, symbol: memoryCards[idx] };
      } else {
        memoryState.second = { card, idx, symbol: memoryCards[idx] };
        checkMemoryMatch();
      }
      if (memoryState.ai && !memoryState.locked) {
        memoryState.aiTimeout = setTimeout(aiMemory, 600);
      }
    } catch (e) {
      showError('memory', 'Error flipping card.');
      console.error('Memory flip error:', e);
    }
  }

  function aiMemory() {
    try {
      if (memoryState.locked || !memoryState.ai) return;
      memoryState.locked = true;
      const unflipped = Array.from(document.querySelectorAll('.card:not(.flipped)')).map(c => parseInt(c.dataset.index));
      if (unflipped.length < 2) {
        memoryState.locked = false;
        return;
      }
      let idx1 = null, idx2 = null;
      for (let symbol in memoryState.known) {
        const indices = memoryState.known[symbol].filter(i => unflipped.includes(i));
        if (indices.length >= 2) {
          idx1 = indices[0];
          idx2 = indices[1];
          break;
        }
      }
      if (!idx1) {
        idx1 = unflipped[Math.floor(Math.random() * unflipped.length)];
        unflipped.splice(unflipped.indexOf(idx1), 1);
        idx2 = unflipped[Math.floor(Math.random() * unflipped.length)];
      }
      const card1 = document.querySelector(`.card[data-index="${idx1}"]`);
      if (!card1) throw new Error('Card1 not found');
      card1.classList.add('flipped');
      playSound('flipSound');
      memoryState.known[memoryCards[idx1]] = memoryState.known[memoryCards[idx1]] || [];
      if (!memoryState.known[memoryCards[idx1]].includes(idx1)) {
        memoryState.known[memoryCards[idx1]].push(idx1);
      }
      memoryState.first = { card: card1, idx: idx1, symbol: memoryCards[idx1] };
      setTimeout(() => {
        const card2 = document.querySelector(`.card[data-index="${idx2}"]`);
        if (!card2) throw new Error('Card2 not found');
        card2.classList.add('flipped');
        playSound('flipSound');
        memoryState.known[memoryCards[idx2]] = memoryState.known[memoryCards[idx2]] || [];
        if (!memoryState.known[memoryCards[idx2]].includes(idx2)) {
          memoryState.known[memoryCards[idx2]].push(idx2);
        }
        memoryState.second = { card: card2, idx: idx2, symbol: memoryCards[idx2] };
        checkMemoryMatch(true);
        if (!memoryState.locked && memoryState.ai) {
          memoryState.aiTimeout = setTimeout(aiMemory, 600);
        }
      }, 600);
    } catch (e) {
      showError('memory', 'AI move failed.');
      console.error('Memory AI error:', e);
      memoryState.locked = false;
    }
  }

  function checkMemoryMatch(isAI = false) {
    try {
      memoryState.locked = true;
      if (memoryState.first.symbol === memoryState.second.symbol) {
        memoryState.first = null;
        memoryState.second = null;
        memoryState.locked = false;
        checkMemoryWin(isAI);
      } else {
        setTimeout(() => {
          if (memoryState.first && memoryState.second) {
            memoryState.first.card.classList.remove('flipped');
            memoryState.second.card.classList.remove('flipped');
            memoryState.first = null;
            memoryState.second = null;
            memoryState.locked = false;
            if (memoryState.ai && !isAI) {
              memoryState.aiTimeout = setTimeout(aiMemory, 600);
            }
          }
        }, 600);
      }
    } catch (e) {
      showError('memory', 'Error checking match.');
      console.error('Memory match error:', e);
      memoryState.locked = false;
    }
  }

  function checkMemoryWin(isAI) {
    try {
      if (document.querySelectorAll('.card.flipped').length === memoryCards.length) {
        statusElements.memory.textContent = `You won! Moves: ${memoryState.moves}`;
        saveScore('memory', isAI ? 'AI' : 'Human');
        createConfetti();
        playSound('winSound');
        clearTimeout(memoryState.aiTimeout);
      }
    } catch (e) {
      showError('memory', 'Error checking win.');
      console.error('Memory win error:', e);
    }
  }

  window.resetMemoryGame = function() {
    try {
      clearTimeout(memoryState.aiTimeout);
      initMemory();
    } catch (e) {
      showError('memory', 'Reset failed. Please refresh.');
      console.error('Memory reset error:', e);
    }
  };

  window.toggleMemoryAI = function() {
    try {
      memoryState.ai = document.getElementById('memoryAIToggle').checked;
      resetMemoryGame();
    } catch (e) {
      showError('memory', 'AI toggle failed.');
      console.error('Memory AI toggle error:', e);
    }
  };

  // Tic Tac Toe
  let tictactoeState = { board: ['', '', '', '', '', '', '', '', ''], player: 'X', ai: true, gameOver: false };

  function initTictactoe() {
    try {
      const grid = document.getElementById('tictactoeGrid');
      if (!grid) throw new Error('Tictactoe grid not found');
      grid.innerHTML = '';
      tictactoeState = { board: ['', '', '', '', '', '', '', '', ''], player: 'X', ai: document.getElementById('tictactoeAIToggle').checked, gameOver: false };
      statusElements.tictactoe.textContent = `Your turn (X)`;
      grid.addEventListener('click', tictactoeClickHandler);
      for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        grid.appendChild(cell);
      }
      if (tictactoeState.ai && tictactoeState.player === 'O') {
        setTimeout(aiTictactoe, 400);
      }
    } catch (e) {
      showError('tictactoe', 'Failed to load game. Please refresh.');
      console.error('Tictactoe init error:', e);
    }
  }

  function tictactoeClickHandler(e) {
    const cell = e.target.closest('.cell');
    if (!cell || tictactoeState.board[cell.dataset.index] || tictactoeState.gameOver || (tictactoeState.ai && tictactoeState.player === 'O')) return;
    makeTictactoeMove(cell, parseInt(cell.dataset.index));
  }

  function makeTictactoeMove(cell, idx) {
    try {
      tictactoeState.board[idx] = tictactoeState.player;
      cell.textContent = tictactoeState.player;
      playSound('clickSound');
      if (checkTictactoeWin()) {
        statusElements.tictactoe.textContent = `${tictactoeState.player} wins!`;
        saveScore('tictactoe', tictactoeState.player === 'X' ? 'Human' : 'AI');
        drawWinLine();
        createConfetti();
        playSound('winSound');
        tictactoeState.gameOver = true;
      } else if (tictactoeState.board.every(c => c)) {
        statusElements.tictactoe.textContent = 'Draw!';
        tictactoeState.gameOver = true;
      } else {
        tictactoeState.player = tictactoeState.player === 'X' ? 'O' : 'X';
        statusElements.tictactoe.textContent = `Your turn (${tictactoeState.player})`;
        if (tictactoeState.ai && tictactoeState.player === 'O') {
          setTimeout(aiTictactoe, 400);
        }
      }
    } catch (e) {
      showError('tictactoe', 'Move failed.');
      console.error('Tictactoe move error:', e);
    }
  }

  function aiTictactoe() {
    try {
      if (tictactoeState.gameOver) return;
      const move = minimax(tictactoeState.board, 'O').index;
      const cell = document.querySelector(`.cell[data-index="${move}"]`);
      makeTictactoeMove(cell, move);
    } catch (e) {
      showError('tictactoe', 'AI move failed.');
      console.error('Tictactoe AI error:', e);
    }
  }

  function minimax(board, player) {
    const avail = board.map((c, i) => c === '' ? i : null).filter(i => i !== null);
    if (checkTictactoeWin(board, 'X')) return { score: -10 };
    if (checkTictactoeWin(board, 'O')) return { score: 10 };
    if (avail.length === 0) return { score: 0 };

    const moves = [];
    for (let i of avail) {
      const move = { index: i };
      board[i] = player;
      move.score = minimax(board, player === 'O' ? 'X' : 'O').score;
      board[i] = '';
      moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  }

  function checkTictactoeWin(board = tictactoeState.board, player = tictactoeState.player) {
    const wins = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    return wins.some(w => w.every(i => board[i] === player));
  }

  function drawWinLine() {
    try {
      const wins = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
      const grid = document.getElementById('tictactoeGrid');
      for (let w of wins) {
        if (w.every(i => tictactoeState.board[i] === tictactoeState.player)) {
          const line = document.createElement('div');
          line.className = 'win-line';
          const cells = grid.getElementsByClassName('cell');
          const start = cells[w[0]].getBoundingClientRect();
          const end = cells[w[2]].getBoundingClientRect();
          const gridRect = grid.getBoundingClientRect();
          if (w[0] === 0 && w[2] === 2) {
            line.style.width = `${end.right - start.left}px`;
            line.style.height = '4px';
            line.style.top = `${start.top - gridRect.top + start.height / 2}px`;
            line.style.left = `${start.left - gridRect.left}px`;
          } else if (w[0] === 3 && w[2] === 5) {
            line.style.width = `${end.right - start.left}px`;
            line.style.height = '4px';
            line.style.top = `${start.top - gridRect.top + start.height / 2}px`;
            line.style.left = `${start.left - gridRect.left}px`;
          } else if (w[0] === 6 && w[2] === 8) {
            line.style.width = `${end.right - start.left}px`;
            line.style.height = '4px';
            line.style.top = `${start.top - gridRect.top + start.height / 2}px`;
            line.style.left = `${start.left - gridRect.left}px`;
          } else if (w[0] === 0 && w[2] === 6) {
            line.style.width = '4px';
            line.style.height = `${end.bottom - start.top}px`;
            line.style.top = `${start.top - gridRect.top}px`;
            line.style.left = `${start.left - gridRect.left + start.width / 2}px`;
          } else if (w[0] === 1 && w[2] === 7) {
            line.style.width = '4px';
            line.style.height = `${end.bottom - start.top}px`;
            line.style.top = `${start.top - gridRect.top}px`;
            line.style.left = `${start.left - gridRect.left + start.width / 2}px`;
          } else if (w[0] === 2 && w[2] === 8) {
            line.style.width = '4px';
            line.style.height = `${end.bottom - start.top}px`;
            line.style.top = `${start.top - gridRect.top}px`;
            line.style.left = `${start.left - gridRect.left + start.width / 2}px`;
          } else if (w[0] === 0 && w[2] === 8) {
            line.style.width = `${Math.hypot(end.right - start.left, end.bottom - start.top)}px`;
            line.style.height = '4px';
            line.style.top = `${start.top - gridRect.top + start.height / 2}px`;
            line.style.left = `${start.left - gridRect.left}px`;
            line.style.transform = 'rotate(45deg)';
            line.style.transformOrigin = 'left center';
          } else if (w[0] === 2 && w[2] === 6) {
            line.style.width = `${Math.hypot(start.right - end.left, start.top - end.bottom)}px`;
            line.style.height = '4px';
            line.style.top = `${start.top - gridRect.top + start.height / 2}px`;
            line.style.left = `${start.left - gridRect.left}px`;
            line.style.transform = 'rotate(-45deg)';
            line.style.transformOrigin = 'left center';
          }
          grid.appendChild(line);
          break;
        }
      }
    } catch (e) {
      console.error('Win line error:', e);
    }
  }

  window.resetTictactoeGame = function() {
    try {
      initTictactoe();
    } catch (e) {
      showError('tictactoe', 'Reset failed. Please refresh.');
      console.error('Tictactoe reset error:', e);
    }
  };

  window.toggleTictactoeAI = function() {
    try {
      tictactoeState.ai = document.getElementById('tictactoeAIToggle').checked;
      resetTictactoeGame();
    } catch (e) {
      showError('tictactoe', 'AI toggle failed.');
      console.error('Tictactoe AI toggle error:', e);
    }
  };

  // Rock Paper Scissors
  let rpsState = { playerScore: 0, computerScore: 0, gameOver: false };

  function initRPS() {
    try {
      rpsState = { playerScore: 0, computerScore: 0, gameOver: false };
      statusElements.rps.textContent = `Choose your move! Score: ${rpsState.playerScore}-${rpsState.computerScore}`;
    } catch (e) {
      showError('rps', 'Failed to load game. Please refresh.');
      console.error('RPS init error:', e);
    }
  }

  window.playRPS = function(playerChoice) {
    try {
      if (rpsState.gameOver) return;
      const choices = ['rock', 'paper', 'scissors'];
      const computerChoice = choices[Math.floor(Math.random() * 3)];
      let result = '';
      if (playerChoice === computerChoice) {
        result = `Tie! Both chose ${playerChoice} ✊🖐️✂️`;
      } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
      ) {
        rpsState.playerScore++;
        result = `You win! ${playerChoice} beats ${computerChoice}!`;
      } else {
        rpsState.computerScore++;
        result = `AI wins! ${computerChoice} beats ${playerChoice}!`;
      }
      statusElements.rps.textContent = `${result} Score: ${rpsState.playerScore}-${rpsState.computerScore}`;
      playSound('clickSound');
      if (rpsState.playerScore >= 3 || rpsState.computerScore >= 3) {
        rpsState.gameOver = true;
        if (rpsState.playerScore >= 3) {
          statusElements.rps.textContent = `You won the match! Final Score: ${rpsState.playerScore}-${rpsState.computerScore}`;
          saveScore('rps', 'Human');
        } else {
          statusElements.rps.textContent = `AI won the match! Final Score: ${rpsState.playerScore}-${rpsState.computerScore}`;
          saveScore('rps', 'AI');
        }
        createConfetti();
        playSound('winSound');
      }
    } catch (e) {
      showError('rps', 'Move failed.');
      console.error('RPS error:', e);
    }
  };

  window.resetRPSGame = function() {
    try {
      initRPS();
    } catch (e) {
      showError('rps', 'Reset failed. Please refresh.');
      console.error('RPS reset error:', e);
    }
  };

  // Global error handler
  window.onerror = (msg, url, line) => {
    console.error(`Global error: ${msg} at ${url}:${line}`);
    for (let game in statusElements) {
      showError(game, 'Something went wrong. Please refresh.');
    }
  };

  // Initialize
  try {
    if (!document.getElementById('memoryGrid')) throw new Error('Memory grid missing');
    if (!document.getElementById('tictactoeGrid')) throw new Error('Tictactoe grid missing');
    if (!document.getElementById('gameSection')) throw new Error('Game section missing');
    initMemory();
    initTictactoe();
    initRPS();
    updateScores();
  } catch (e) {
    console.error('Initialization error:', e);
    for (let game in statusElements) {
      showError(game, 'Games failed to load. Please refresh.');
    }
    alert('Failed to initialize games. Check console and refresh.');
  }
});