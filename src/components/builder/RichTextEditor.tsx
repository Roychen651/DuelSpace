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
      className={`flex items-center justify-center rounded-md transition-all hover:bg-slate-100 dark:hover:bg-white/10 ${
        active
          ? 'text-indigo-500 dark:text-indigo-400'
          : 'text-slate-500 dark:text-white/40'
      }`}
      style={{
        width: 26,
        height: 26,
        background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )

  return (
    <>
      <style>{`
        /* ── Light mode ── */
        .ds-rich-editor .ProseMirror {
          outline: none;
          min-height: 110px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.7;
          color: #1e293b;
          caret-color: #6366f1;
          direction: ${isHe ? 'rtl' : 'ltr'};
        }
        .ds-rich-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          float: ${isHe ? 'right' : 'left'};
          height: 0;
        }
        .ds-rich-editor .ProseMirror h1 { font-size: 17px; font-weight: 700; color: #0f172a; margin: 8px 0 4px; }
        .ds-rich-editor .ProseMirror h2 { font-size: 14px; font-weight: 600; color: #1e293b; margin: 6px 0 3px; }
        .ds-rich-editor .ProseMirror strong { color: #0f172a; }
        .ds-rich-editor .ProseMirror em { color: #6366f1; }
        .ds-rich-editor .ProseMirror s { opacity: 0.45; }
        .ds-rich-editor .ProseMirror mark { background: rgba(99,102,241,0.12); color: #1e293b; border-radius: 3px; padding: 0 2px; }
        .ds-rich-editor .ProseMirror ul, .ds-rich-editor .ProseMirror ol { padding-inline-start: 20px; }
        .ds-rich-editor .ProseMirror li + li { margin-top: 2px; }

        /* ── Dark mode ── */
        .dark .ds-rich-editor .ProseMirror { color: rgba(255,255,255,0.65); caret-color: rgba(99,102,241,0.9); }
        .dark .ds-rich-editor .ProseMirror p.is-editor-empty:first-child::before { color: rgba(255,255,255,0.2); }
        .dark .ds-rich-editor .ProseMirror h1 { color: rgba(255,255,255,0.85); }
        .dark .ds-rich-editor .ProseMirror h2 { color: rgba(255,255,255,0.75); }
        .dark .ds-rich-editor .ProseMirror strong { color: rgba(255,255,255,0.85); }
        .dark .ds-rich-editor .ProseMirror em { color: rgba(196,181,253,0.8); }
        .dark .ds-rich-editor .ProseMirror mark { background: rgba(99,102,241,0.25); color: rgba(255,255,255,0.8); }
      `}</style>

      <div className="ds-rich-editor rounded-2xl overflow-hidden bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
        {/* Toolbar */}
        {!disabled && (
          <div className="flex items-center gap-0.5 px-2 py-1.5 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/6">
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
            <div className="w-px h-4 bg-slate-200 dark:bg-white/8 mx-1" />
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
