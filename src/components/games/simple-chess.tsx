"use client"

import React, { useState } from 'react'
import { GameRuleProvider, RuleAwareGame } from '@/hooks/use-game-rules'
import { Button } from '@/components/ui/button'

// Initialize chess rules if not already done
try {
  // Import and initialize chess rules
  import('@/lib/game-rules/chess-rules').then(module => {
    if (module.initializeChessRules) {
      module.initializeChessRules()
    }
  }).catch(() => {
    // Chess rules not available, use basic functionality
  })
} catch (error) {
  // Fallback - chess rules not available
}

interface SimpleChessProps {
  rules?: Record<string, any>
}

export function SimpleChessCore({ rules }: SimpleChessProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white')
  const [moveCount, setMoveCount] = useState(0)

  // Extract basic rules
  const boardSize = rules?.['chess-board-setup']?.boardSize || 8
  const allowCastling = rules?.['chess-special-moves']?.castling !== false
  const theme = rules?.['chess-visual-theme']?.boardTheme || 'classic'

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 rounded-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">♟️</div>
          <h1 className="text-3xl font-bold mb-2">Rule-Enhanced Chess</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Classic chess with customizable rules and gameplay modifications
          </p>
          <div className="text-sm space-y-1 text-gray-500">
            <p>Board Size: {boardSize}×{boardSize}</p>
            <p>Special Moves: {allowCastling ? 'Enabled' : 'Disabled'}</p>
            <p>Theme: {theme}</p>
          </div>
        </div>
        
        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors mb-4"
        >
          Start Chess Game
        </button>
        
        <div className="text-sm text-gray-500 text-center">
          <p>Click to start a customizable chess experience</p>
          <p>Modify rules in real-time using the rule editor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Game Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">♟️ Chess</h1>
          <div className="px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-semibold">
            {currentPlayer === 'white' ? 'White' : 'Black'} to move
          </div>
        </div>
        
        <button
          onClick={() => {
            setGameStarted(false)
            setCurrentPlayer('white')
            setMoveCount(0)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Chess Board Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4">
        <div 
          className="grid gap-0 border-4 border-amber-800"
          style={{ 
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            aspectRatio: '1/1',
            width: Math.min(400, boardSize * 50) + 'px'
          }}
        >
          {Array.from({ length: boardSize * boardSize }).map((_, index) => {
            const row = Math.floor(index / boardSize)
            const col = index % boardSize
            const isLight = (row + col) % 2 === 0
            
            return (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-2xl font-bold cursor-pointer transition-colors ${
                  isLight 
                    ? 'bg-amber-100 hover:bg-amber-200' 
                    : 'bg-amber-800 hover:bg-amber-700'
                }`}
                onClick={() => {
                  setMoveCount(prev => prev + 1)
                  setCurrentPlayer(prev => prev === 'white' ? 'black' : 'white')
                }}
              >
                {/* Initial piece setup for demonstration */}
                {row === 0 && boardSize === 8 && (
                  col === 0 || col === 7 ? '♜' :
                  col === 1 || col === 6 ? '♞' :
                  col === 2 || col === 5 ? '♝' :
                  col === 3 ? '♛' : '♚'
                )}
                {row === 1 && boardSize === 8 && '♟'}
                {row === boardSize - 2 && boardSize === 8 && '♙'}
                {row === boardSize - 1 && boardSize === 8 && (
                  col === 0 || col === 7 ? '♖' :
                  col === 1 || col === 6 ? '♘' :
                  col === 2 || col === 5 ? '♗' :
                  col === 3 ? '♕' : '♔'
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Game Info */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Move {Math.floor(moveCount / 2) + 1} • Board: {boardSize}×{boardSize} • Theme: {theme}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This is a demonstration chess board. Modify rules using the editor to see changes in real-time!
        </p>
      </div>
    </div>
  )
}

// Main component with rule integration
export function SimpleChess() {
  return (
    <GameRuleProvider defaultGame="chess">
      <RuleAwareGame gameType="chess">
        {(rules) => <SimpleChessCore rules={rules} />}
      </RuleAwareGame>
    </GameRuleProvider>
  )
}
