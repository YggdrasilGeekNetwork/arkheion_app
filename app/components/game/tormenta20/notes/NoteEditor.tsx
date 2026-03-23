import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { Editor } from '@tiptap/react'
import type { CharacterNote, CharacterNoteTag } from '~/types/character'
import { NOTE_COLORS, PREDEFINED_TAGS, getNoteColor } from './noteConstants'

type NoteEditorProps = {
  note: CharacterNote
  customTags: CharacterNoteTag[]
  activeSessionId: string | null
  activeSessionName: string | null
  onSave: (updated: CharacterNote) => void
  onDelete: () => void
  onBack: () => void
}

// ── Toolbar ────────────────────────────────────────────────────────────────

function ToolbarBtn({
  label, action, isActive,
}: { label: string; action: () => void; isActive?: boolean }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); action() }}
      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
        isActive ? 'bg-black/20 text-black/80' : 'text-black/40 hover:text-black/70 hover:bg-black/10'
      }`}
    >
      {label}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-3 bg-black/15 mx-0.5 self-center" />
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="flex items-center gap-0.5 flex-wrap px-1.5 py-1 border-b border-black/10">
      <ToolbarBtn label="B" action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} />
      <ToolbarBtn label="I" action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} />
      <ToolbarBtn label="S" action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} />
      <Divider />
      <ToolbarBtn label="H1" action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} />
      <ToolbarBtn label="H2" action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} />
      <Divider />
      <ToolbarBtn label="•" action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} />
      <ToolbarBtn label="1." action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} />
      <ToolbarBtn label="❝" action={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} />
      <Divider />
      <ToolbarBtn label="↩" action={() => editor.chain().focus().undo().run()} />
      <ToolbarBtn label="↪" action={() => editor.chain().focus().redo().run()} />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function NoteEditor({
  note,
  customTags,
  activeSessionId,
  activeSessionName,
  onSave,
  onDelete,
  onBack,
}: NoteEditorProps) {
  const titleRef = useRef(note.title)
  const tagsRef = useRef(note.tags)
  const colorRef = useRef(note.color)
  const sessionIdRef = useRef(note.sessionId)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allTags = [...PREDEFINED_TAGS, ...customTags]
  const colorStyle = getNoteColor(note.color)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Escreva sua nota...' }),
    ],
    content: note.content || '',
    onUpdate: ({ editor: ed }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSave(buildUpdated(ed.getHTML()))
      }, 600)
    },
  })

  // Sync when switching notes without unmounting
  useEffect(() => {
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || '')
    }
    titleRef.current = note.title
    tagsRef.current = note.tags
    colorRef.current = note.color
    sessionIdRef.current = note.sessionId
  }, [note.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  function buildUpdated(html: string): CharacterNote {
    return {
      ...note,
      title: titleRef.current.trim(),
      content: html,
      tags: tagsRef.current,
      color: colorRef.current,
      sessionId: sessionIdRef.current,
      updatedAt: new Date().toISOString(),
    }
  }

  function saveNow(overrides?: Partial<CharacterNote>) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onSave({
      ...buildUpdated(editor?.getHTML() ?? note.content),
      ...overrides,
    })
  }

  function toggleTag(tagId: string) {
    const next = tagsRef.current.includes(tagId)
      ? tagsRef.current.filter(t => t !== tagId)
      : [...tagsRef.current, tagId]
    tagsRef.current = next
    saveNow({ tags: next })
  }

  function setColor(id: string) {
    colorRef.current = id
    saveNow({ color: id })
  }

  function toggleSession() {
    const next = sessionIdRef.current === activeSessionId ? null : activeSessionId
    sessionIdRef.current = next
    saveNow({ sessionId: next })
  }

  return (
    <div className={`flex flex-col h-full rounded-lg border ${colorStyle.bg} ${colorStyle.border}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-black/10">
        <button
          onClick={() => { saveNow(); onBack() }}
          className="text-[11px] text-black/50 hover:text-black/80 transition-colors"
        >
          ← Voltar
        </button>
        <input
          defaultValue={note.title}
          onChange={e => { titleRef.current = e.target.value }}
          onBlur={() => saveNow()}
          placeholder="Título (opcional)"
          className={`flex-1 bg-transparent text-sm font-semibold placeholder:text-black/30 focus:outline-none ${colorStyle.text}`}
        />
        <button
          onClick={() => { saveNow(); onBack() }}
          className="text-[11px] px-2 py-0.5 rounded bg-black/10 hover:bg-black/20 transition-colors text-black/70"
        >
          Salvar
        </button>
      </div>

      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <EditorContent
          editor={editor}
          className={`tiptap-note-editor ${colorStyle.text}
            [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[80px]
            [&_.ProseMirror_h1]:text-[14px] [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-2
            [&_.ProseMirror_h2]:text-[12px] [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-1.5
            [&_.ProseMirror_p]:text-[12px] [&_.ProseMirror_p]:mb-1.5 [&_.ProseMirror_p]:leading-relaxed
            [&_.ProseMirror_ul]:text-[12px] [&_.ProseMirror_ul]:pl-4 [&_.ProseMirror_ul]:mb-1.5
            [&_.ProseMirror_ol]:text-[12px] [&_.ProseMirror_ol]:pl-4 [&_.ProseMirror_ol]:mb-1.5
            [&_.ProseMirror_li]:mb-0.5
            [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-black/20
            [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:opacity-70
            [&_.ProseMirror_strong]:font-bold
            [&_.ProseMirror_em]:italic
            [&_.ProseMirror_s]:line-through
            [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_.is-editor-empty:first-child::before]:text-black/30
            [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0
            [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_.is-editor-empty:first-child::before]:text-[12px]
          `}
        />
      </div>

      {/* Footer controls */}
      <div className="border-t border-black/10 p-2 space-y-2">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 items-center">
          {allTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${
                tagsRef.current.includes(tag.id)
                  ? 'bg-black/20 shadow-inner'
                  : 'bg-black/8 hover:bg-black/15'
              }`}
              style={{ color: tag.color }}
            >
              {tagsRef.current.includes(tag.id) ? '✓ ' : ''}{tag.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          {/* Color picker */}
          <div className="flex gap-1">
            {NOTE_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`w-4 h-4 rounded-full border-2 transition-transform ${c.bg} ${
                  colorRef.current === c.id ? 'border-black/40 scale-110' : 'border-transparent hover:scale-105'
                }`}
                title={c.id}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Session link */}
            {activeSessionId && (
              <button
                onClick={toggleSession}
                className={`text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                  sessionIdRef.current === activeSessionId
                    ? 'bg-black/20 text-black/70'
                    : 'bg-black/8 hover:bg-black/15 text-black/50'
                }`}
              >
                📅 {sessionIdRef.current === activeSessionId ? `Sessão: ${activeSessionName ?? '—'}` : 'Vincular sessão'}
              </button>
            )}

            {/* Delete */}
            <button
              onClick={onDelete}
              className="text-[9px] text-red-600/60 hover:text-red-600 transition-colors"
            >
              Excluir nota
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
