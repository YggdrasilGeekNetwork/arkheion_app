import type { Editor } from '@tiptap/react'

type ToolbarProps = {
  editor: Editor | null
}

type ToolbarButton = {
  label: string
  action: () => void
  isActive?: boolean
}

function ToolbarBtn({ label, action, isActive }: ToolbarButton) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); action() }}
      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors
        ${isActive
          ? 'bg-accent/20 text-accent'
          : 'text-muted hover:text-fg hover:bg-surface'
        }`}
    >
      {label}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-stroke/50 mx-0.5" />
}

export default function NoteEditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-1 py-1 border-b border-stroke bg-surface/30">
      <ToolbarBtn
        label="B"
        action={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      />
      <ToolbarBtn
        label="I"
        action={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      />
      <ToolbarBtn
        label="S"
        action={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      />

      <Divider />

      <ToolbarBtn
        label="H1"
        action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
      />
      <ToolbarBtn
        label="H2"
        action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      />
      <ToolbarBtn
        label="H3"
        action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
      />

      <Divider />

      <ToolbarBtn
        label="•"
        action={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      />
      <ToolbarBtn
        label="1."
        action={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      />
      <ToolbarBtn
        label="❝"
        action={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      />

      <Divider />

      <ToolbarBtn
        label="—"
        action={() => editor.chain().focus().setHorizontalRule().run()}
      />
      <ToolbarBtn
        label="Link"
        action={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run()
            return
          }
          const url = window.prompt('URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        isActive={editor.isActive('link')}
      />
      <ToolbarBtn
        label="Img"
        action={() => {
          const url = window.prompt('URL da imagem:')
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }}
      />

      <Divider />

      <ToolbarBtn
        label="↩"
        action={() => editor.chain().focus().undo().run()}
      />
      <ToolbarBtn
        label="↪"
        action={() => editor.chain().focus().redo().run()}
      />
    </div>
  )
}
