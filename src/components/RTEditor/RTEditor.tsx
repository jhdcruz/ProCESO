import { memo } from 'react';
import { Button } from '@mantine/core';
import { Link, RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import '@mantine/tiptap/styles.layer.css';

/**
 * Display an editable rich text editor.
 *
 * @param editable - Allow edits. (`false` by default)
 * @param loading - Show a loading spinner.
 * @param onSubmit - Callback to run when the user submits the content.
 * @param content - HTML content to render.
 */
function RichText({
  editable,
  loading,
  onSubmit,
  content,
}: {
  editable: boolean;
  loading: boolean;
  onSubmit: (content: string) => void;
  content?: string | null;
}) {
  const bodyContent =
    content ??
    '<p>This event has no description yet. Come back again later.</p>';

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        Link,
        Superscript,
        SubScript,
        Highlight,
        TextStyle,
        Color,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
      content: bodyContent,
      editable: editable ?? false,
      immediatelyRender: false,
    },
    [content, editable],
  );

  return (
    <RichTextEditor editor={editor}>
      {editor && editable && (
        <RichTextEditor.Toolbar sticky stickyOffset={60}>
          {/* Saving/discarding controls */}
          <Button.Group>
            <Button
              disabled={loading}
              onClick={() => editor?.chain().setContent(bodyContent).run()}
              size="compact-sm"
              variant="default"
            >
              Reset
            </Button>
            <Button
              loaderProps={{ type: 'dots' }}
              loading={loading}
              onClick={() => onSubmit(editor.getHTML())}
              size="compact-sm"
            >
              Save Changes
            </Button>
          </Button.Group>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.ColorPicker
              colors={[
                '#25262b',
                '#868e96',
                '#fa5252',
                '#e64980',
                '#be4bdb',
                '#7950f2',
                '#4c6ef5',
                '#228be6',
                '#15aabf',
                '#12b886',
                '#40c057',
                '#82c91e',
                '#fab005',
                '#fd7e14',
              ]}
            />
            <RichTextEditor.UnsetColor />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
      )}

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}

export const RTEditor = memo(RichText);
