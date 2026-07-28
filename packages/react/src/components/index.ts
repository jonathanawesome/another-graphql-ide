// The editing surface, fully prop-driven and usable on its own.
export { Editor } from './exported-components/editor/editor'
export type { EditorProps } from './exported-components/editor/editor'

// Bricks. Each reads its configuration from the surrounding AGIProvider.
export { ConnectionBar } from './exported-components/connection-bar/connection-bar'
export { EditorGroup } from './exported-components/editor-group/editor-group'
export { SchemaTree } from './exported-components/schema-tree/schema-tree'
export { VariablesEditor } from './exported-components/variables-editor/variables-editor'
export type { VariablesEditorProps } from './exported-components/variables-editor/variables-editor'

// Panes, for assembling a layout the bricks above do not cover.
export { DocumentPane } from './panes/document-pane/document-pane'
export { ResponsePane } from './panes/response-pane/response-pane'

// The primitives the recipes are built from, so a consumer can build their own.
// The rest of ui-components stays deep-path: those serve this IDE's chrome, and
// exporting them would commit to APIs shaped for it.
export { Button } from './ui-components/button/button'
export type { ButtonProps } from './ui-components/button/button'
export { Icon } from './ui-components/icon/icon'
export type { IconNames } from './ui-components/icon/icon'
export { Popover } from './ui-components/popover/popover'
export type { PopoverProps } from './ui-components/popover/popover'
export { Resizer } from './ui-components/resizer/resizer'
export { RunControl } from './ui-components/run-control/run-control'
export type { RunControlProps } from './ui-components/run-control/run-control'
