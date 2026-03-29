import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Bold, Italic, Strikethrough, Heading1, Heading2, Highlighter } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  locale?: string
  disabled?: boolean
}

// ─── RichTextEditor ───────────────────────────────────────────────────────────

export function RichTextEditor({ value, onChange, placeholder, locale, disabled }: RichTextEditorProps) {
  const isHe = locale === 'he'

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const ToolbarBtn = ({
    active, onClick, title, children,
  }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className="flex items-center justify-center rounded-md transition-all"
      style={{
        width: 26, height: 26,
        background: active ? 'rgba(99,102,241,0.22)' : 'transparent',
        color: active ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )

  return (
    <>
      <style>{`
        .ds-rich-editor .ProseMirror {
          outline: none;
          min-height: 110px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.65);
          caret-color: rgba(99,102,241,0.9);
          direction: ${isHe ? 'rtl' : 'ltr'};
        }
        .ds-rich-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          float: ${isHe ? 'right' : 'left'};
          height: 0;
        }
        .ds-rich-editor .ProseMirror h1 { font-size: 17px; font-weight: 700; color: rgba(255,255,255,0.85); margin: 8px 0 4px; }
        .ds-rich-editor .ProseMirror h2 { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.75); margin: 6px 0 3px; }
        .ds-rich-editor .ProseMirror strong { color: rgba(255,255,255,0.85); }
        .ds-rich-editor .ProseMirror em { color: rgba(196,181,253,0.8); }
        .ds-rich-editor .ProseMirror s { opacity: 0.45; }
        .ds-rich-editor .ProseMirror mark { background: rgba(99,102,241,0.25); color: rgba(255,255,255,0.8); border-radius: 3px; padding: 0 2px; }
        .ds-rich-editor .ProseMirror ul, .ds-rich-editor .ProseMirror ol { padding-inline-start: 20px; }
        .ds-rich-editor .ProseMirror li + li { margin-top: 2px; }
      `}</style>

      <div
        className="ds-rich-editor rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Toolbar */}
        {!disabled && (
          <div
            className="flex items-center gap-0.5 px-2 py-1.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ToolbarBtn
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title={isHe ? 'מודגש' : 'Bold'}
            >
              <Bold size={12} />
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title={isHe ? 'נטוי' : 'Italic'}
            >
              <Italic size={12} />
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title={isHe ? 'קו חוצה' : 'Strikethrough'}
            >
              <Strikethrough size={12} />
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('highlight')}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title={isHe ? 'הדגשה' : 'Highlight'}
            >
              <Highlighter size={12} />
            </ToolbarBtn>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
            <ToolbarBtn
              active={editor.isActive('heading', { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="H1"
            >
              <Heading1 size={12} />
            </ToolbarBtn>
            <ToolbarBtn
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="H2"
            >
              <Heading2 size={12} />
            </ToolbarBtn>
          </div>
        )}

        <EditorContent
          editor={editor}
          data-placeholder={placeholder ?? (isHe ? 'תאר את הפרויקט...' : 'Describe the project...')}
        />
      </div>
    </>
  )
}
