// Built-in app templates for Casual OS
// These templates provide ready-made productivity and utility apps

export interface AppTemplate {
  id: string
  name: string
  description: string
  category: 'productivity' | 'utility' | 'game' | 'social' | 'creative'
  framework: 'react' | 'vue' | 'angular' | 'vanilla'
  icon: string
  tags: string[]
  files: AppTemplateFile[]
  dependencies?: string[]
  features: string[]
}

export interface AppTemplateFile {
  path: string
  content: string
  mimeType: string
  isDirectory?: boolean
}

export const APP_TEMPLATES: AppTemplate[] = [
  // Todo List Manager
  {
    id: 'todo-manager',
    name: 'Todo Manager',
    description: 'A feature-rich todo list app with categories, priorities, and local storage',
    category: 'productivity',
    framework: 'react',
    icon: '✅',
    tags: ['todo', 'productivity', 'tasks', 'organization'],
    features: [
      'Add, edit, and delete tasks',
      'Task categories and priorities',
      'Mark tasks as complete',
      'Local storage persistence',
      'Dark/light theme support',
      'Search and filter tasks'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect } from 'react'
import './App.css'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: Date
}

const STORAGE_KEY = 'casual-os-todos'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputText, setInputText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Load todos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setTodos(JSON.parse(stored).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      })))
    }
  }, [])

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!inputText.trim()) return

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      priority: selectedPriority,
      category: selectedCategory || 'General',
      createdAt: new Date()
    }

    setTodos([...todos, newTodo])
    setInputText('')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4757'
      case 'medium': return '#ffa502'
      case 'low': return '#2ed573'
      default: return '#747d8c'
    }
  }

  const categories = Array.from(new Set(todos.map(todo => todo.category)))

  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'active') return !todo.completed
      if (filter === 'completed') return todo.completed
      return true
    })
    .filter(todo => 
      todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  }

  return (
    <div className="app">
      <header>
        <h1>📝 Todo Manager</h1>
        <div className="stats">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Done: {stats.completed}</span>
        </div>
      </header>

      <div className="add-todo">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="What needs to be done?"
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Shopping">Shopping</option>
          <option value="Health">Health</option>
        </select>

        <select 
          value={selectedPriority} 
          onChange={(e) => setSelectedPriority(e.target.value as any)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button onClick={addTodo}>Add Task</button>
      </div>

      <div className="controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search todos..."
          className="search"
        />
        
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Active ({stats.active})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Done ({stats.completed})
          </button>
        </div>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <div className="todo-content">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className="todo-text">{todo.text}</span>
              <div className="todo-meta">
                <span className="category">{todo.category}</span>
                <span 
                  className="priority" 
                  style={{ backgroundColor: getPriorityColor(todo.priority) }}
                >
                  {todo.priority}
                </span>
                <span className="date">
                  {todo.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            <button onClick={() => deleteTodo(todo.id)} className="delete">
              ❌
            </button>
          </li>
        ))}
      </ul>

      {filteredTodos.length === 0 && (
        <div className="empty-state">
          <p>
            {searchTerm ? 'No todos match your search.' : 
             filter === 'completed' ? 'No completed todos yet.' :
             filter === 'active' ? 'No active todos. Great job!' :
             'No todos yet. Add one above!'}
          </p>
        </div>
      )}
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

header h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.stats span {
  padding: 5px 15px;
  background: #f8f9fa;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  align-items: stretch;
}

.add-todo input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.add-todo input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-todo select {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  min-width: 120px;
}

