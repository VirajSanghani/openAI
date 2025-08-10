"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { GameRuleProvider, useRuleParameter, useRuleParameters, useGameLoop, RuleAwareGame } from '@/hooks/use-game-rules'
import { initializeChessRules } from '@/lib/game-rules/chess-rules'
import { cn } from '@/lib/utils'

// Initialize chess rules
initializeChessRules()

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
type PieceColor = 'white' | 'black'
type Square = [number, number]

interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

interface ChessMove {
  from: Square
  to: Square
  piece: Piece
  captured?: Piece
  isCheck?: boolean
  isCheckmate?: boolean
  notation: string
}

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
}

interface ChessGameProps {
  rules: Record<string, any>
}

function ChessGameCore({ rules }: ChessGameProps) {
  // Extract rule parameters
  const boardSize = rules['chess-board-size'] || { width: 8, height: 8 }
  const pieceMovement = rules['chess-piece-movement'] || {}
  const specialMoves = rules['chess-special-moves'] || {}
  const winConditions = rules['chess-win-conditions'] || {}
  const timeControl = rules['chess-time-control'] || {}
  const aiSettings = rules['chess-ai-behavior'] || {}
  const visualTheme = rules['chess-visual-theme'] || {}
  const assistance = rules['chess-assistance'] || {}

  // Game state
  const [board, setBoard] = useState<(Piece | null)[][]>(() => 
    initializeBoard(boardSize.width, boardSize.height)
  )
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white')
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [validMoves, setValidMoves] = useState<Square[]>([])
  const [moveHistory, setMoveHistory] = useState<ChessMove[]>([])
  const [gameStatus, setGameStatus] = useState<'playing' | 'check' | 'checkmate' | 'draw'>('playing')
  const [gameStarted, setGameStarted] = useState(false)
  
  // Time control state
  const [timeLeft, setTimeLeft] = useState({
    white: (timeControl.timePerPlayer || 10) * 60,
    black: (timeControl.timePerPlayer || 10) * 60
  })
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Initialize board based on size
  function initializeBoard(width: number, height: number): (Piece | null)[][] {
    const newBoard = Array(height).fill(null).map(() => Array(width).fill(null))
    
    // Only set up pieces if board is at least 8x8
    if (width >= 8 && height >= 8) {
      // Set up standard chess pieces
      const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
      
      // Black pieces (top)
      for (let col = 0; col < Math.min(8, width); col++) {
        newBoard[0][col] = { type: backRank[col], color: 'black' }
        newBoard[1][col] = { type: 'pawn', color: 'black' }
      }
      
      // White pieces (bottom)  
      for (let col = 0; col < Math.min(8, width); col++) {
        newBoard[height - 2][col] = { type: 'pawn', color: 'white' }
        newBoard[height - 1][col] = { type: backRank[col], color: 'white' }
      }
    }
    
    return newBoard
  }

  // Reset board when size changes
  useEffect(() => {
    setBoard(initializeBoard(boardSize.width, boardSize.height))
    setSelectedSquare(null)
    setValidMoves([])
    setMoveHistory([])
    setGameStatus('playing')
    setCurrentPlayer('white')
  }, [boardSize.width, boardSize.height])

  // Get valid moves for a piece
  const getValidMoves = useCallback((piece: Piece, fromSquare: Square): Square[] => {
    const [row, col] = fromSquare
    const moves: Square[] = []
    
    switch (piece.type) {
      case 'pawn': {
        const direction = piece.color === 'white' ? -1 : 1
        const startRow = piece.color === 'white' ? boardSize.height - 2 : 1
        
        // Forward moves
        if (row + direction >= 0 && row + direction < boardSize.height && !board[row + direction][col]) {
          moves.push([row + direction, col])
          
          // Double move on first move
          if (pieceMovement.pawnDoubleMove !== false && row === startRow && 
              row + (direction * 2) >= 0 && row + (direction * 2) < boardSize.height && 
              !board[row + (direction * 2)][col]) {
            moves.push([row + (direction * 2), col])
          }
        }
        
        // Backward moves (if enabled)
        if (pieceMovement.pawnBackward === true && 
            row - direction >= 0 && row - direction < boardSize.height && 
            !board[row - direction][col]) {
          moves.push([row - direction, col])
        }
        
        // Diagonal captures
        for (const colOffset of [-1, 1]) {
          const newCol = col + colOffset
          if (newCol >= 0 && newCol < boardSize.width && 
              row + direction >= 0 && row + direction < boardSize.height) {
            const target = board[row + direction][newCol]
            if (target && target.color !== piece.color) {
              moves.push([row + direction, newCol])
            }
          }
        }
        break
      }
      
      case 'rook': {
        const maxDistance = pieceMovement.rookMaxDistance || 8
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
        
        for (const [dx, dy] of directions) {
          for (let i = 1; i <= maxDistance; i++) {
            const newRow = row + dx * i
            const newCol = col + dy * i
            
            if (newRow < 0 || newRow >= boardSize.height || 
                newCol < 0 || newCol >= boardSize.width) break
            
            const target = board[newRow][newCol]
            if (!target) {
              moves.push([newRow, newCol])
            } else {
              if (target.color !== piece.color) {
                moves.push([newRow, newCol])
              }
              break
            }
          }
        }
        break
      }
      
      case 'bishop': {
        const maxDistance = pieceMovement.bishopMaxDistance || 8
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
        
        for (const [dx, dy] of directions) {
          for (let i = 1; i <= maxDistance; i++) {
            const newRow = row + dx * i
            const newCol = col + dy * i
            
            if (newRow < 0 || newRow >= boardSize.height || 
                newCol < 0 || newCol >= boardSize.width) break
            
            const target = board[newRow][newCol]
            if (!target) {
              moves.push([newRow, newCol])
            } else {
              if (target.color !== piece.color) {
                moves.push([newRow, newCol])
              }
              break
            }
          }
        }
        break
      }
      
      case 'knight': {
        let knightMoves: [number, number][]
        
        switch (pieceMovement.knightDistance) {
          case 'extended':
            knightMoves = [[-3, -1], [-3, 1], [-1, -3], [-1, 3], [1, -3], [1, 3], [3, -1], [3, 1]]
            break
          case 'short':
            knightMoves = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
            break
          case 'super':
            knightMoves = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
            break
          default:
            knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
        }
        
        for (const [dx, dy] of knightMoves) {
          const newRow = row + dx
          const newCol = col + dy
          
          if (newRow >= 0 && newRow < boardSize.height && 
              newCol >= 0 && newCol < boardSize.width) {
            const target = board[newRow][newCol]
            if (!target || target.color !== piece.color) {
              moves.push([newRow, newCol])
            }
          }
        }
        break
      }
      
      case 'queen': {
        const queenDirections = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
        let extraMoves: [number, number][] = []
        
        // Add knight moves for super queen
        if (pieceMovement.queenPowerLevel === 'super') {
          extraMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
        }
        
        // Normal queen movement
        for (const [dx, dy] of queenDirections) {
          const maxDistance = pieceMovement.queenPowerLevel === 'weak' ? 1 : 8
          
          for (let i = 1; i <= maxDistance; i++) {
            const newRow = row + dx * i
            const newCol = col + dy * i
            
            if (newRow < 0 || newRow >= boardSize.height || 
                newCol < 0 || newCol >= boardSize.width) break
            
            const target = board[newRow][newCol]
            if (!target) {
              moves.push([newRow, newCol])
            } else {
              if (target.color !== piece.color) {
                moves.push([newRow, newCol])
              }
              break
            }
          }
        }
        
        // Add knight moves for super queen
        for (const [dx, dy] of extraMoves) {
          const newRow = row + dx
          const newCol = col + dy
          
          if (newRow >= 0 && newRow < boardSize.height && 
              newCol >= 0 && newCol < boardSize.width) {
            const target = board[newRow][newCol]
            if (!target || target.color !== piece.color) {
              moves.push([newRow, newCol])
            }
          }
        }
        
        // Ultimate queen teleport
        if (pieceMovement.queenPowerLevel === 'ultimate') {
          for (let r = 0; r < boardSize.height; r++) {
            for (let c = 0; c < boardSize.width; c++) {
              if (r !== row || c !== col) {
                const target = board[r][c]
                if (!target || target.color !== piece.color) {
                  moves.push([r, c])
                }
              }
            }
          }
        }
        break
      }
      
      case 'king': {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
        
        for (const [dx, dy] of directions) {
          const newRow = row + dx
          const newCol = col + dy
          
          if (newRow >= 0 && newRow < boardSize.height && 
              newCol >= 0 && newCol < boardSize.width) {
            const target = board[newRow][newCol]
            if (!target || target.color !== piece.color) {
              moves.push([newRow, newCol])
            }
          }
        }
        
        // Castling (if enabled)
        if (specialMoves.castling !== false && !piece.hasMoved) {
          // Add castling logic here
        }
        break
      }
    }
    
    return moves
  }, [board, boardSize, pieceMovement, specialMoves])

  // Handle square click
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare
      const piece = board[selectedRow][selectedCol]
      
      // Check if this is a valid move
      if (validMoves.some(([r, c]) => r === row && c === col)) {
        // Make the move
        const newBoard = board.map(row => [...row])
        const captured = newBoard[row][col]
        
        newBoard[row][col] = piece
        newBoard[selectedRow][selectedCol] = null
        
        if (piece) {
          piece.hasMoved = true
        }
        
        // Create move notation
        const notation = createMoveNotation(piece!, selectedSquare, [row, col], captured)
        
        const move: ChessMove = {
          from: selectedSquare,
          to: [row, col],
          piece: piece!,
          captured,
          notation
        }
        
        setBoard(newBoard)
        setMoveHistory(prev => [...prev, move])
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white')
        setSelectedSquare(null)
        setValidMoves([])
      } else {
        // Select new piece or deselect
        setSelectedSquare(null)
        setValidMoves([])
      }
    } else {
      // Select a piece
      const piece = board[row][col]
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare([row, col])
        setValidMoves(getValidMoves(piece, [row, col]))
      }
    }
  }, [selectedSquare, validMoves, board, currentPlayer, getValidMoves])

  // Create move notation
  const createMoveNotation = (piece: Piece, from: Square, to: Square, captured?: Piece | null): string => {
    const [fromRow, fromCol] = from
    const [toRow, toCol] = to
    
    const fromSquare = `${String.fromCharCode(97 + fromCol)}${boardSize.height - fromRow}`
    const toSquare = `${String.fromCharCode(97 + toCol)}${boardSize.height - toRow}`
    
    const pieceSymbol = piece.type === 'pawn' ? '' : piece.type.charAt(0).toUpperCase()
    const captureSymbol = captured ? 'x' : ''
    
    return `${pieceSymbol}${fromSquare}${captureSymbol}${toSquare}`
  }

  // Timer logic
  useEffect(() => {
    if (timeControl.timeEnabled && isTimerActive && gameStatus === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = { ...prev }
          newTime[currentPlayer] -= 1
          
          if (newTime[currentPlayer] <= 0) {
            setGameStatus('checkmate') // Time out
            setIsTimerActive(false)
          }
          
          return newTime
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [timeControl.timeEnabled, isTimerActive, currentPlayer, gameStatus])

  // Start game
  const startGame = () => {
    setGameStarted(true)
    if (timeControl.timeEnabled) {
      setIsTimerActive(true)
    }
  }

  // Reset game
  const resetGame = () => {
    setBoard(initializeBoard(boardSize.width, boardSize.height))
    setCurrentPlayer('white')
    setSelectedSquare(null)
    setValidMoves([])
    setMoveHistory([])
    setGameStatus('playing')
    setGameStarted(false)
    setTimeLeft({
      white: (timeControl.timePerPlayer || 10) * 60,
      black: (timeControl.timePerPlayer || 10) * 60
    })
    setIsTimerActive(false)
  }

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">♟️</div>
          <h1 className="text-3xl font-bold mb-2">Rule-Enhanced Chess</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Play chess with customizable rules and mechanics
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">Board Size: {boardSize.width}×{boardSize.height}</p>
            <p className="text-sm text-gray-500">
              {timeControl.timeEnabled ? `Time: ${timeControl.timePerPlayer}min` : 'No time limit'}
            </p>
          </div>
        </div>
        
        <button
          onClick={startGame}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Game
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Game Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">♟️ Chess</h1>
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {currentPlayer}'s turn
          </div>
        </div>
        
        {timeControl.timeEnabled && (
          <div className="flex items-center space-x-4">
            <div className={cn(
              "px-3 py-2 rounded-lg text-sm font-mono",
              currentPlayer === 'white' ? "bg-white text-black border-2 border-blue-500" : "bg-gray-100 text-gray-800"
            )}>
              ♔ {formatTime(timeLeft.white)}
            </div>
            <div className={cn(
              "px-3 py-2 rounded-lg text-sm font-mono",
              currentPlayer === 'black' ? "bg-black text-white border-2 border-blue-500" : "bg-gray-800 text-gray-200"
            )}>
              ♚ {formatTime(timeLeft.black)}
            </div>
          </div>
        )}
        
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Reset Game
        </button>
      </div>

      {/* Chess Board */}
      <div className={cn(
        "grid gap-0 border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl",
        visualTheme.boardStyle === 'marble' && "border-gray-600",
        visualTheme.boardStyle === 'neon' && "border-purple-500 shadow-purple-500/50",
        visualTheme.boardStyle === 'space' && "border-blue-500 shadow-blue-500/50"
      )} style={{ 
        gridTemplateColumns: `repeat(${boardSize.width}, 1fr)`,
        width: `${Math.min(480, boardSize.width * 60)}px`,
        height: `${Math.min(480, boardSize.height * 60)}px`
      }}>
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "relative flex items-center justify-center cursor-pointer transition-all duration-200 select-none",
                // Board coloring
                (rowIndex + colIndex) % 2 === 0 
                  ? getSquareColor(visualTheme.boardStyle, 'light')
                  : getSquareColor(visualTheme.boardStyle, 'dark'),
                // Selection highlighting
                selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex 
                  && "ring-4 ring-blue-500 ring-inset",
                // Valid move highlighting
                validMoves.some(([r, c]) => r === rowIndex && c === colIndex) 
                  && "ring-4 ring-green-500 ring-inset",
                // Hover effect
                "hover:brightness-110"
              )}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              style={{
                width: `${Math.min(60, 480 / boardSize.width)}px`,
                height: `${Math.min(60, 480 / boardSize.height)}px`
              }}
            >
              {piece && (
                <div className={cn(
                  "text-4xl transition-transform hover:scale-110",
                  visualTheme.animationSpeed === 'instant' && "transition-none",
                  visualTheme.animationSpeed === 'slow' && "transition-all duration-500",
                  visualTheme.animationSpeed === 'dramatic' && "transition-all duration-1000 hover:scale-125"
                )}>
                  {PIECE_SYMBOLS[piece.color][piece.type]}
                </div>
              )}
              
              {/* Valid move indicator */}
              {validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && !piece && (
                <div className="absolute w-5 h-5 bg-green-500 rounded-full opacity-60" />
              )}
              
              {/* Coordinates */}
              {visualTheme.showCoordinates !== false && (
                <div className="absolute bottom-0 right-0 text-xs opacity-40 pointer-events-none">
                  {String.fromCharCode(97 + colIndex)}{boardSize.height - rowIndex}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Move History */}
      {moveHistory.length > 0 && (
        <div className="mt-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold mb-3">Move History</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-4 text-sm font-mono">
              {moveHistory.map((move, index) => (
                <div key={index} className="py-1">
                  {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'} {move.notation}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Status */}
      {gameStatus !== 'playing' && (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
          <p className="text-center font-semibold">
            {gameStatus === 'check' && 'Check!'}
            {gameStatus === 'checkmate' && `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`}
            {gameStatus === 'draw' && 'Game drawn!'}
          </p>
        </div>
      )}
    </div>
  )
}

// Helper function for board styling
function getSquareColor(style: string, type: 'light' | 'dark'): string {
  const styles = {
    classic: {
      light: 'bg-amber-100',
      dark: 'bg-amber-600'
    },
    modern: {
      light: 'bg-gray-100',
      dark: 'bg-gray-700'
    },
    marble: {
      light: 'bg-gray-200',
      dark: 'bg-gray-500'
    },
    neon: {
      light: 'bg-purple-200',
      dark: 'bg-purple-800'
    },
    medieval: {
      light: 'bg-stone-300',
      dark: 'bg-stone-700'
    },
    space: {
      light: 'bg-blue-200',
      dark: 'bg-blue-900'
    }
  }
  
  return styles[style as keyof typeof styles]?.[type] || styles.classic[type]
}

// Main component with rule integration
export function RuleEnabledChess() {
  return (
    <GameRuleProvider defaultGame="chess">
      <RuleAwareGame gameType="chess">
        {(rules) => <ChessGameCore rules={rules} />}
      </RuleAwareGame>
    </GameRuleProvider>
  )
}