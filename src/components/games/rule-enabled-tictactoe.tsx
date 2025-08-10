// @ts-nocheck
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { GameRuleProvider, useRuleParameter, useRuleParameters, useGameLoop, RuleAwareGame } from '@/hooks/use-game-rules'
import { initializeTicTacToeRules } from '@/lib/game-rules/tictactoe-rules'
import { cn } from '@/lib/utils'

// Initialize tic-tac-toe rules
initializeTicTacToeRules()

interface TicTacToeGameProps {
  rules: Record<string, any>
}

type CellState = null | 'X' | 'O' | 'player3' | 'player4' | 'player5' | 'player6'
type GameState = 'playing' | 'won' | 'draw'

interface Player {
  id: string
  symbol: CellState
  name: string
  color: string
  score: number
}

export function TicTacToeGameCore({ rules }: TicTacToeGameProps) {
  // Extract rule parameters
  const board = rules['tictactoe-board-setup'] || {}
  const winConditions = rules['tictactoe-win-conditions'] || {}
  const players = rules['tictactoe-players'] || {}
  const mechanics = rules['tictactoe-mechanics'] || {}
  const powerups = rules['tictactoe-powerups'] || {}
  const visual = rules['tictactoe-visual-theme'] || {}
  const tournament = rules['tictactoe-tournament'] || {}
  const accessibility = rules['tictactoe-accessibility'] || {}

  // Game configuration
  const boardSize = board.boardSize || 3
  const rectangleWidth = board.rectangleWidth || 4
  const rectangleHeight = board.rectangleHeight || 3
  const actualWidth = board.boardShape === 'rectangle' ? rectangleWidth : boardSize
  const actualHeight = board.boardShape === 'rectangle' ? rectangleHeight : boardSize
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [gameBoard, setGameBoard] = useState<CellState[][]>(() => 
    Array(actualHeight).fill(null).map(() => Array(actualWidth).fill(null))
  )
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [winner, setWinner] = useState<Player | null>(null)
  const [winningCells, setWinningCells] = useState<[number, number][]>([])
  const [moveCount, setMoveCount] = useState(0)
  const [gameHistory, setGameHistory] = useState<string[]>([])

  // Tournament state
  const [matchScore, setMatchScore] = useState<Record<string, number>>({})
  const [gamesPlayed, setGamesPlayed] = useState(0)

  // Create players based on rules
  const gamePlayers = useMemo(() => {
    const numPlayers = players.numPlayers || 2
    const symbolStyle = players.playerSymbols || 'classic'
    
    const playerData: Player[] = []
    const symbols = getPlayerSymbols(symbolStyle, numPlayers)
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    
    for (let i = 0; i < numPlayers; i++) {
      playerData.push({
        id: `player${i + 1}`,
        symbol: symbols[i],
        name: `Player ${i + 1}`,
        color: colors[i % colors.length],
        score: matchScore[`player${i + 1}`] || 0
      })
    }
    
    return playerData
  }, [players.numPlayers, players.playerSymbols, matchScore])

  const currentPlayer = gamePlayers[currentPlayerIndex]

  // Get player symbols based on style
  function getPlayerSymbols(style: string, numPlayers: number): CellState[] {
    switch (style) {
      case 'shapes':
        return ['●', '■', '▲', '♦', '★', '◆'].slice(0, numPlayers) as CellState[]
      case 'colors':
        return ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'].slice(0, numPlayers) as CellState[]
      case 'numbers':
        return ['1', '2', '3', '4', '5', '6'].slice(0, numPlayers) as CellState[]
      case 'letters':
        return ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, numPlayers) as CellState[]
      case 'emojis':
        return ['😀', '😎', '🤖', '👽', '🦄', '🎯'].slice(0, numPlayers) as CellState[]
      default:
        return ['X', 'O', 'Z', 'Y', 'W', 'V'].slice(0, numPlayers) as CellState[]
    }
  }

  // Check for win condition
  const checkWin = useCallback((board: CellState[][], lastMove: [number, number], player: CellState): boolean => {
    const [row, col] = lastMove
    const winLength = winConditions.winLength || 3
    const allowDiagonal = winConditions.allowDiagonal !== false
    const allowVertical = winConditions.allowVertical !== false
    const allowHorizontal = winConditions.allowHorizontal !== false

    // Check horizontal
    if (allowHorizontal) {
      let count = 1
      const winCells: [number, number][] = [[row, col]]
      
      // Check left
      for (let c = col - 1; c >= 0 && board[row][c] === player; c--) {
        count++
        winCells.push([row, c])
      }
      
      // Check right
      for (let c = col + 1; c < actualWidth && board[row][c] === player; c++) {
        count++
        winCells.push([row, c])
      }
      
      if (count >= winLength) {
        setWinningCells(winCells)
        return true
      }
    }

    // Check vertical
    if (allowVertical) {
      let count = 1
      const winCells: [number, number][] = [[row, col]]
      
      // Check up
      for (let r = row - 1; r >= 0 && board[r][col] === player; r--) {
        count++
        winCells.push([r, col])
      }
      
      // Check down
      for (let r = row + 1; r < actualHeight && board[r][col] === player; r++) {
        count++
        winCells.push([r, col])
      }
      
      if (count >= winLength) {
        setWinningCells(winCells)
        return true
      }
    }

    // Check diagonal (top-left to bottom-right)
    if (allowDiagonal) {
      let count = 1
      const winCells: [number, number][] = [[row, col]]
      
      // Check up-left
      for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board[r][c] === player; r--, c--) {
        count++
        winCells.push([r, c])
      }
      
      // Check down-right
      for (let r = row + 1, c = col + 1; r < actualHeight && c < actualWidth && board[r][c] === player; r++, c++) {
        count++
        winCells.push([r, c])
      }
      
      if (count >= winLength) {
        setWinningCells(winCells)
        return true
      }
    }

    // Check diagonal (top-right to bottom-left)
    if (allowDiagonal) {
      let count = 1
      const winCells: [number, number][] = [[row, col]]
      
      // Check up-right
      for (let r = row - 1, c = col + 1; r >= 0 && c < actualWidth && board[r][c] === player; r--, c++) {
        count++
        winCells.push([r, c])
      }
      
      // Check down-left
      for (let r = row + 1, c = col - 1; r < actualHeight && c >= 0 && board[r][c] === player; r++, c--) {
        count++
        winCells.push([r, c])
      }
      
      if (count >= winLength) {
        setWinningCells(winCells)
        return true
      }
    }

    // Check corner win condition
    if (winConditions.cornerWin && actualHeight >= 3 && actualWidth >= 3) {
      const corners = [
        [0, 0], [0, actualWidth - 1],
        [actualHeight - 1, 0], [actualHeight - 1, actualWidth - 1]
      ]
      
      const controlledCorners = corners.filter(([r, c]) => board[r][c] === player)
      if (controlledCorners.length === 4) {
        setWinningCells(controlledCorners as [number, number][])
        return true
      }
    }

    return false
  }, [winConditions, actualWidth, actualHeight])

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || gameBoard[row][col] !== null) return

    const newBoard = gameBoard.map(row => [...row])
    newBoard[row][col] = currentPlayer.symbol

    // Apply gravity mode if enabled
    if (mechanics.gravityMode) {
      // Make piece fall down
      let finalRow = row
      while (finalRow + 1 < actualHeight && newBoard[finalRow + 1][col] === null) {
        newBoard[finalRow][col] = null
        finalRow++
        newBoard[finalRow][col] = currentPlayer.symbol
      }
      row = finalRow
    }

    setGameBoard(newBoard)
    setMoveCount(prev => prev + 1)

    // Check for win
    const isWin = checkWin(newBoard, [row, col], currentPlayer.symbol)
    const isMisere = mechanics.misereMode === true
    
    if (isWin) {
      const actualWinner = isMisere ? 
        gamePlayers[(currentPlayerIndex + 1) % gamePlayers.length] : 
        currentPlayer
      
      setWinner(actualWinner)
      setGameState('won')
      
      // Update tournament score
      if (tournament.enableTournament) {
        const winPoints = tournament.winPoints || 3
        setMatchScore(prev => ({
          ...prev,
          [actualWinner.id]: (prev[actualWinner.id] || 0) + winPoints
        }))
      }
      
      setGameHistory(prev => [...prev, `${actualWinner.name} wins!`])
    } else if (moveCount + 1 >= actualWidth * actualHeight) {
      // Check for draw
      setGameState('draw')
      
      if (tournament.enableTournament) {
        const drawPoints = tournament.drawPoints || 1
        gamePlayers.forEach(player => {
          setMatchScore(prev => ({
            ...prev,
            [player.id]: (prev[player.id] || 0) + drawPoints
          }))
        })
      }
      
      setGameHistory(prev => [...prev, 'Game drawn!'])
    } else {
      // Next player's turn
      setCurrentPlayerIndex((prev) => (prev + 1) % gamePlayers.length)
    }
  }, [gameBoard, gameState, currentPlayer, currentPlayerIndex, gamePlayers, mechanics, checkWin, moveCount, tournament, actualWidth, actualHeight])

  // Reset board when size changes
  useEffect(() => {
    const newBoard = Array(actualHeight).fill(null).map(() => Array(actualWidth).fill(null))
    setGameBoard(newBoard)
    setGameState('playing')
    setWinner(null)
    setWinningCells([])
    setCurrentPlayerIndex(0)
    setMoveCount(0)
  }, [actualWidth, actualHeight, board.boardShape])

  // Start new game
  const startNewGame = () => {
    const newBoard = Array(actualHeight).fill(null).map(() => Array(actualWidth).fill(null))
    setGameBoard(newBoard)
    setGameState('playing')
    setWinner(null)
    setWinningCells([])
    setCurrentPlayerIndex(0)
    setMoveCount(0)
    setGameStarted(true)
    
    if (tournament.enableTournament) {
      setGamesPlayed(prev => prev + 1)
    }
  }

  // Get cell display content
  const getCellContent = (cell: CellState) => {
    if (!cell) return ''
    
    const symbolStyle = players.playerSymbols || 'classic'
    if (symbolStyle === 'colors' || symbolStyle === 'emojis') {
      return cell
    }
    
    return cell
  }

  // Get board styling
  const getBoardStyling = () => {
    const theme = visual.boardTheme || 'classic'
    const gridColor = visual.gridColor || '#333333'
    const backgroundColor = visual.backgroundColor || '#ffffff'
    
    const baseClasses = 'rounded-lg overflow-hidden shadow-2xl'
    
    switch (theme) {
      case 'neon':
        return `${baseClasses} border-4 border-purple-500 bg-black shadow-purple-500/50`
      case 'wooden':
        return `${baseClasses} border-4 border-amber-800 bg-gradient-to-br from-amber-100 to-amber-200`
      case 'space':
        return `${baseClasses} border-4 border-blue-500 bg-gradient-to-br from-gray-900 to-blue-900`
      case 'paper':
        return `${baseClasses} border-2 border-gray-400 bg-white shadow-sm`
      case 'digital':
        return `${baseClasses} border-4 border-cyan-500 bg-gradient-to-br from-gray-800 to-gray-900 shadow-cyan-500/30`
      default:
        return `${baseClasses} border-4 border-gray-800`
    }
  }

  // Start screen
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⭕</div>
          <h1 className="text-3xl font-bold mb-2">Rule-Enhanced Tic Tac Toe</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Classic strategy game with customizable rules and variations
          </p>
          <div className="text-sm space-y-1 text-gray-500">
            <p>Board: {actualWidth}×{actualHeight} | Players: {gamePlayers.length}</p>
            <p>Win Length: {winConditions.winLength || 3} | {mechanics.gravityMode ? 'Gravity Mode' : 'Standard'}</p>
          </div>
        </div>
        
        <button
          onClick={startNewGame}
          className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors mb-4"
        >
          Start Game
        </button>
        
        <div className="text-sm text-gray-500 text-center">
          <p>Click on cells to place your symbol</p>
          <p>{mechanics.misereMode ? 'Misère Mode: First to get a line loses!' : 'First to get a line wins!'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Game Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">⭕ Tic Tac Toe</h1>
          {gameState === 'playing' && (
            <div 
              className="px-4 py-2 rounded-full text-white font-semibold"
              style={{ backgroundColor: currentPlayer.color }}
            >
              {currentPlayer.name}'s turn ({getCellContent(currentPlayer.symbol)})
            </div>
          )}
        </div>
        
        <button
          onClick={startNewGame}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Tournament Score */}
      {tournament.enableTournament && (
        <div className="w-full max-w-4xl mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Match Score (Game {gamesPlayed + 1})</h3>
          <div className="flex items-center space-x-4">
            {gamePlayers.map(player => (
              <div key={player.id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span>{player.name}: {player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Board */}
      <div className={getBoardStyling()}>
        <div 
          className="grid"
          style={{ 
            gridTemplateColumns: `repeat(${actualWidth}, 1fr)`,
            gap: '2px',
            backgroundColor: visual.gridColor || '#333333',
            padding: '2px'
          }}
        >
          {gameBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "aspect-square flex items-center justify-center text-4xl font-bold transition-all duration-200",
                  "hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed",
                  winningCells.some(([r, c]) => r === rowIndex && c === colIndex) && "bg-green-200 dark:bg-green-800",
                  visual.animationSpeed === 'instant' && "transition-none",
                  visual.animationSpeed === 'slow' && "transition-all duration-500",
                  visual.animationSpeed === 'dramatic' && "transition-all duration-1000"
                )}
                style={{
                  backgroundColor: winningCells.some(([r, c]) => r === rowIndex && c === colIndex) 
                    ? undefined 
                    : visual.backgroundColor || '#ffffff',
                  minHeight: '80px',
                  minWidth: '80px'
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={gameState !== 'playing' || cell !== null}
              >
                <span 
                  className={cn(
                    "select-none",
                    accessibility.largeSymbols && "text-5xl",
                    board.cellAnimation && "transform hover:scale-110"
                  )}
                  style={{
                    color: cell ? gamePlayers.find(p => p.symbol === cell)?.color : undefined
                  }}
                >
                  {getCellContent(cell)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Game Result */}
      {gameState !== 'playing' && (
        <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          {gameState === 'won' && winner && (
            <div>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: winner.color }}>
                {winner.name} Wins!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {mechanics.misereMode ? 'Avoided getting a line!' : 'Got a winning line!'}
              </p>
            </div>
          )}
          
          {gameState === 'draw' && (
            <div>
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold mb-2">It's a Draw!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                No more moves available
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rule Display */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center max-w-2xl">
        <p>Board: {actualWidth}×{actualHeight} • Win Length: {winConditions.winLength || 3} • Players: {gamePlayers.length}</p>
        <p>
          {mechanics.gravityMode && 'Gravity Mode • '}
          {mechanics.misereMode && 'Misère Mode • '}
          {winConditions.cornerWin && 'Corner Win • '}
          {mechanics.limitedPieces && `Limited to ${mechanics.pieceLimit || 3} pieces • `}
          Rules Active
        </p>
      </div>
    </div>
  )
}

// Main component with rule integration
export function RuleEnabledTicTacToe() {
  return (
    <GameRuleProvider defaultGame="tictactoe">
      <RuleAwareGame gameType="tictactoe">
        {(rules) => <TicTacToeGameCore rules={rules} />}
      </RuleAwareGame>
    </GameRuleProvider>
  )
}