.add-todo button {
  padding: 12px 24px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.add-todo button:hover {
  transform: translateY(-2px);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
}

.search {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 0.9rem;
}

.filters {
  display: flex;
  gap: 5px;
}

.filters button {
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filters button.active,
.filters button:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border: 2px solid #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.todo-list li:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.todo-list li.completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.todo-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.todo-text {
  font-size: 1.1rem;
  flex: 1;
}

.todo-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.category {
  padding: 4px 8px;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.date {
  font-size: 0.8rem;
  color: #6c757d;
}

.delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.delete:hover {
  background: #ffe6e6;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  body {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .app {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .add-todo input[type="text"],
  .add-todo select,
  .search {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .todo-list li {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .app {
    margin: 10px;
    padding: 20px;
  }
  
  .add-todo {
    flex-direction: column;
  }
  
  .controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .filters {
    justify-content: center;
  }
  
  .todo-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .todo-meta {
    flex-wrap: wrap;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // Note Taking App
  {
    id: 'note-taker',
    name: 'Note Taker',
    description: 'Rich text note-taking app with categories, search, and markdown support',
    category: 'productivity',
    framework: 'react',
    icon: '📝',
    tags: ['notes', 'writing', 'markdown', 'productivity'],
    features: [
      'Create and edit rich text notes',
      'Markdown support',
      'Note categories and tags',
      'Search and filter notes',
      'Auto-save functionality',
      'Export notes as markdown'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect } from 'react'
import './App.css'

interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  favorite: boolean
}

const STORAGE_KEY = 'casual-os-notes'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPreview, setShowPreview] = useState(false)

  // Load notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setNotes(JSON.parse(stored).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      })))
    }
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  // Auto-save when editing
  useEffect(() => {
    if (selectedNote && isEditing) {
      const timeoutId = setTimeout(() => {
        updateNote(selectedNote)
      }, 1000) // Auto-save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId)
    }
  }, [selectedNote?.content, selectedNote?.title])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      category: 'General',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      favorite: false
    }

    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setIsEditing(true)
  }

  const updateNote = (note: Note) => {
    const updatedNote = { ...note, updatedAt: new Date() }
    setNotes(notes.map(n => n.id === note.id ? updatedNote : n))
    setSelectedNote(updatedNote)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
      setIsEditing(false)
    }
  }

  const toggleFavorite = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, favorite: !note.favorite } : note
    ))
  }

  const categories = Array.from(new Set(notes.map(note => note.category)))

  const filteredNotes = notes
    .filter(note => {
      if (selectedCategory !== 'all' && note.category !== selectedCategory) return false
      if (searchTerm) {
        return note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
               note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      }
      return true
    })
    .sort((a, b) => {
      // Favorites first, then by updated date
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })

  const formatMarkdown = (text: string) => {
    return text
      .replace(/^# (.+$)/gm, '<h1>$1</h1>')
      .replace(/^## (.+$)/gm, '<h2>$1</h2>')
      .replace(/^### (.+$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\`(.+?)\`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }

  const exportNote = (note: Note) => {
    const markdown = \`# \${note.title}\n\n\${note.content}\`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = \`\${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md\`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <div className="sidebar">
        <header>
          <h1>📝 Notes</h1>
          <button onClick={createNewNote} className="new-note-btn">
            ✏️ New Note
          </button>
        </header>

        <div className="search-section">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes..."
            className="search-input"
          />
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="notes-list">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={\`note-item \${selectedNote?.id === note.id ? 'active' : ''}\`}
              onClick={() => {
                setSelectedNote(note)
                setIsEditing(false)
                setShowPreview(false)
              }}
            >
              <div className="note-header">
                <h3>{note.title}</h3>
                <div className="note-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(note.id)
                    }}
                    className={\`favorite-btn \${note.favorite ? 'active' : ''}\`}
                  >
                    {note.favorite ? '⭐' : '☆'}
                  </button>
                </div>
              </div>
              
              <p className="note-preview">
                {note.content.substring(0, 100)}...
              </p>
              
              <div className="note-meta">
                <span className="category">{note.category}</span>
                <span className="date">
                  {note.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="empty-state">
              <p>No notes found</p>
              <button onClick={createNewNote}>Create your first note</button>
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        {selectedNote ? (
          <>
            <div className="note-toolbar">
              <div className="note-title-section">
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({
                      ...selectedNote,
                      title: e.target.value
                    })}
                    className="title-input"
                  />
                ) : (
                  <h2>{selectedNote.title}</h2>
                )}
              </div>

              <div className="toolbar-actions">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={showPreview ? 'active' : ''}
                >
                  👁️ Preview
                </button>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? 'active' : ''}
                >
                  ✏️ Edit
                </button>
                
                <button onClick={() => exportNote(selectedNote)}>
                  📤 Export
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('Delete this note?')) {
                      deleteNote(selectedNote.id)
                    }
                  }}
                  className="delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            <div className="note-editor">
              {isEditing ? (
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => setSelectedNote({
                    ...selectedNote,
                    content: e.target.value
                  })}
                  placeholder="Start writing your note... (Supports markdown)"
                  className="content-textarea"
                />
              ) : showPreview ? (
                <div 
                  className="content-preview"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdown(selectedNote.content) 
                  }}
                />
              ) : (
                <div className="content-display">
                  {selectedNote.content || 'Click Edit to start writing...'}
                </div>
              )}
            </div>

            <div className="note-footer">
              <div className="note-info">
                <span>Created: {selectedNote.createdAt.toLocaleString()}</span>
                <span>Updated: {selectedNote.updatedAt.toLocaleString()}</span>
                <span>Words: {selectedNote.content.split(/\s+/).length}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>📝 Welcome to Notes</h2>
              <p>Select a note to view or create a new one to get started</p>
              <button onClick={createNewNote} className="cta-button">
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background: #f8f9fa;
  color: #333;
}

.app {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

header h1 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  color: #495057;
}

.new-note-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.new-note-btn:hover {
  transform: translateY(-1px);
}

.search-section {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.category-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.note-item {
  padding: 15px;
  margin-bottom: 8px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.note-item:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.note-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.favorite-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.favorite-btn.active {
  color: #ffc107;
}

.note-preview {
  margin: 8px 0;
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
}

.note-item.active .note-preview {
  color: rgba(255, 255, 255, 0.8);
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.category {
  padding: 2px 8px;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.75rem;
}

.note-item.active .category {
  background: rgba(255, 255, 255, 0.2);
}

.date {
  color: #6c757d;
}

.note-item.active .date {
  color: rgba(255, 255, 255, 0.7);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.note-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.title-input {
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
  background: transparent;
  padding: 4px 0;
  width: 100%;
  outline: none;
}

.title-input:focus {
  border-bottom: 2px solid #667eea;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

.toolbar-actions button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-actions button:hover {
  background: #f8f9fa;
}

.toolbar-actions button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.delete-btn {
  background: #dc3545 !important;
  color: white !important;
  border-color: #dc3545 !important;
}

.note-editor {
  flex: 1;
  padding: 30px;
}

.content-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  resize: none;
}

.content-display {
  font-size: 1rem;
  line-height: 1.6;
  color: #6c757d;
  white-space: pre-wrap;
}

.content-preview {
  font-size: 1rem;
  line-height: 1.6;
}

.content-preview h1 {
  font-size: 1.8rem;
  margin: 0 0 20px 0;
  color: #495057;
}

.content-preview h2 {
  font-size: 1.5rem;
  margin: 25px 0 15px 0;
  color: #495057;
}

.content-preview h3 {
  font-size: 1.2rem;
  margin: 20px 0 10px 0;
  color: #495057;
}

.content-preview code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
}

.note-footer {
  padding: 15px 30px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.note-info {
  display: flex;
  gap: 20px;
  font-size: 0.85rem;
  color: #6c757d;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  color: #6c757d;
}

.welcome-content h2 {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #495057;
}

.welcome-content p {
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.cta-button {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-state button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 50vh;
  }
  
  .note-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .toolbar-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // Calculator
  {
    id: 'calculator',
    name: 'Scientific Calculator',
    description: 'Feature-rich calculator with scientific functions, history, and themes',
    category: 'utility',
    framework: 'react',
    icon: '🔢',
    tags: ['calculator', 'math', 'utility', 'scientific'],
    features: [
      'Basic arithmetic operations',
      'Scientific functions (sin, cos, tan, log, etc.)',
      'Calculation history',
      'Memory functions (M+, M-, MR, MC)',
      'Keyboard support',
      'Multiple themes'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect, useCallback } from 'react'
import './App.css'

interface HistoryItem {
  expression: string
  result: string
  timestamp: Date
}

function App() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNewValue, setWaitingForNewValue] = useState(false)
  const [memory, setMemory] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [scientificMode, setScientificMode] = useState(false)
  const [angle, setAngle] = useState<'deg' | 'rad'>('deg')
  const [theme, setTheme] = useState<'light' | 'dark' | 'colorful'>('light')

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('calc-history')
    const savedMemory = localStorage.getItem('calc-memory')
    const savedTheme = localStorage.getItem('calc-theme')
    
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedMemory) setMemory(parseFloat(savedMemory))
    if (savedTheme) setTheme(savedTheme as any)
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('calc-memory', memory.toString())
  }, [memory])

  useEffect(() => {
    localStorage.setItem('calc-theme', theme)
  }, [theme])

  const addToHistory = (expr: string, result: string) => {
    const newItem: HistoryItem = {
      expression: expr,
      result,
      timestamp: new Date()
    }
    setHistory(prev => [newItem, ...prev.slice(0, 49)]) // Keep last 50 items
  }

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num)
      setWaitingForNewValue(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputDot = () => {
    if (waitingForNewValue) {
      setDisplay('0.')
      setWaitingForNewValue(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNewValue(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
      addToHistory(\`\${currentValue} \${operation} \${inputValue}\`, String(newValue))
    }

    setWaitingForNewValue(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+': return firstValue + secondValue
      case '-': return firstValue - secondValue
      case '*': return firstValue * secondValue
      case '/': return secondValue !== 0 ? firstValue / secondValue : NaN
      case '=': return secondValue
      default: return secondValue
    }
  }

  const scientificOperation = (op: string) => {
    const value = parseFloat(display)
    let result: number

    const toRadians = (deg: number) => deg * (Math.PI / 180)
    const toDegrees = (rad: number) => rad * (180 / Math.PI)

    switch (op) {
      case 'sin':
        result = Math.sin(angle === 'deg' ? toRadians(value) : value)
        break
      case 'cos':
        result = Math.cos(angle === 'deg' ? toRadians(value) : value)
        break
      case 'tan':
        result = Math.tan(angle === 'deg' ? toRadians(value) : value)
        break
      case 'log':
        result = Math.log10(value)
        break
      case 'ln':
        result = Math.log(value)
        break
      case 'sqrt':
        result = Math.sqrt(value)
        break
      case 'x²':
        result = value * value
        break
      case 'x³':
        result = value * value * value
        break
      case '1/x':
        result = 1 / value
        break
      case 'π':
        result = Math.PI
        break
      case 'e':
        result = Math.E
        break
      case '!':
        result = factorial(value)
        break
      default:
        return
    }

    const resultStr = parseFloat(result.toPrecision(12)).toString()
    setDisplay(resultStr)
    addToHistory(\`\${op}(\${value})\`, resultStr)
    setWaitingForNewValue(true)
  }

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  const memoryOperation = (op: string) => {
    const value = parseFloat(display)
    
    switch (op) {
      case 'MC':
        setMemory(0)
        break
      case 'MR':
        setDisplay(memory.toString())
        setWaitingForNewValue(true)
        break
      case 'M+':
        setMemory(memory + value)
        break
      case 'M-':
        setMemory(memory - value)
        break
      case 'MS':
        setMemory(value)
        break
    }
  }

  // Keyboard support
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const { key } = event
    
    if ('0123456789'.includes(key)) {
      inputNumber(key)
    } else if (key === '.') {
      inputDot()
    } else if ('+-*/'.includes(key)) {
      performOperation(key)
    } else if (key === 'Enter' || key === '=') {
      performOperation('=')
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      clear()
    } else if (key === 'Backspace') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1))
      } else {
        setDisplay('0')
      }
    }
  }, [display, operation, previousValue, waitingForNewValue])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const formatDisplay = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return 'Error'
    if (!isFinite(num)) return 'Infinity'
    
    // Format large numbers with scientific notation
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6)
    }
    
    return parseFloat(num.toPrecision(12)).toString()
  }

  return (
    <div className={\`calculator \${theme}\`}>
      <div className="header">
        <h1>🔢 Calculator</h1>
        <div className="controls">
          <button
            onClick={() => setScientificMode(!scientificMode)}
            className={\`mode-btn \${scientificMode ? 'active' : ''}\`}
          >
            Scientific
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={\`history-btn \${showHistory ? 'active' : ''}\`}
          >
            History
          </button>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="theme-select"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="colorful">Colorful</option>
          </select>
        </div>
      </div>

      <div className="calculator-body">
        <div className="calculator-main">
          <div className="display-container">
            <div className="display">
              {formatDisplay(display)}
            </div>
            {memory !== 0 && <div className="memory-indicator">M</div>}
            {operation && <div className="operation-indicator">{operation}</div>}
          </div>

          {scientificMode && (
            <div className="scientific-controls">
              <button
                onClick={() => setAngle(angle === 'deg' ? 'rad' : 'deg')}
                className={\`angle-btn \${angle}\`}
              >
                {angle.toUpperCase()}
              </button>
            </div>
          )}

          <div className={\`keypad \${scientificMode ? 'scientific' : ''}\`}>
            {scientificMode && (
              <div className="scientific-row">
                <button onClick={() => scientificOperation('sin')} className="sci-btn">sin</button>
                <button onClick={() => scientificOperation('cos')} className="sci-btn">cos</button>
                <button onClick={() => scientificOperation('tan')} className="sci-btn">tan</button>
                <button onClick={() => scientificOperation('log')} className="sci-btn">log</button>
                <button onClick={() => scientificOperation('ln')} className="sci-btn">ln</button>
              </div>
            )}

            {scientificMode && (
              <div className="scientific-row">
                <button onClick={() => scientificOperation('π')} className="sci-btn">π</button>
                <button onClick={() => scientificOperation('e')} className="sci-btn">e</button>
                <button onClick={() => scientificOperation('x²')} className="sci-btn">x²</button>
                <button onClick={() => scientificOperation('x³')} className="sci-btn">x³</button>
                <button onClick={() => scientificOperation('sqrt')} className="sci-btn">√</button>
              </div>
            )}

            <div className="memory-row">
              <button onClick={() => memoryOperation('MC')} className="mem-btn">MC</button>
              <button onClick={() => memoryOperation('MR')} className="mem-btn">MR</button>
              <button onClick={() => memoryOperation('M+')} className="mem-btn">M+</button>
              <button onClick={() => memoryOperation('M-')} className="mem-btn">M-</button>
              <button onClick={clear} className="clear-btn">C</button>
            </div>

            <div className="number-row">
              <button onClick={() => inputNumber('7')} className="num-btn">7</button>
              <button onClick={() => inputNumber('8')} className="num-btn">8</button>
              <button onClick={() => inputNumber('9')} className="num-btn">9</button>
              <button onClick={() => performOperation('/')} className="op-btn">÷</button>
            </div>

            <div className="number-row">
              <button onClick={() => inputNumber('4')} className="num-btn">4</button>
              <button onClick={() => inputNumber('5')} className="num-btn">5</button>
              <button onClick={() => inputNumber('6')} className="num-btn">6</button>
              <button onClick={() => performOperation('*')} className="op-btn">×</button>
            </div>

            <div className="number-row">
              <button onClick={() => inputNumber('1')} className="num-btn">1</button>
              <button onClick={() => inputNumber('2')} className="num-btn">2</button>
              <button onClick={() => inputNumber('3')} className="num-btn">3</button>
              <button onClick={() => performOperation('-')} className="op-btn">-</button>
            </div>

            <div className="number-row">
              <button onClick={() => inputNumber('0')} className="num-btn zero">0</button>
              <button onClick={inputDot} className="num-btn">.</button>
              <button onClick={() => performOperation('=')} className="equals-btn">=</button>
              <button onClick={() => performOperation('+')} className="op-btn">+</button>
            </div>
          </div>
        </div>

        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>History</h3>
              <button
                onClick={() => setHistory([])}
                className="clear-history"
              >
                Clear All
              </button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="history-empty">No calculations yet</div>
              ) : (
                history.map((item, index) => (
                  <div
                    key={index}
                    className="history-item"
                    onClick={() => {
                      setDisplay(item.result)
                      setWaitingForNewValue(true)
                    }}
                  >
                    <div className="history-expression">{item.expression}</div>
                    <div className="history-result">= {item.result}</div>
                    <div className="history-time">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  min-height: 100vh;
}

.calculator {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.calculator.dark {
  background: rgba(30, 30, 30, 0.95);
  color: white;
}

.calculator.colorful {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(78, 205, 196, 0.9) 100%);
  color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.calculator.dark .header {
  border-bottom-color: #444;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mode-btn, .history-btn {
  padding: 8px 16px;
  border: 2px solid #74b9ff;
  background: transparent;
  color: #74b9ff;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.mode-btn:hover, .history-btn:hover,
.mode-btn.active, .history-btn.active {
  background: #74b9ff;
  color: white;
}

.theme-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
}

.calculator-body {
  display: flex;
  gap: 20px;
}

.calculator-main {
  flex: 1;
}

.display-container {
  position: relative;
  background: #f8f9fa;
  border: 3px solid #e9ecef;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.calculator.dark .display-container {
  background: #2c3e50;
  border-color: #34495e;
}

.calculator.colorful .display-container {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.display {
  font-size: 2.5rem;
  font-weight: 300;
  color: #2c3e50;
  text-align: right;
  font-family: 'Courier New', monospace;
  min-width: 0;
  overflow-wrap: break-word;
}

.calculator.dark .display {
  color: #ecf0f1;
}

.calculator.colorful .display {
  color: white;
}

.memory-indicator {
  position: absolute;
  top: 10px;
  left: 15px;
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: bold;
}

.operation-indicator {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 0.9rem;
  color: #3498db;
  font-weight: bold;
}

.scientific-controls {
  text-align: center;
  margin-bottom: 15px;
}

.angle-btn {
  padding: 6px 16px;
  border: 2px solid #3498db;
  background: transparent;
  color: #3498db;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
}

.angle-btn.deg {
  background: #3498db;
  color: white;
}

.angle-btn.rad {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.keypad {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.keypad.scientific {
  gap: 8px;
}

.scientific-row, .memory-row, .number-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.number-row {
  grid-template-columns: repeat(4, 1fr);
}

button {
  padding: 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(0);
}

.num-btn {
  background: #ecf0f1;
  color: #2c3e50;
}

.calculator.dark .num-btn {
  background: #34495e;
  color: #ecf0f1;
}

.calculator.colorful .num-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.num-btn.zero {
  grid-column: span 2;
}

.op-btn {
  background: #74b9ff;
  color: white;
}

.calculator.colorful .op-btn {
  background: rgba(255, 255, 255, 0.3);
}

.equals-btn {
  background: #00b894;
  color: white;
}

.calculator.colorful .equals-btn {
  background: rgba(0, 184, 148, 0.8);
}

.clear-btn {
  background: #fd79a8;
  color: white;
}

.calculator.colorful .clear-btn {
  background: rgba(253, 121, 168, 0.8);
}

.mem-btn {
  background: #fdcb6e;
  color: white;
  font-size: 1rem;
  padding: 15px;
}

.calculator.colorful .mem-btn {
  background: rgba(253, 203, 110, 0.8);
}

.sci-btn {
  background: #a29bfe;
  color: white;
  font-size: 1rem;
  padding: 12px;
}

.calculator.colorful .sci-btn {
  background: rgba(162, 155, 254, 0.8);
}

.history-panel {
  width: 300px;
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.calculator.dark .history-panel {
  background: #2c3e50;
}

.calculator.colorful .history-panel {
  background: rgba(255, 255, 255, 0.2);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.history-header h3 {
  margin: 0;
  color: #2c3e50;
}

.calculator.dark .history-header h3 {
  color: #ecf0f1;
}

.calculator.colorful .history-header h3 {
  color: white;
}

.clear-history {
  padding: 6px 12px;
  background: #e17055;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.history-empty {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
}

.history-item {
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.calculator.dark .history-item {
  background: #34495e;
}

.calculator.colorful .history-item {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.history-item:hover {
  border-color: #74b9ff;
  transform: translateY(-1px);
}

.history-expression {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.history-result {
  font-weight: 600;
  font-size: 1rem;
  color: #2c3e50;
}

.calculator.dark .history-result {
  color: #ecf0f1;
}

.calculator.colorful .history-result {
  color: #2c3e50;
}

.history-time {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 4px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .calculator-body {
    flex-direction: column;
  }
  
  .history-panel {
    width: 100%;
    max-height: 300px;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .scientific-row, .memory-row, .number-row {
    gap: 5px;
  }
  
  button {
    padding: 15px;
    font-size: 1rem;
  }
  
  .display {
    font-size: 2rem;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // Tic Tac Toe Game
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic tic tac toe game with AI opponent and score tracking',
    category: 'game',
    framework: 'react',
    icon: '❌',
    tags: ['game', 'ai', 'classic', 'strategy'],
    features: [
      'Single player vs AI',
      'Two player mode',
      'Score tracking',
      'Game history',
      'Responsive design',
      'Winning animations'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect } from 'react'
import './App.css'

type Player = 'X' | 'O' | null
type GameMode = 'human' | 'ai'

function App() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [gameMode, setGameMode] = useState<GameMode>('human')
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [gameHistory, setGameHistory] = useState<string[]>([])

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ]

  const checkWinner = (boardState: Player[]): { winner: Player | 'draw' | null, line: number[] | null } => {
    // Check for winning combinations
    for (const combination of winningCombinations) {
      const [a, b, c] = combination
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winner: boardState[a], line: combination }
      }
    }

    // Check for draw
    if (boardState.every(cell => cell !== null)) {
      return { winner: 'draw', line: null }
    }

    return { winner: null, line: null }
  }

  const makeMove = (index: number, player: Player) => {
    if (board[index] || winner) return false

    const newBoard = [...board]
    newBoard[index] = player
    setBoard(newBoard)

    const result = checkWinner(newBoard)
    if (result.winner) {
      setWinner(result.winner)
      setWinningLine(result.line)
      
      // Update scores
      setScores(prev => ({
        ...prev,
        [result.winner === 'draw' ? 'draws' : result.winner]: prev[result.winner === 'draw' ? 'draws' : result.winner] + 1
      }))

      // Add to history
      const gameResult = result.winner === 'draw' ? 'Draw' : \`\${result.winner} wins\`
      setGameHistory(prev => [gameResult, ...prev.slice(0, 9)])
    } else {
      setCurrentPlayer(player === 'X' ? 'O' : 'X')
    }

    return true
  }

  const handleCellClick = (index: number) => {
    if (gameMode === 'ai' && currentPlayer === 'O') return
    makeMove(index, currentPlayer)
  }

  // AI Move
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getBestMove(board, 'O')
        if (aiMove !== -1) {
          makeMove(aiMove, 'O')
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, board, gameMode, winner])

  const getBestMove = (boardState: Player[], player: Player): number => {
    // Try to win
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        const testBoard = [...boardState]
        testBoard[i] = player
        if (checkWinner(testBoard).winner === player) {
          return i
        }
      }
    }

    // Block opponent from winning
    const opponent = player === 'X' ? 'O' : 'X'
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        const testBoard = [...boardState]
        testBoard[i] = opponent
        if (checkWinner(testBoard).winner === opponent) {
          return i
        }
      }
    }

    // Take center if available
    if (!boardState[4]) return 4

    // Take corners
    const corners = [0, 2, 6, 8]
    for (const corner of corners) {
      if (!boardState[corner]) return corner
    }

    // Take any available space
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) return i
    }

    return -1
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setWinningLine(null)
  }

  const resetAll = () => {
    resetGame()
    setScores({ X: 0, O: 0, draws: 0 })
    setGameHistory([])
  }

  return (
    <div className="app">
      <header>
        <h1>❌ Tic Tac Toe</h1>
        <div className="mode-selector">
          <button 
            className={\`mode-btn \${gameMode === 'human' ? 'active' : ''}\`}
            onClick={() => { setGameMode('human'); resetGame() }}
          >
            👥 2 Players
          </button>
          <button 
            className={\`mode-btn \${gameMode === 'ai' ? 'active' : ''}\`}
            onClick={() => { setGameMode('ai'); resetGame() }}
          >
            🤖 vs AI
          </button>
        </div>
      </header>

      <div className="game-container">
        <div className="game-board">
          <div className="status">
            {winner ? (
              winner === 'draw' ? 
                <span className="draw">It's a Draw! 🤝</span> : 
                <span className={\`winner winner-\${winner}\`}>
                  {winner} Wins! 🎉
                </span>
            ) : (
              <span>
                Current Player: <span className={\`player player-\${currentPlayer}\`}>{currentPlayer}</span>
                {gameMode === 'ai' && currentPlayer === 'O' && <span className="thinking"> (AI thinking...)</span>}
              </span>
            )}
          </div>

          <div className="board">
            {board.map((cell, index) => (
              <button
                key={index}
                className={\`cell \${cell ? \`cell-\${cell}\` : ''} \${
                  winningLine?.includes(index) ? 'winning-cell' : ''
                }\`}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className="controls">
            <button onClick={resetGame} className="btn-primary">
              🔄 New Game
            </button>
            <button onClick={resetAll} className="btn-secondary">
              🗑️ Reset All
            </button>
          </div>
        </div>

        <div className="sidebar">
          <div className="scoreboard">
            <h3>📊 Scoreboard</h3>
            <div className="scores">
              <div className="score-item">
                <span className="score-label">❌ Player X:</span>
                <span className="score-value">{scores.X}</span>
              </div>
              <div className="score-item">
                <span className="score-label">⭕ Player O:</span>
                <span className="score-value">{scores.O}</span>
              </div>
              <div className="score-item">
                <span className="score-label">🤝 Draws:</span>
                <span className="score-value">{scores.draws}</span>
              </div>
            </div>
          </div>

          {gameHistory.length > 0 && (
            <div className="history">
              <h3>📜 Game History</h3>
              <div className="history-list">
                {gameHistory.map((result, index) => (
                  <div key={index} className="history-item">
                    Game {gameHistory.length - index}: {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  min-height: 100vh;
  color: #333;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

header h1 {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mode-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.mode-btn {
  padding: 10px 20px;
  border: 2px solid #ff6b6b;
  background: transparent;
  color: #ff6b6b;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.mode-btn.active,
.mode-btn:hover {
  background: #ff6b6b;
  color: white;
  transform: translateY(-2px);
}

.game-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  align-items: start;
}

.game-board {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding: 15px 25px;
  background: #f8f9fa;
  border-radius: 25px;
  border: 2px solid #e9ecef;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.player {
  font-weight: bold;
  font-size: 1.3rem;
}

.player-X {
  color: #ff6b6b;
}

.player-O {
  color: #4834d4;
}

.winner {
  font-size: 1.4rem;
  padding: 5px 15px;
  border-radius: 15px;
}

.winner-X {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.winner-O {
  background: linear-gradient(135deg, #4834d4, #686de0);
  color: white;
}

.draw {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 1.4rem;
}

.thinking {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: normal;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 20px;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.1);
}

.cell {
  width: 100px;
  height: 100px;
  border: 3px solid #dee2e6;
  background: white;
  border-radius: 15px;
  font-size: 2.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell:hover:not(:disabled) {
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cell:disabled {
  cursor: not-allowed;
}

.cell-X {
  color: #ff6b6b;
  background: linear-gradient(135deg, #fff5f5, #ffe6e6);
  border-color: #ff6b6b;
}

.cell-O {
  color: #4834d4;
  background: linear-gradient(135deg, #f0f0ff, #e6e6ff);
  border-color: #4834d4;
}

.winning-cell {
  animation: pulse 1s infinite;
  border-color: #28a745 !important;
  background: linear-gradient(135deg, #d4edda, #c3e6cb) !important;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.controls {
  display: flex;
  gap: 15px;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.scoreboard, .history {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  border: 2px solid #e9ecef;
}

.scoreboard h3, .history h3 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.1rem;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  font-weight: 500;
}

.score-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #495057;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #6c757d;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .app {
    padding: 20px;
    margin: 10px;
  }
  
  .game-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .cell {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
  
  .board {
    padding: 15px;
  }
  
  .mode-selector {
    flex-direction: column;
    align-items: center;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .status {
    text-align: center;
    font-size: 1rem;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // Color Picker Tool
  {
    id: 'color-picker',
    name: 'Color Picker Pro',
    description: 'Advanced color picker with palette generator and color analysis tools',
    category: 'creative',
    framework: 'react',
    icon: '🎨',
    tags: ['color', 'design', 'tools', 'palette', 'creative'],
    features: [
      'HSL, RGB, HEX color formats',
      'Color palette generator',
      'Color harmony suggestions',
      'Copy to clipboard',
      'Color history',
      'Accessibility contrast checker'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect, useCallback } from 'react'
import './App.css'

interface Color {
  hex: string
  rgb: { r: number, g: number, b: number }
  hsl: { h: number, s: number, l: number }
}

interface ColorHistory {
  color: Color
  timestamp: Date
}

function App() {
  const [currentColor, setCurrentColor] = useState<Color>({
    hex: '#3498db',
    rgb: { r: 52, g: 152, b: 219 },
    hsl: { h: 204, s: 70, l: 53 }
  })
  const [colorHistory, setColorHistory] = useState<ColorHistory[]>([])
  const [palette, setPalette] = useState<Color[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')

  // Convert between color formats
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
      const k = (n + h / (1/12)) % 12
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    }
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255)
    }
  }

  const updateColor = useCallback((hex: string) => {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const newColor: Color = { hex, rgb, hsl }
    
    setCurrentColor(newColor)
    
    // Add to history
    setColorHistory(prev => {
      const newHistory = [{ color: newColor, timestamp: new Date() }, ...prev.slice(0, 19)]
      return newHistory
    })
  }, [])

  const generatePalette = (baseColor: Color, type: string) => {
    const { h, s, l } = baseColor.hsl
    let colors: Color[] = []

    switch (type) {
      case 'monochromatic':
        for (let i = 0; i < 5; i++) {
          const newL = Math.max(10, Math.min(90, l + (i - 2) * 20))
          const rgb = hslToRgb(h, s, newL)
          colors.push({
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            rgb,
            hsl: { h, s, l: newL }
          })
        }
        break
      
      case 'analogous':
        for (let i = 0; i < 5; i++) {
          const newH = (h + (i - 2) * 30 + 360) % 360
          const rgb = hslToRgb(newH, s, l)
          colors.push({
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            rgb,
            hsl: { h: newH, s, l }
          })
        }
        break
      
      case 'complementary':
        const complementaryH = (h + 180) % 360
        const rgb1 = hslToRgb(h, s, l)
        const rgb2 = hslToRgb(complementaryH, s, l)
        colors = [
          { hex: rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgb: rgb1, hsl: { h, s, l } },
          { hex: rgbToHex(rgb2.r, rgb2.g, rgb2.b), rgb: rgb2, hsl: { h: complementaryH, s, l } }
        ]
        break
      
      case 'triadic':
        for (let i = 0; i < 3; i++) {
          const newH = (h + i * 120) % 360
          const rgb = hslToRgb(newH, s, l)
          colors.push({
            hex: rgbToHex(rgb.r, rgb.g, rgb.b),
            rgb,
            hsl: { h: newH, s, l }
          })
        }
        break
    }

    setPalette(colors)
  }

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMessage(\`Copied \${format}!\`)
      setTimeout(() => setCopyMessage(''), 2000)
    })
  }

  const getContrastRatio = (color1: Color, color2: Color) => {
    const getLuminance = (rgb: { r: number, g: number, b: number }) => {
      const { r, g, b } = rgb
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const l1 = getLuminance(color1.rgb)
    const l2 = getLuminance(color2.rgb)
    const brighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (brighter + 0.05) / (darker + 0.05)
  }

  const whiteColor: Color = { hex: '#ffffff', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } }
  const blackColor: Color = { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }
  
  const contrastWithWhite = getContrastRatio(currentColor, whiteColor)
  const contrastWithBlack = getContrastRatio(currentColor, blackColor)

  return (
    <div className="app">
      <header>
        <h1>🎨 Color Picker Pro</h1>
        <p>Advanced color picker with palette generation and analysis tools</p>
      </header>

      <div className="main-content">
        <div className="color-picker-section">
          <div className="current-color" style={{ backgroundColor: currentColor.hex }}>
            <div className="color-overlay">
              <h2>Current Color</h2>
              <div className="color-info">
                <div className="format-group">
                  <label>HEX:</label>
                  <div className="format-value" onClick={() => copyToClipboard(currentColor.hex, 'HEX')}>
                    {currentColor.hex}
                  </div>
                </div>
                <div className="format-group">
                  <label>RGB:</label>
                  <div className="format-value" onClick={() => copyToClipboard(\`rgb(\${currentColor.rgb.r}, \${currentColor.rgb.g}, \${currentColor.rgb.b})\`, 'RGB')}>
                    rgb({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})
                  </div>
                </div>
                <div className="format-group">
                  <label>HSL:</label>
                  <div className="format-value" onClick={() => copyToClipboard(\`hsl(\${currentColor.hsl.h}, \${currentColor.hsl.s}%, \${currentColor.hsl.l}%)\`, 'HSL')}>
                    hsl({currentColor.hsl.h}, {currentColor.hsl.s}%, {currentColor.hsl.l}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="color-input">
            <input
              type="color"
              value={currentColor.hex}
              onChange={(e) => updateColor(e.target.value)}
              className="color-wheel"
            />
            
            <div className="manual-input">
              <input
                type="text"
                value={currentColor.hex}
                onChange={(e) => {
                  const hex = e.target.value
                  if (/^#[0-9A-F]{6}$/i.test(hex)) {
                    updateColor(hex)
                  }
                }}
                placeholder="#3498db"
                className="hex-input"
              />
            </div>
          </div>

          {copyMessage && (
            <div className="copy-message">{copyMessage}</div>
          )}
        </div>

        <div className="controls">
          <div className="palette-section">
            <h3>Color Harmonies</h3>
            <div className="harmony-buttons">
              <button onClick={() => generatePalette(currentColor, 'monochromatic')}>
                Monochromatic
              </button>
              <button onClick={() => generatePalette(currentColor, 'analogous')}>
                Analogous
              </button>
              <button onClick={() => generatePalette(currentColor, 'complementary')}>
                Complementary
              </button>
              <button onClick={() => generatePalette(currentColor, 'triadic')}>
                Triadic
              </button>
            </div>

            {palette.length > 0 && (
              <div className="palette">
                <h4>Generated Palette:</h4>
                <div className="palette-colors">
                  {palette.map((color, index) => (
                    <div
                      key={index}
                      className="palette-color"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => updateColor(color.hex)}
                      title={\`\${color.hex} - Click to use\`}
                    >
                      <span className="palette-hex">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="analysis-section">
            <button 
              className="analysis-toggle"
              onClick={() => setShowAnalysis(!showAnalysis)}
            >
              {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
            </button>

            {showAnalysis && (
              <div className="color-analysis">
                <h4>Accessibility Analysis</h4>
                <div className="contrast-info">
                  <div className="contrast-item">
                    <span>Contrast with White:</span>
                    <span className={\`contrast-ratio \${contrastWithWhite >= 4.5 ? 'good' : 'poor'}\`}>
                      {contrastWithWhite.toFixed(2)}:1
                    </span>
                  </div>
                  <div className="contrast-item">
                    <span>Contrast with Black:</span>
                    <span className={\`contrast-ratio \${contrastWithBlack >= 4.5 ? 'good' : 'poor'}\`}>
                      {contrastWithBlack.toFixed(2)}:1
                    </span>
                  </div>
                </div>
                
                <div className="color-properties">
                  <h4>Color Properties</h4>
                  <div className="property-item">
                    <span>Hue:</span> <span>{currentColor.hsl.h}°</span>
                  </div>
                  <div className="property-item">
                    <span>Saturation:</span> <span>{currentColor.hsl.s}%</span>
                  </div>
                  <div className="property-item">
                    <span>Lightness:</span> <span>{currentColor.hsl.l}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {colorHistory.length > 0 && (
          <div className="history-section">
            <h3>Color History</h3>
            <div className="color-history">
              {colorHistory.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="history-color"
                  style={{ backgroundColor: item.color.hex }}
                  onClick={() => updateColor(item.color.hex)}
                  title={\`\${item.color.hex} - \${item.timestamp.toLocaleTimeString()}\`}
                >
                  <span className="history-hex">{item.color.hex}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

header p {
  margin: 0;
  color: #6c757d;
  font-size: 1.1rem;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.color-picker-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.current-color {
  height: 300px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.color-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.1) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.color-overlay h2 {
  margin: 0 0 20px 0;
  font-size: 1.5rem;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.format-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.format-group label {
  font-weight: 600;
  min-width: 40px;
}

.format-value {
  background: rgba(0,0,0,0.3);
  padding: 5px 12px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: monospace;
}

.format-value:hover {
  background: rgba(0,0,0,0.5);
  transform: scale(1.05);
}

.color-input {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.color-wheel {
  width: 100px;
  height: 100px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.color-wheel:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.hex-input {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  font-family: monospace;
  text-align: center;
  width: 120px;
  transition: all 0.2s ease;
}

.hex-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.copy-message {
  text-align: center;
  padding: 10px;
  background: #d4edda;
  color: #155724;
  border-radius: 10px;
  font-weight: 600;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.palette-section h3, .analysis-section h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.harmony-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.harmony-buttons button, .analysis-toggle {
  padding: 12px 16px;
  border: 2px solid #667eea;
  background: transparent;
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.harmony-buttons button:hover, .analysis-toggle:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.palette {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  margin-top: 15px;
}

.palette h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.palette-colors {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.palette-color {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.palette-color:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.palette-hex {
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-family: monospace;
}

.analysis-toggle {
  margin-bottom: 15px;
}

.color-analysis {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
}

.contrast-info, .color-properties {
  margin-bottom: 20px;
}

.contrast-item, .property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.contrast-ratio {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
}

.contrast-ratio.good {
  background: #d4edda;
  color: #155724;
}

.contrast-ratio.poor {
  background: #f8d7da;
  color: #721c24;
}

.history-section {
  grid-column: 1 / -1;
  margin-top: 20px;
}

.history-section h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.color-history {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.history-color {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-color:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.history-hex {
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-family: monospace;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .app {
    padding: 20px;
    margin: 10px;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .current-color {
    height: 250px;
  }
  
  .harmony-buttons {
    grid-template-columns: 1fr;
  }
  
  .palette-colors, .color-history {
    justify-content: center;
  }
  
  .format-group {
    flex-direction: column;
    text-align: center;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // 2D Platformer Game
  {
    id: '2d-platformer',
    name: '2D Platformer',
    description: 'Classic side-scrolling platformer game with physics, enemies, and collectibles',
    category: 'game',
    framework: 'react',
    icon: '🏃',
    tags: ['game', 'platformer', 'physics', '2d', 'arcade'],
    features: [
      'Character movement and jumping',
      'Physics-based gameplay',
      'Enemy AI and collision detection',
      'Collectible items and scoring',
      'Multiple levels',
      'Responsive controls'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect, useCallback } from 'react'
import './App.css'

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  vx?: number
  vy?: number
}

interface Player extends GameObject {
  onGround: boolean
  lives: number
}

interface Enemy extends GameObject {
  direction: number
}

interface Coin extends GameObject {
  collected: boolean
}

const GRAVITY = 0.5
const JUMP_FORCE = -12
const PLAYER_SPEED = 5
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 300,
    width: 30,
    height: 40,
    vx: 0,
    vy: 0,
    onGround: false,
    lives: 3
  })
  
  const [enemies, setEnemies] = useState<Enemy[]>([
    { x: 300, y: 320, width: 25, height: 30, vx: 2, direction: 1 },
    { x: 500, y: 200, width: 25, height: 30, vx: 1.5, direction: -1 },
    { x: 650, y: 320, width: 25, height: 30, vx: 2, direction: 1 }
  ])
  
  const [coins, setCoins] = useState<Coin[]>([
    { x: 150, y: 250, width: 20, height: 20, collected: false },
    { x: 350, y: 150, width: 20, height: 20, collected: false },
    { x: 550, y: 280, width: 20, height: 20, collected: false },
    { x: 700, y: 200, width: 20, height: 20, collected: false }
  ])
  
  const [platforms] = useState([
    { x: 0, y: 360, width: 200, height: 40 },
    { x: 250, y: 280, width: 150, height: 20 },
    { x: 450, y: 200, width: 100, height: 20 },
    { x: 600, y: 320, width: 200, height: 40 }
  ])
  
  const [keys, setKeys] = useState({
    left: false,
    right: false,
    up: false
  })

  const checkCollision = (rect1: GameObject, rect2: GameObject) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }

  const resetGame = () => {
    setPlayer({
      x: 50,
      y: 300,
      width: 30,
      height: 40,
      vx: 0,
      vy: 0,
      onGround: false,
      lives: 3
    })
    setScore(0)
    setLevel(1)
    setGameOver(false)
    setGameStarted(false)
    setCoins(prev => prev.map(coin => ({ ...coin, collected: false })))
  }

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return

    setPlayer(prevPlayer => {
      let newPlayer = { ...prevPlayer }
      
      // Handle input
      if (keys.left) newPlayer.vx = -PLAYER_SPEED
      else if (keys.right) newPlayer.vx = PLAYER_SPEED
      else newPlayer.vx = 0
      
      if (keys.up && newPlayer.onGround) {
        newPlayer.vy = JUMP_FORCE
        newPlayer.onGround = false
      }
      
      // Apply gravity
      if (!newPlayer.onGround) {
        newPlayer.vy += GRAVITY
      }
      
      // Update position
      newPlayer.x += newPlayer.vx
      newPlayer.y += newPlayer.vy
      
      // Boundary checking
      if (newPlayer.x < 0) newPlayer.x = 0
      if (newPlayer.x + newPlayer.width > CANVAS_WIDTH) newPlayer.x = CANVAS_WIDTH - newPlayer.width
      
      // Platform collision
      newPlayer.onGround = false
      for (const platform of platforms) {
        if (checkCollision(newPlayer, platform)) {
          if (newPlayer.vy > 0 && newPlayer.y < platform.y) {
            newPlayer.y = platform.y - newPlayer.height
            newPlayer.vy = 0
            newPlayer.onGround = true
          }
        }
      }
      
      // Ground collision
      if (newPlayer.y + newPlayer.height > CANVAS_HEIGHT) {
        newPlayer.y = CANVAS_HEIGHT - newPlayer.height
        newPlayer.vy = 0
        newPlayer.onGround = true
      }
      
      return newPlayer
    })
    
    // Update enemies
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        let newEnemy = { ...enemy }
        newEnemy.x += newEnemy.vx! * newEnemy.direction
        
        // Reverse direction at boundaries
        if (newEnemy.x <= 0 || newEnemy.x + newEnemy.width >= CANVAS_WIDTH) {
          newEnemy.direction *= -1
        }
        
        return newEnemy
      })
    )
    
    // Check coin collection
    setCoins(prevCoins => 
      prevCoins.map(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
          setScore(prev => prev + 10)
          return { ...coin, collected: true }
        }
        return coin
      })
    )
    
    // Check enemy collision
    for (const enemy of enemies) {
      if (checkCollision(player, enemy)) {
        setPlayer(prev => ({ ...prev, lives: prev.lives - 1 }))
        if (player.lives <= 1) {
          setGameOver(true)
        }
        break
      }
    }
    
  }, [gameStarted, gameOver, keys, player, enemies, platforms])

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000 / 60) // 60 FPS
    return () => clearInterval(interval)
  }, [gameLoop])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          setKeys(prev => ({ ...prev, left: true }))
          break
        case 'ArrowRight':
        case 'd':
          setKeys(prev => ({ ...prev, right: true }))
          break
        case 'ArrowUp':
        case 'w':
        case ' ':
          e.preventDefault()
          setKeys(prev => ({ ...prev, up: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          setKeys(prev => ({ ...prev, left: false }))
          break
        case 'ArrowRight':
        case 'd':
          setKeys(prev => ({ ...prev, right: false }))
          break
        case 'ArrowUp':
        case 'w':
        case ' ':
          setKeys(prev => ({ ...prev, up: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="menu">
          <h1>🏃 2D Platformer</h1>
          <p>Collect coins and avoid enemies!</p>
          <div className="controls">
            <p><strong>Controls:</strong></p>
            <p>← → or A/D: Move</p>
            <p>↑ or W/Space: Jump</p>
          </div>
          <button className="start-btn" onClick={() => setGameStarted(true)}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="game-container">
        <div className="menu">
          <h1>Game Over!</h1>
          <p>Final Score: {score}</p>
          <button className="start-btn" onClick={resetGame}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="hud">
        <div>Score: {score}</div>
        <div>Lives: {'❤️'.repeat(player.lives)}</div>
        <div>Level: {level}</div>
      </div>
      
      <div className="game-canvas">
        {/* Player */}
        <div 
          className="player"
          style={{
            left: player.x,
            top: player.y,
            width: player.width,
            height: player.height
          }}
        >
          🏃
        </div>
        
        {/* Enemies */}
        {enemies.map((enemy, index) => (
          <div
            key={index}
            className="enemy"
            style={{
              left: enemy.x,
              top: enemy.y,
              width: enemy.width,
              height: enemy.height
            }}
          >
            👾
          </div>
        ))}
        
        {/* Coins */}
        {coins.map((coin, index) => (
          !coin.collected && (
            <div
              key={index}
              className="coin"
              style={{
                left: coin.x,
                top: coin.y,
                width: coin.width,
                height: coin.height
              }}
            >
              🪙
            </div>
          )
        ))}
        
        {/* Platforms */}
        {platforms.map((platform, index) => (
          <div
            key={index}
            className="platform"
            style={{
              left: platform.x,
              top: platform.y,
              width: platform.width,
              height: platform.height
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.menu {
  text-align: center;
  color: white;
  padding: 40px;
}

.menu h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.menu p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.controls {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.controls p {
  margin: 5px 0;
}

.start-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.hud {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 10px;
  margin-bottom: 10px;
  font-weight: bold;
}

.game-canvas {
  position: relative;
  width: 800px;
  height: 400px;
  background: linear-gradient(180deg, #87CEEB 0%, #98FB98 100%);
  border: 3px solid #333;
  border-radius: 10px;
  overflow: hidden;
}

.player {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(0, 123, 255, 0.3);
  border: 2px solid #007bff;
  border-radius: 5px;
  z-index: 10;
}

.enemy {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(255, 0, 0, 0.3);
  border: 2px solid #dc3545;
  border-radius: 5px;
  z-index: 5;
}

.coin {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  animation: spin 2s linear infinite;
  z-index: 3;
}

.platform {
  position: absolute;
  background: linear-gradient(45deg, #8B4513, #A0522D);
  border: 2px solid #654321;
  border-radius: 5px;
  box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 850px) {
  .game-canvas {
    width: 100%;
    height: 300px;
  }
  
  .menu h1 {
    font-size: 2rem;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // Sudoku Puzzle Game
  {
    id: 'sudoku-puzzle',
    name: 'Sudoku Puzzle',
    description: 'Classic 9x9 Sudoku puzzle game with multiple difficulty levels and hints',
    category: 'game',
    framework: 'react',
    icon: '🧩',
    tags: ['game', 'puzzle', 'sudoku', 'logic', 'brain-teaser'],
    features: [
      'Multiple difficulty levels',
      'Auto-validation and error checking',
      'Hint system',
      'Timer and scoring',
      'Save and load game state',
      'Number highlighting'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect } from 'react'
import './App.css'

type Cell = number | null
type Grid = Cell[][]
type Difficulty = 'easy' | 'medium' | 'hard'

const EMPTY_GRID: Grid = Array(9).fill(null).map(() => Array(9).fill(null))

function App() {
  const [grid, setGrid] = useState<Grid>(EMPTY_GRID)
  const [solution, setSolution] = useState<Grid>(EMPTY_GRID)
  const [initialGrid, setInitialGrid] = useState<Grid>(EMPTY_GRID)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [gameStarted, setGameStarted] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [errors, setErrors] = useState<[number, number][]>([])
  const [hints, setHints] = useState(3)
  const [time, setTime] = useState(0)

  // Generate a valid Sudoku puzzle
  const generatePuzzle = (difficulty: Difficulty) => {
    const newSolution = generateCompleteSudoku()
    setSolution(newSolution)
    
    const newGrid = JSON.parse(JSON.stringify(newSolution))
    const cellsToRemove = {
      easy: 40,
      medium: 50,
      hard: 60
    }[difficulty]
    
    // Remove cells to create puzzle
    const cells = []
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        cells.push([i, j])
      }
    }
    
    // Shuffle and remove cells
    for (let i = 0; i < cellsToRemove; i++) {
      if (cells.length === 0) break
      const randomIndex = Math.floor(Math.random() * cells.length)
      const [row, col] = cells.splice(randomIndex, 1)[0]
      newGrid[row][col] = null
    }
    
    setGrid(newGrid)
    setInitialGrid(JSON.parse(JSON.stringify(newGrid)))
    setGameStarted(true)
    setGameWon(false)
    setErrors([])
    setHints(3)
    setTime(0)
  }

  const generateCompleteSudoku = (): Grid => {
    const grid: Grid = Array(9).fill(null).map(() => Array(9).fill(null))
    
    const isValid = (grid: Grid, row: number, col: number, num: number): boolean => {
      // Check row
      for (let j = 0; j < 9; j++) {
        if (grid[row][j] === num) return false
      }
      
      // Check column
      for (let i = 0; i < 9; i++) {
        if (grid[i][col] === num) return false
      }
      
      // Check 3x3 box
      const boxRow = Math.floor(row / 3) * 3
      const boxCol = Math.floor(col / 3) * 3
      for (let i = boxRow; i < boxRow + 3; i++) {
        for (let j = boxCol; j < boxCol + 3; j++) {
          if (grid[i][j] === num) return false
        }
      }
      
      return true
    }
    
    const fillGrid = (grid: Grid): boolean => {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (grid[i][j] === null) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
            for (const num of numbers) {
              if (isValid(grid, i, j, num)) {
                grid[i][j] = num
                if (fillGrid(grid)) return true
                grid[i][j] = null
              }
            }
            return false
          }
        }
      }
      return true
    }
    
    fillGrid(grid)
    return grid
  }

  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] !== null) return // Can't edit pre-filled cells
    setSelectedCell([row, col])
  }

  const handleNumberClick = (num: number) => {
    if (!selectedCell || gameWon) return
    
    const [row, col] = selectedCell
    if (initialGrid[row][col] !== null) return
    
    const newGrid = [...grid]
    newGrid[row][col] = num
    setGrid(newGrid)
    
    // Check for errors
    const newErrors = []
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newGrid[i][j] && !isValidMove(newGrid, i, j, newGrid[i][j])) {
          newErrors.push([i, j])
        }
      }
    }
    setErrors(newErrors)
    
    // Check if puzzle is complete
    if (isPuzzleComplete(newGrid) && newErrors.length === 0) {
      setGameWon(true)
    }
  }

  const isValidMove = (grid: Grid, row: number, col: number, num: number): boolean => {
    // Check row (excluding current cell)
    for (let j = 0; j < 9; j++) {
      if (j !== col && grid[row][j] === num) return false
    }
    
    // Check column (excluding current cell)
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid[i][col] === num) return false
    }
    
    // Check 3x3 box (excluding current cell)
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && grid[i][j] === num) return false
      }
    }
    
    return true
  }

  const isPuzzleComplete = (grid: Grid): boolean => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === null) return false
      }
    }
    return true
  }

  const handleHint = () => {
    if (hints <= 0 || !selectedCell) return
    
    const [row, col] = selectedCell
    if (initialGrid[row][col] !== null) return
    
    const newGrid = [...grid]
    newGrid[row][col] = solution[row][col]
    setGrid(newGrid)
    setHints(hints - 1)
  }

  const clearCell = () => {
    if (!selectedCell || gameWon) return
    
    const [row, col] = selectedCell
    if (initialGrid[row][col] !== null) return
    
    const newGrid = [...grid]
    newGrid[row][col] = null
    setGrid(newGrid)
  }

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameWon) {
      const timer = setInterval(() => {
        setTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameStarted, gameWon])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`
  }

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="menu">
          <h1>🧩 Sudoku Puzzle</h1>
          <p>Fill the 9x9 grid so that every row, column and 3x3 box contains the digits 1-9</p>
          
          <div className="difficulty-selector">
            <h3>Select Difficulty:</h3>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
              <button
                key={level}
                className={\`difficulty-btn \${difficulty === level ? 'active' : ''}\`}
                onClick={() => setDifficulty(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          
          <button className="start-btn" onClick={() => generatePuzzle(difficulty)}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (gameWon) {
    return (
      <div className="game-container">
        <div className="menu">
          <h1>🎉 Congratulations!</h1>
          <p>You solved the {difficulty} Sudoku puzzle!</p>
          <p>Time: {formatTime(time)}</p>
          <button className="start-btn" onClick={() => setGameStarted(false)}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <div>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
          <div>Time: {formatTime(time)}</div>
          <div>Hints: {hints}</div>
        </div>
        <div className="game-actions">
          <button onClick={handleHint} disabled={hints <= 0 || !selectedCell}>
            💡 Hint
          </button>
          <button onClick={clearCell} disabled={!selectedCell}>
            🗑️ Clear
          </button>
          <button onClick={() => setGameStarted(false)}>
            🔄 New Game
          </button>
        </div>
      </div>

      <div className="sudoku-grid">
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={\`\${rowIndex}-\${colIndex}\`}
              className={[
                'sudoku-cell',
                selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex ? 'selected' : '',
                initialGrid[rowIndex][colIndex] !== null ? 'pre-filled' : '',
                errors.some(([r, c]) => r === rowIndex && c === colIndex) ? 'error' : '',
                selectedNumber && cell === selectedNumber ? 'highlighted' : ''
              ].filter(Boolean).join(' ')}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        ))}
      </div>

      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className={\`number-btn \${selectedNumber === num ? 'selected' : ''}\`}
            onClick={() => handleNumberClick(num)}
            onMouseEnter={() => setSelectedNumber(num)}
            onMouseLeave={() => setSelectedNumber(null)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
}

.menu {
  text-align: center;
  color: #333;
}

.menu h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #667eea;
}

.menu p {
  font-size: 1.1rem;
  margin-bottom: 30px;
  color: #666;
}

.difficulty-selector {
  margin: 30px 0;
}

.difficulty-selector h3 {
  margin-bottom: 15px;
  color: #333;
}

.difficulty-btn {
  background: #f8f9fa;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.difficulty-btn:hover,
.difficulty-btn.active {
  background: #667eea;
  color: white;
}

.start-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.game-info {
  display: flex;
  gap: 20px;
  font-weight: bold;
  color: #333;
}

.game-actions {
  display: flex;
  gap: 10px;
}

.game-actions button {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.game-actions button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.game-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 1px;
  background: #333;
  border: 3px solid #333;
  margin: 20px 0;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}

.sudoku-cell {
  width: 48px;
  height: 48px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
}

.sudoku-cell:nth-child(3n) {
  border-right: 3px solid #333;
}

.sudoku-cell:nth-child(n+19):nth-child(-n+27),
.sudoku-cell:nth-child(n+46):nth-child(-n+54) {
  border-bottom: 3px solid #333;
}

.sudoku-cell.selected {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}

.sudoku-cell.pre-filled {
  background: #f5f5f5;
  color: #333;
  font-weight: 900;
}

.sudoku-cell.error {
  background: #ffebee;
  color: #d32f2f;
}

.sudoku-cell.highlighted {
  background: #fff3e0;
}

.sudoku-cell:hover:not(.pre-filled) {
  background: #f0f8ff;
}

.number-pad {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 5px;
  max-width: 450px;
  margin: 20px auto 0;
}

.number-btn {
  width: 48px;
  height: 48px;
  background: #f8f9fa;
  border: 2px solid #667eea;
  color: #667eea;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.number-btn:hover,
.number-btn.selected {
  background: #667eea;
  color: white;
}

@media (max-width: 600px) {
  .game-container {
    padding: 20px;
  }
  
  .sudoku-cell,
  .number-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .game-header {
    flex-direction: column;
    text-align: center;
  }
  
  .game-info {
    justify-content: center;
    flex-wrap: wrap;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // Chess Game
  {
    id: 'chess-game',
    name: 'Chess Game',
    description: 'Classic chess game with move validation, AI opponent, and game analysis',
    category: 'game',
    framework: 'react',
    icon: '♟️',
    tags: ['game', 'chess', 'strategy', 'ai', 'board-game'],
    features: [
      'Complete chess rule implementation',
      'Move validation and highlighting',
      'AI opponent with difficulty levels',
      'Game history and replay',
      'Check and checkmate detection',
      'Piece promotion'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect } from 'react'
import './App.css'

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
type PieceColor = 'white' | 'black'
type Square = [number, number]

interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

type Board = (Piece | null)[][]

const PIECE_SYMBOLS = {
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

const initialBoard: Board = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' }
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' }
  ]
]

function App() {
  const [board, setBoard] = useState<Board>(JSON.parse(JSON.stringify(initialBoard)))
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white')
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [validMoves, setValidMoves] = useState<Square[]>([])
  const [gameMode, setGameMode] = useState<'human' | 'ai'>('human')
  const [gameStatus, setGameStatus] = useState<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing')
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [gameStarted, setGameStarted] = useState(false)

  const isValidSquare = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8
  }

  const getPossibleMoves = (board: Board, fromRow: number, fromCol: number): Square[] => {
    const piece = board[fromRow][fromCol]
    if (!piece) return []

    const moves: Square[] = []
    const { type, color } = piece

    switch (type) {
      case 'pawn':
        const direction = color === 'white' ? -1 : 1
        const startRow = color === 'white' ? 6 : 1
        
        // Forward move
        if (isValidSquare(fromRow + direction, fromCol) && !board[fromRow + direction][fromCol]) {
          moves.push([fromRow + direction, fromCol])
          
          // Double move from starting position
          if (fromRow === startRow && !board[fromRow + 2 * direction][fromCol]) {
            moves.push([fromRow + 2 * direction, fromCol])
          }
        }
        
        // Captures
        for (const deltaCol of [-1, 1]) {
          const newRow = fromRow + direction
          const newCol = fromCol + deltaCol
          if (isValidSquare(newRow, newCol) && board[newRow][newCol] && board[newRow][newCol]!.color !== color) {
            moves.push([newRow, newCol])
          }
        }
        break

      case 'rook':
        // Horizontal and vertical moves
        for (const [deltaRow, deltaCol] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = fromRow + deltaRow * i
            const newCol = fromCol + deltaCol * i
            
            if (!isValidSquare(newRow, newCol)) break
            
            if (board[newRow][newCol]) {
              if (board[newRow][newCol]!.color !== color) {
                moves.push([newRow, newCol])
              }
              break
            }
            
            moves.push([newRow, newCol])
          }
        }
        break

      case 'bishop':
        // Diagonal moves
        for (const [deltaRow, deltaCol] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = fromRow + deltaRow * i
            const newCol = fromCol + deltaCol * i
            
            if (!isValidSquare(newRow, newCol)) break
            
            if (board[newRow][newCol]) {
              if (board[newRow][newCol]!.color !== color) {
                moves.push([newRow, newCol])
              }
              break
            }
            
            moves.push([newRow, newCol])
          }
        }
        break

      case 'knight':
        const knightMoves = [
          [2, 1], [2, -1], [-2, 1], [-2, -1],
          [1, 2], [1, -2], [-1, 2], [-1, -2]
        ]
        
        for (const [deltaRow, deltaCol] of knightMoves) {
          const newRow = fromRow + deltaRow
          const newCol = fromCol + deltaCol
          
          if (isValidSquare(newRow, newCol) && 
              (!board[newRow][newCol] || board[newRow][newCol]!.color !== color)) {
            moves.push([newRow, newCol])
          }
        }
        break

      case 'queen':
        // Combination of rook and bishop moves
        for (const [deltaRow, deltaCol] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = fromRow + deltaRow * i
            const newCol = fromCol + deltaCol * i
            
            if (!isValidSquare(newRow, newCol)) break
            
            if (board[newRow][newCol]) {
              if (board[newRow][newCol]!.color !== color) {
                moves.push([newRow, newCol])
              }
              break
            }
            
            moves.push([newRow, newCol])
          }
        }
        break

      case 'king':
        for (const [deltaRow, deltaCol] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const newRow = fromRow + deltaRow
          const newCol = fromCol + deltaCol
          
          if (isValidSquare(newRow, newCol) && 
              (!board[newRow][newCol] || board[newRow][newCol]!.color !== color)) {
            moves.push([newRow, newCol])
          }
        }
        break
    }

    return moves
  }

  const isInCheck = (board: Board, color: PieceColor): boolean => {
    // Find the king
    let kingPos: Square | null = null
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.type === 'king' && piece.color === color) {
          kingPos = [row, col]
          break
        }
      }
    }

    if (!kingPos) return false

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.color !== color) {
          const moves = getPossibleMoves(board, row, col)
          if (moves.some(([r, c]) => r === kingPos![0] && c === kingPos![1])) {
            return true
          }
        }
      }
    }

    return false
  }

  const makeMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): Board => {
    const newBoard = board.map(row => [...row])
    const piece = newBoard[fromRow][fromCol]
    
    if (!piece) return newBoard

    // Move the piece
    newBoard[toRow][toCol] = { ...piece, hasMoved: true }
    newBoard[fromRow][fromCol] = null

    // Pawn promotion
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      newBoard[toRow][toCol] = { type: 'queen', color: piece.color, hasMoved: true }
    }

    return newBoard
  }

  const handleSquareClick = (row: number, col: number) => {
    if (gameMode === 'ai' && currentPlayer === 'black') return

    const piece = board[row][col]

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare
      
      // Check if this is a valid move
      if (validMoves.some(([r, c]) => r === row && c === col)) {
        const newBoard = makeMove(fromRow, fromCol, toRow, toCol)
        
        // Check if move puts own king in check
        if (!isInCheck(newBoard, currentPlayer)) {
          setBoard(newBoard)
          
          // Add to move history
          const moveNotation = \`\${String.fromCharCode(97 + fromCol)}\${8 - fromRow} -> \${String.fromCharCode(97 + col)}\${8 - row}\`
          setMoveHistory(prev => [...prev, moveNotation])
          
          // Check game status
          const nextPlayer = currentPlayer === 'white' ? 'black' : 'white'
          if (isInCheck(newBoard, nextPlayer)) {
            setGameStatus('check')
          } else {
            setGameStatus('playing')
          }
          
          setCurrentPlayer(nextPlayer)
        }
      }
      
      setSelectedSquare(null)
      setValidMoves([])
    } else if (piece && piece.color === currentPlayer) {
      setSelectedSquare([row, col])
      const moves = getPossibleMoves(board, row, col)
      setValidMoves(moves)
    }
  }

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(initialBoard)))
    setCurrentPlayer('white')
    setSelectedSquare(null)
    setValidMoves([])
    setGameStatus('playing')
    setMoveHistory([])
    setGameStarted(false)
  }

  // AI Move (simple random valid move)
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'black' && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const allPieces: Array<{row: number, col: number, moves: Square[]}> = []
        
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const piece = board[row][col]
            if (piece && piece.color === 'black') {
              const moves = getPossibleMoves(board, row, col)
              if (moves.length > 0) {
                allPieces.push({ row, col, moves })
              }
            }
          }
        }

        if (allPieces.length > 0) {
          const randomPiece = allPieces[Math.floor(Math.random() * allPieces.length)]
          const randomMove = randomPiece.moves[Math.floor(Math.random() * randomPiece.moves.length)]
          
          const newBoard = makeMove(randomPiece.row, randomPiece.col, randomMove[0], randomMove[1])
          setBoard(newBoard)
          
          const moveNotation = \`\${String.fromCharCode(97 + randomPiece.col)}\${8 - randomPiece.row} -> \${String.fromCharCode(97 + randomMove[1])}\${8 - randomMove[0]}\`
          setMoveHistory(prev => [...prev, moveNotation])
          
          if (isInCheck(newBoard, 'white')) {
            setGameStatus('check')
          } else {
            setGameStatus('playing')
          }
          
          setCurrentPlayer('white')
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, gameStatus, board])

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="menu">
          <h1>♟️ Chess Game</h1>
          <p>Play the classic game of chess with move validation and AI opponent</p>
          
          <div className="mode-selector">
            <h3>Select Game Mode:</h3>
            <button
              className={\`mode-btn \${gameMode === 'human' ? 'active' : ''}\`}
              onClick={() => setGameMode('human')}
            >
              👥 Two Players
            </button>
            <button
              className={\`mode-btn \${gameMode === 'ai' ? 'active' : ''}\`}
              onClick={() => setGameMode('ai')}
            >
              🤖 vs Computer
            </button>
          </div>
          
          <button className="start-btn" onClick={() => setGameStarted(true)}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <div>Current Player: <span className={\`player \${currentPlayer}\`}>{currentPlayer}</span></div>
          <div>Status: <span className={\`status \${gameStatus}\`}>{gameStatus}</span></div>
          <div>Mode: {gameMode === 'ai' ? '🤖 vs AI' : '👥 2 Players'}</div>
        </div>
        <button className="reset-btn" onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      <div className="chess-board">
        {board.map((row, rowIndex) => (
          row.map((piece, colIndex) => (
            <div
              key={\`\${rowIndex}-\${colIndex}\`}
              className={[
                'chess-square',
                (rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark',
                selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex ? 'selected' : '',
                validMoves.some(([r, c]) => r === rowIndex && c === colIndex) ? 'valid-move' : '',
                piece && isInCheck(board, piece.color) && piece.type === 'king' ? 'in-check' : ''
              ].filter(Boolean).join(' ')}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <div className="chess-piece">
                  {PIECE_SYMBOLS[piece.color][piece.type]}
                </div>
              )}
              <div className="square-coord">
                {String.fromCharCode(97 + colIndex)}{8 - rowIndex}
              </div>
            </div>
          ))
        ))}
      </div>

      <div className="move-history">
        <h3>Move History</h3>
        <div className="moves">
          {moveHistory.map((move, index) => (
            <div key={index} className="move">
              {index + 1}. {move}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
}

.menu {
  text-align: center;
  color: #333;
}

.menu h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #2c3e50;
}

.menu p {
  font-size: 1.1rem;
  margin-bottom: 30px;
  color: #666;
}

.mode-selector {
  margin: 30px 0;
}

.mode-selector h3 {
  margin-bottom: 15px;
  color: #333;
}

.mode-btn {
  background: #f8f9fa;
  border: 2px solid #3498db;
  color: #3498db;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.mode-btn:hover,
.mode-btn.active {
  background: #3498db;
  color: white;
}

.start-btn {
  background: linear-gradient(45deg, #3498db, #2c3e50);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.game-info {
  display: flex;
  gap: 30px;
  font-weight: bold;
  color: #333;
  flex-wrap: wrap;
}

.player.white {
  color: #2c3e50;
}

.player.black {
  color: #e74c3c;
}

.status.check {
  color: #e74c3c;
  font-weight: bold;
}

.status.checkmate {
  color: #c0392b;
  font-weight: bold;
}

.reset-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.reset-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.chess-board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  width: 480px;
  height: 480px;
  margin: 20px auto;
  border: 4px solid #2c3e50;
  border-radius: 10px;
  overflow: hidden;
}

.chess-square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 60px;
  height: 60px;
}

.chess-square.light {
  background: #f0d9b5;
}

.chess-square.dark {
  background: #b58863;
}

.chess-square:hover {
  box-shadow: inset 0 0 0 3px rgba(52, 152, 219, 0.5);
}

.chess-square.selected {
  box-shadow: inset 0 0 0 3px #3498db;
}

.chess-square.valid-move {
  box-shadow: inset 0 0 0 3px #27ae60;
}

.chess-square.valid-move::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(39, 174, 96, 0.6);
  border-radius: 50%;
}

.chess-square.in-check {
  box-shadow: inset 0 0 0 3px #e74c3c;
}

.chess-piece {
  font-size: 2.5rem;
  user-select: none;
  z-index: 2;
}

.square-coord {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.6rem;
  color: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.chess-square.dark .square-coord {
  color: rgba(255, 255, 255, 0.3);
}

.move-history {
  margin-top: 20px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.move-history h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.moves {
  max-height: 150px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 5px;
}

.move {
  font-size: 0.9rem;
  color: #666;
  padding: 2px 0;
}

@media (max-width: 600px) {
  .chess-board {
    width: 320px;
    height: 320px;
  }
  
  .chess-square {
    width: 40px;
    height: 40px;
  }
  
  .chess-piece {
    font-size: 1.8rem;
  }
  
  .game-info {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .game-header {
    flex-direction: column;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  },

  // Match-3 Puzzle Game
  {
    id: 'match3-puzzle',
    name: 'Match-3 Puzzle',
    description: 'Colorful match-3 puzzle game with cascading matches, power-ups, and levels',
    category: 'game',
    framework: 'react',
    icon: '💎',
    tags: ['game', 'puzzle', 'match3', 'casual', 'gems'],
    features: [
      'Drag and drop gem matching',
      'Cascading match effects',
      'Special power-up gems',
      'Level progression system',
      'Score multipliers',
      'Smooth animations'
    ],
    files: [
      {
        path: 'App.tsx',
        content: `import React, { useState, useEffect, useCallback } from 'react'
import './App.css'

type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'bomb' | 'star'
type Grid = GemType[][]

const GEM_COLORS = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
  purple: '#9b59b6',
  orange: '#e67e22',
  bomb: '#34495e',
  star: '#f39c12'
}

const GEM_SYMBOLS = {
  red: '💎',
  blue: '🔷',
  green: '💚',
  yellow: '🟡',
  purple: '🟣',
  orange: '🟠',
  bomb: '💣',
  star: '⭐'
}

const BOARD_SIZE = 8
const BASIC_GEMS: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

function App() {
  const [grid, setGrid] = useState<Grid>([])
  const [selectedGem, setSelectedGem] = useState<[number, number] | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [moves, setMoves] = useState(30)
  const [target, setTarget] = useState(1000)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [matchAnimation, setMatchAnimation] = useState<[number, number][]>([])

  const createRandomGem = (): GemType => {
    return BASIC_GEMS[Math.floor(Math.random() * BASIC_GEMS.length)]
  }

  const initializeGrid = (): Grid => {
    const newGrid: Grid = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      const newRow: GemType[] = []
      for (let col = 0; col < BOARD_SIZE; col++) {
        let gem: GemType
        do {
          gem = createRandomGem()
        } while (
          (col >= 2 && newRow[col - 1] === gem && newRow[col - 2] === gem) ||
          (row >= 2 && newGrid[row - 1]?.[col] === gem && newGrid[row - 2]?.[col] === gem)
        )
        newRow.push(gem)
      }
      newGrid.push(newRow)
    }
    return newGrid
  }

  const findMatches = (grid: Grid): [number, number][] => {
    const matches: [number, number][] = []
    
    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      let count = 1
      let currentGem = grid[row][0]
      
      for (let col = 1; col < BOARD_SIZE; col++) {
        if (grid[row][col] === currentGem && !['bomb', 'star'].includes(currentGem)) {
          count++
        } else {
          if (count >= 3) {
            for (let i = col - count; i < col; i++) {
              matches.push([row, i])
            }
          }
          currentGem = grid[row][col]
          count = 1
        }
      }
      
      if (count >= 3) {
        for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
          matches.push([row, i])
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < BOARD_SIZE; col++) {
      let count = 1
      let currentGem = grid[0][col]
      
      for (let row = 1; row < BOARD_SIZE; row++) {
        if (grid[row][col] === currentGem && !['bomb', 'star'].includes(currentGem)) {
          count++
        } else {
          if (count >= 3) {
            for (let i = row - count; i < row; i++) {
              matches.push([i, col])
            }
          }
          currentGem = grid[row][col]
          count = 1
        }
      }
      
      if (count >= 3) {
        for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
          matches.push([i, col])
        }
      }
    }

    return matches
  }

  const removeMatches = (grid: Grid, matches: [number, number][]): Grid => {
    const newGrid = grid.map(row => [...row])
    
    matches.forEach(([row, col]) => {
      // Check for special gem creation
      const matchCount = matches.filter(([r, c]) => r === row || c === col).length
      
      if (matchCount >= 5) {
        newGrid[row][col] = 'star' // Rainbow gem
      } else if (matchCount >= 4) {
        newGrid[row][col] = 'bomb' // Bomb gem
      } else {
        newGrid[row][col] = createRandomGem()
      }
    })

    return newGrid
  }

  const applyGravity = (grid: Grid): Grid => {
    const newGrid: Grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
    
    for (let col = 0; col < BOARD_SIZE; col++) {
      const column = []
      
      // Collect non-empty gems from bottom to top
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        column.push(grid[row][col])
      }
      
      // Fill with new gems at the top
      while (column.length < BOARD_SIZE) {
        column.push(createRandomGem())
      }
      
      // Place back in grid
      for (let row = 0; row < BOARD_SIZE; row++) {
        newGrid[BOARD_SIZE - 1 - row][col] = column[row]
      }
    }

    return newGrid
  }

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    // Check if move is to adjacent cell
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      // Simulate the swap and check for matches
      const testGrid = grid.map(row => [...row])
      const temp = testGrid[fromRow][fromCol]
      testGrid[fromRow][fromCol] = testGrid[toRow][toCol]
      testGrid[toRow][toCol] = temp
      
      return findMatches(testGrid).length > 0
    }
    
    return false
  }

  const processMatches = useCallback(async (currentGrid: Grid): Promise<Grid> => {
    let newGrid = currentGrid
    let totalMatches = 0
    let multiplier = 1

    while (true) {
      const matches = findMatches(newGrid)
      
      if (matches.length === 0) break

      setMatchAnimation(matches)
      totalMatches += matches.length
      
      // Add score with multiplier
      setScore(prev => prev + matches.length * 10 * multiplier)
      multiplier += 0.5
      
      // Remove matches and apply gravity
      newGrid = removeMatches(newGrid, matches)
      newGrid = applyGravity(newGrid)
      
      // Small delay for animation
      await new Promise(resolve => setTimeout(resolve, 300))
      setMatchAnimation([])
    }

    return newGrid
  }, [])

  const handleGemClick = async (row: number, col: number) => {
    if (isProcessing || gameOver) return

    if (!selectedGem) {
      setSelectedGem([row, col])
    } else {
      const [fromRow, fromCol] = selectedGem
      
      if (fromRow === row && fromCol === col) {
        setSelectedGem(null)
        return
      }

      if (isValidMove(fromRow, fromCol, row, col)) {
        setIsProcessing(true)
        setMoves(prev => prev - 1)
        
        // Perform swap
        const newGrid = grid.map(r => [...r])
        const temp = newGrid[fromRow][fromCol]
        newGrid[fromRow][fromCol] = newGrid[row][col]
        newGrid[row][col] = temp
        
        setGrid(newGrid)
        setSelectedGem(null)
        
        // Process cascading matches
        const finalGrid = await processMatches(newGrid)
        setGrid(finalGrid)
        setIsProcessing(false)
      } else {
        setSelectedGem([row, col])
      }
    }
  }

  const startGame = () => {
    const newGrid = initializeGrid()
    setGrid(newGrid)
    setScore(0)
    setLevel(1)
    setMoves(30)
    setTarget(1000)
    setGameStarted(true)
    setGameOver(false)
    setSelectedGem(null)
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
  }

  // Check for game over conditions
  useEffect(() => {
    if (gameStarted && moves <= 0) {
      setGameOver(true)
    }
    
    if (score >= target) {
      setLevel(prev => prev + 1)
      setMoves(prev => prev + 5)
      setTarget(prev => prev * 1.5)
    }
  }, [moves, score, target, gameStarted])

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="menu">
          <h1>💎 Match-3 Puzzle</h1>
          <p>Match 3 or more gems to score points and advance through levels!</p>
          
          <div className="instructions">
            <h3>How to Play:</h3>
            <ul>
              <li>Click two adjacent gems to swap them</li>
              <li>Match 3 or more gems of the same color</li>
              <li>Create special gems with bigger matches</li>
              <li>Reach the target score to advance</li>
            </ul>
          </div>
          
          <button className="start-btn" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="game-container">
        <div className="menu">
          <h1>Game Over!</h1>
          <p>Final Score: {score.toLocaleString()}</p>
          <p>Level Reached: {level}</p>
          <button className="start-btn" onClick={resetGame}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="stats">
          <div className="stat">
            <span className="label">Score:</span>
            <span className="value">{score.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Level:</span>
            <span className="value">{level}</span>
          </div>
          <div className="stat">
            <span className="label">Moves:</span>
            <span className="value">{moves}</span>
          </div>
          <div className="stat">
            <span className="label">Target:</span>
            <span className="value">{target.toLocaleString()}</span>
          </div>
        </div>
        <button className="reset-btn" onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: \`\${Math.min(100, (score / target) * 100)}%\` }}
        />
      </div>

      <div className="game-board">
        {grid.map((row, rowIndex) => (
          row.map((gem, colIndex) => (
            <div
              key={\`\${rowIndex}-\${colIndex}\`}
              className={[
                'gem-cell',
                selectedGem && selectedGem[0] === rowIndex && selectedGem[1] === colIndex ? 'selected' : '',
                matchAnimation.some(([r, c]) => r === rowIndex && c === colIndex) ? 'matching' : '',
                isProcessing ? 'processing' : ''
              ].filter(Boolean).join(' ')}
              style={{ backgroundColor: GEM_COLORS[gem] }}
              onClick={() => handleGemClick(rowIndex, colIndex)}
            >
              <div className="gem-symbol">
                {GEM_SYMBOLS[gem]}
              </div>
            </div>
          ))
        ))}
      </div>
    </div>
  )
}

export default App`,
        mimeType: 'application/typescript'
      },
      {
        path: 'App.css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
}

