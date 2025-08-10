"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { RuleModifiableGame, RuleModificationDemo } from '@/components/rule-editor/rule-modifiable-game'
import { TicTacToeGameCore } from '@/components/games/rule-enabled-tictactoe'
import { PlatformerGameCore } from '@/components/games/rule-enabled-platformer'
import { SimpleChessCore } from '@/components/games/simple-chess'
import { cn } from '@/lib/utils'

export default function GameRulesPage() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  const demos = [
    {
      id: 'tictactoe',
      name: 'Extended Tic Tac Toe',
      description: 'Transform classic tic-tac-toe with board size changes and new win conditions',
      gameType: 'tictactoe',
      component: TicTacToeGameCore,
      features: [
        'Variable board sizes (3x3 to 10x10)',
        'Custom win conditions',
        'Multiple players support (2-6)',
        'Gravity mode (Connect 4 style)',
        'Misère mode (lose by getting line)',
        'Visual themes and animations'
      ]
    },
    {
      id: 'platformer',
      name: 'Physics Playground',
      description: 'Modify gravity, jump height, character abilities in real-time',
      gameType: 'platformer',
      component: PlatformerGameCore,
      features: [
        'Adjustable gravity and physics',
        'Character movement customization',
        'Jump mechanics (height, double-jump)',
        'Dash ability with cooldowns',
        'Enemy behavior modification',
        'Level generation parameters'
      ]
    },
    {
      id: 'chess',
      name: 'Rule-Enhanced Chess',
      description: 'Experience chess with customizable rules - change board size, special moves and more',
      gameType: 'chess',
      component: SimpleChessCore,
      features: [
        'Dynamic board sizing (4x4 to 12x12)',
        'Custom piece movement patterns',
        'Alternative win conditions',
        'Special move toggles',
        'Visual theme selection',
        'Rule-based gameplay modifications'
      ]
    }
  ]

  if (selectedDemo) {
    const demo = demos.find(d => d.id === selectedDemo)
    if (demo) {
      return (
        <RuleModifiableGame
          gameComponent={demo.component}
          gameType={demo.gameType}
          gameName={demo.name}
          defaultInModificationMode={true}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl mb-6">
            <Icons.zap className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Game Rule Modification System
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Revolutionary platform that transforms static games into infinite creative experiences. 
            Modify rules, mechanics, and assets in real-time while you play.
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Real-Time Modifications
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              Visual Rule Editor
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
              Hot-Reload System
            </div>
          </div>
        </div>

        {/* Demo Games */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Interactive Demos</h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {demos.map((demo, index) => (
              <Card 
                key={demo.id} 
                className="group cursor-pointer border-0 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800"
                onClick={() => setSelectedDemo(demo.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-r from-purple-500 to-blue-600">
                      {demo.id === 'tictactoe' ? '⭕' : demo.id === 'platformer' ? '🎮' : '♟️'}
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    )}>
                      Ready
                    </span>
                  </div>
                  
                  <CardTitle className="text-xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {demo.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {demo.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {demo.features.slice(0, 3).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Icons.check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full font-semibold transition-all duration-200 bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                  >
                    <Icons.play className="w-4 h-4 mr-2" />
                    Try Interactive Demo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Features */}
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Revolutionary Capabilities</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icons.cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Hot-Reload Engine</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instant rule application without game restart
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icons.shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Rule Validation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conflict detection and dependency checking
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icons.layers className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Component System</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modular rule architecture for extensibility
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icons.share className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Share & Export</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save and share custom rule configurations
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Gaming?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Experience the future of interactive entertainment where every player becomes a game designer
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                onClick={() => setSelectedDemo('tictactoe')}
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8"
              >
                <Icons.play className="w-5 h-5 mr-2" />
                Try Tic Tac Toe Demo
              </Button>
              
              <Button
                size="lg"
                onClick={() => setSelectedDemo('platformer')}
                className="border-white text-white hover:bg-white/10 font-semibold px-8 border-2"
              >
                <Icons.cpu className="w-5 h-5 mr-2" />
                Try Physics Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
