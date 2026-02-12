import { useState } from 'react'
import type { Note, NoteFolder } from '~/types/notes'
import { useMesa } from '~/contexts/MesaContext'
import FolderTree from './FolderTree'

type NotesSidebarProps = {
  notes: Note[]
  folders: NoteFolder[]
  activeNoteId: string | null
  onSelectNote: (noteId: string) => void
  filterEncounterId?: string
}

export default function NotesSidebar({
  notes,
  folders,
  activeNoteId,
  onSelectNote,
  filterEncounterId,
}: NotesSidebarProps) {
  const { dispatch } = useMesa()
  const [search, setSearch] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const filteredNotes = notes.filter(n => {
    if (filterEncounterId) {
      return n.links.some(l => l.type === 'encounter' && l.id === filterEncounterId)
    }
    if (search.trim()) {
      return n.title.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  const selectedFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null

  function handleCreateNote() {
    const now = new Date().toISOString()
    const note: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      folderId: selectedFolderId,
      links: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }
    dispatch({ type: 'CREATE_NOTE', payload: { note } })
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return
    const folder: NoteFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      parentId: selectedFolderId,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'CREATE_NOTE_FOLDER', payload: { folder } })
    setNewFolderName('')
    setShowNewFolder(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Actions */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-stroke flex-shrink-0">
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px]
            bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
        >
          <span>+</span>
          <span>Nota</span>
        </button>
        <button
          onClick={() => setShowNewFolder(!showNewFolder)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px]
            text-muted hover:text-fg hover:bg-surface transition-colors"
        >
          <span>+</span>
          <span>Pasta</span>
        </button>
        <div className="flex-1" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="w-20 bg-surface/50 border border-stroke rounded px-1.5 py-0.5
            text-[10px] text-fg placeholder:text-muted/40 outline-none
            focus:border-accent/40 focus:w-28 transition-all"
        />
      </div>

      {/* Selected folder indicator */}
      {selectedFolder && (
        <div className="flex items-center gap-1 px-2 py-1 border-b border-stroke/50 flex-shrink-0 bg-accent/5">
          <span className="text-[9px] text-muted">em:</span>
          <span className="text-[9px] text-accent font-medium truncate">📁 {selectedFolder.name}</span>
          <button
            onClick={() => setSelectedFolderId(null)}
            className="text-[9px] text-muted hover:text-fg ml-auto"
          >
            ✕
          </button>
        </div>
      )}

      {/* New folder inline form */}
      {showNewFolder && (
        <div className="flex items-center gap-1 px-2 py-1 border-b border-stroke/50 flex-shrink-0">
          <span className="text-[10px]">📁</span>
          <input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') setShowNewFolder(false)
            }}
            placeholder={selectedFolder ? `Subpasta em ${selectedFolder.name}` : 'Nome da pasta'}
            autoFocus
            className="flex-1 bg-transparent text-[10px] text-fg
              border-b border-accent outline-none placeholder:text-muted/40"
          />
          <button
            onClick={handleCreateFolder}
            className="text-[10px] text-accent hover:text-accent/80"
          >
            OK
          </button>
        </div>
      )}

      {/* Folder tree + notes */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredNotes.length === 0 && folders.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-[10px] text-muted/60">
              {search ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
            </div>
          </div>
        ) : (
          <FolderTree
            folders={search ? [] : folders}
            notes={filteredNotes}
            activeNoteId={activeNoteId}
            selectedFolderId={selectedFolderId}
            onSelectNote={onSelectNote}
            onSelectFolder={setSelectedFolderId}
          />
        )}
      </div>
    </div>
  )
}