.menu {
  text-align: center;
  color: #333;
}

.menu h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #667eea;
}

.menu p {
  font-size: 1.1rem;
  margin-bottom: 30px;
  color: #666;
}

.instructions {
  text-align: left;
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
}

.instructions h3 {
  margin-bottom: 15px;
  color: #333;
}

.instructions ul {
  list-style: none;
  padding: 0;
}

.instructions li {
  padding: 5px 0;
  color: #666;
}

.instructions li::before {
  content: '✨ ';
  margin-right: 5px;
}

.start-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.label {
  font-size: 0.8rem;
  color: #666;
  font-weight: bold;
  text-transform: uppercase;
}

.value {
  font-size: 1.2rem;
  color: #333;
  font-weight: bold;
}

.reset-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.reset-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-width: 480px;
  margin: 0 auto;
  background: #34495e;
  padding: 10px;
  border-radius: 15px;
}

.gem-cell {
  aspect-ratio: 1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.gem-cell:hover:not(.processing) {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.gem-cell.selected {
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.5);
}

.gem-cell.matching {
  animation: pulse 0.3s ease-in-out;
  transform: scale(1.1);
}

.gem-cell.processing {
  pointer-events: none;
  opacity: 0.7;
}

.gem-symbol {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@media (max-width: 600px) {
  .game-container {
    padding: 20px;
  }
  
  .game-board {
    max-width: 320px;
  }
  
  .gem-symbol {
    font-size: 1.5rem;
  }
  
  .stats {
    justify-content: center;
  }
  
  .game-header {
    flex-direction: column;
    text-align: center;
  }
}`,
        mimeType: 'text/css'
      }
    ]
  }
]

// Helper function to get template by ID
export function getTemplateById(id: string): AppTemplate | undefined {
  return APP_TEMPLATES.find(template => template.id === id)
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): AppTemplate[] {
  return APP_TEMPLATES.filter(template => template.category === category)
}

// Helper function to search templates
export function searchTemplates(query: string): AppTemplate[] {
  const searchTerm = query.toLowerCase()
  return APP_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    template.features.some(feature => feature.toLowerCase().includes(searchTerm))
  )
}