import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import type { Note } from '~/types/notes'
import { useMesa } from '~/contexts/MesaContext'
import NoteEditorToolbar from './NoteEditorToolbar'
import NoteLinkBadges from './NoteLinkBadges'

type NoteEditorProps = {
  note: Note
  onOpenLinkModal: () => void
}

export default function NoteEditor({ note, onOpenLinkModal }: NoteEditorProps) {
  const { dispatch } = useMesa()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Comece a escrever...' }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        dispatch({
          type: 'UPDATE_NOTE',
          payload: { noteId: note.id, updates: { content: editor.getHTML() } },
        })
      }, 500)
    },
  })

  // Sync content when switching notes
  useEffect(() => {
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content)
    }
  }, [note.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_NOTE',
      payload: { noteId: note.id, updates: { title: e.target.value } },
    })
  }, [dispatch, note.id])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Title */}
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <input
          ref={titleRef}
          value={note.title}
          onChange={handleTitleChange}
          className="w-full bg-transparent text-sm font-semibold text-fg
            border-none outline-none placeholder:text-muted/50"
          placeholder="Título da nota"
        />
      </div>

      {/* Link badges */}
      <div className="px-3 pb-1 flex-shrink-0">
        <NoteLinkBadges
          links={note.links}
          noteId={note.id}
          onAddLink={onOpenLinkModal}
        />
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0">
        <NoteEditorToolbar editor={editor} />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <EditorContent
          editor={editor}
          className="tiptap-editor prose prose-invert prose-sm max-w-none
            [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]
            [&_.ProseMirror_h1]:text-base [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-2
            [&_.ProseMirror_h2]:text-sm [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mb-1.5
            [&_.ProseMirror_h3]:text-xs [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-1
            [&_.ProseMirror_p]:text-xs [&_.ProseMirror_p]:text-fg/80 [&_.ProseMirror_p]:mb-1.5 [&_.ProseMirror_p]:leading-relaxed
            [&_.ProseMirror_ul]:text-xs [&_.ProseMirror_ul]:pl-4 [&_.ProseMirror_ul]:mb-1.5
            [&_.ProseMirror_ol]:text-xs [&_.ProseMirror_ol]:pl-4 [&_.ProseMirror_ol]:mb-1.5
            [&_.ProseMirror_li]:mb-0.5
            [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-accent/40
            [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted
            [&_.ProseMirror_a]:text-accent [&_.ProseMirror_a]:underline
            [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded
            [&_.ProseMirror_hr]:border-stroke/50 [&_.ProseMirror_hr]:my-2
            [&_.ProseMirror_.is-editor-empty:first-child::before]:text-muted/40
            [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0
            [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none
          "
        />
      </div>
    </div>
  )
}
