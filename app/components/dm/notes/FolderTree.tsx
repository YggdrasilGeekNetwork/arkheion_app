import { useState } from 'react'
import type { Note, NoteFolder } from '~/types/notes'
import { useMesa } from '~/contexts/MesaContext'
import NoteListItem from './NoteListItem'

type FolderTreeProps = {
  folders: NoteFolder[]
  notes: Note[]
  activeNoteId: string | null
  selectedFolderId: string | null
  onSelectNote: (noteId: string) => void
  onSelectFolder: (folderId: string | null) => void
}

function FolderNode({
  folder,
  allFolders,
  notes,
  activeNoteId,
  selectedFolderId,
  onSelectNote,
  onSelectFolder,
  collapsedFolders,
  toggleFolder,
  renamingId,
  renameValue,
  setRenameValue,
  startRename,
  commitRename,
  setRenamingId,
  depth,
}: {
  folder: NoteFolder
  allFolders: NoteFolder[]
  notes: Note[]
  activeNoteId: string | null
  selectedFolderId: string | null
  onSelectNote: (noteId: string) => void
  onSelectFolder: (folderId: string | null) => void
  collapsedFolders: Set<string>
  toggleFolder: (id: string) => void
  renamingId: string | null
  renameValue: string
  setRenameValue: (v: string) => void
  startRename: (f: NoteFolder) => void
  commitRename: (id: string) => void
  setRenamingId: (id: string | null) => void
  depth: number
}) {
  const { dispatch } = useMesa()
  const isCollapsed = collapsedFolders.has(folder.id)
  const isSelected = selectedFolderId === folder.id
  const childFolders = allFolders.filter(f => f.parentId === folder.id)
  const folderNotes = notes
    .filter(n => n.folderId === folder.id && !n.pinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  // Count all notes recursively for the badge
  function countNotesRecursive(fId: string): number {
    const direct = notes.filter(n => n.folderId === fId && !n.pinned).length
    const children = allFolders.filter(f => f.parentId === fId)
    return direct + children.reduce((sum, cf) => sum + countNotesRecursive(cf.id), 0)
  }
  const totalCount = countNotesRecursive(folder.id)

  return (
    <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
      <div
        className={`flex items-center gap-1 px-1 group rounded transition-colors
          ${isSelected ? 'bg-accent/10' : ''}`}
      >
        <button
          onClick={() => {
            onSelectFolder(isSelected ? null : folder.id)
            if (isCollapsed) toggleFolder(folder.id)
          }}
          className="flex items-center gap-1 flex-1 py-0.5 text-left"
        >
          <span
            className="text-[10px] text-muted w-3 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id) }}
          >
            {isCollapsed ? '▸' : '▾'}
          </span>
          <span className="text-[10px]">📁</span>
          {renamingId === folder.id ? (
            <input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={() => commitRename(folder.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename(folder.id)
                if (e.key === 'Escape') setRenamingId(null)
              }}
              autoFocus
              className="flex-1 bg-transparent text-[10px] text-fg border-b border-accent outline-none"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={`text-[10px] font-medium flex-1 truncate
              ${isSelected ? 'text-accent' : 'text-fg'}`}>
              {folder.name}
            </span>
          )}
          <span className="text-[9px] text-muted/50">{totalCount}</span>
        </button>
        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
          <button
            onClick={() => startRename(folder)}
            className="text-[9px] text-muted hover:text-fg px-0.5"
            title="Renomear"
          >
            ✏️
          </button>
          <button
            onClick={() => dispatch({ type: 'DELETE_NOTE_FOLDER', payload: { folderId: folder.id } })}
            className="text-[9px] text-muted hover:text-red-400 px-0.5"
            title="Excluir pasta"
          >
            🗑️
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="space-y-0.5">
          {/* Child folders */}
          {childFolders.map(cf => (
            <FolderNode
              key={cf.id}
              folder={cf}
              allFolders={allFolders}
              notes={notes}
              activeNoteId={activeNoteId}
              selectedFolderId={selectedFolderId}
              onSelectNote={onSelectNote}
              onSelectFolder={onSelectFolder}
              collapsedFolders={collapsedFolders}
              toggleFolder={toggleFolder}
              renamingId={renamingId}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              startRename={startRename}
              commitRename={commitRename}
              setRenamingId={setRenamingId}
              depth={depth + 1}
            />
          ))}
          {/* Notes in this folder */}
          {folderNotes.length > 0 && (
            <div style={{ marginLeft: 12 }} className="space-y-0.5">
              {folderNotes.map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isActive={activeNoteId === note.id}
                  onSelect={() => onSelectNote(note.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FolderTree({
  folders, notes, activeNoteId, selectedFolderId, onSelectNote, onSelectFolder,
}: FolderTreeProps) {
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  function toggleFolder(folderId: string) {
    setCollapsedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  function startRename(folder: NoteFolder) {
    setRenamingId(folder.id)
    setRenameValue(folder.name)
  }

  const { dispatch } = useMesa()

  function commitRename(folderId: string) {
    if (renameValue.trim()) {
      dispatch({ type: 'RENAME_NOTE_FOLDER', payload: { folderId, name: renameValue.trim() } })
    }
    setRenamingId(null)
  }

  const pinnedNotes = notes.filter(n => n.pinned).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const rootFolders = folders.filter(f => f.parentId === null)
  const rootNotes = notes.filter(n => !n.folderId && !n.pinned).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="space-y-1">
      {/* Pinned */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-0.5">
          <div className="text-[9px] text-muted uppercase tracking-wider px-2 py-0.5">
            📌 Fixadas
          </div>
          {pinnedNotes.map(note => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={activeNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
            />
          ))}
        </div>
      )}

      {/* Recursive folder tree */}
      {rootFolders.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          allFolders={folders}
          notes={notes}
          activeNoteId={activeNoteId}
          selectedFolderId={selectedFolderId}
          onSelectNote={onSelectNote}
          onSelectFolder={onSelectFolder}
          collapsedFolders={collapsedFolders}
          toggleFolder={toggleFolder}
          renamingId={renamingId}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          startRename={startRename}
          commitRename={commitRename}
          setRenamingId={setRenamingId}
          depth={0}
        />
      ))}

      {/* Root notes */}
      {rootNotes.length > 0 && (
        <div className="space-y-0.5">
          {rootFolders.length > 0 && (
            <div className="text-[9px] text-muted uppercase tracking-wider px-2 py-0.5">
              Sem pasta
            </div>
          )}
          {rootNotes.map(note => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={activeNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
