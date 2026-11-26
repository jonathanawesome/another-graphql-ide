// The editing surface, fully prop-driven and usable on its own.
export { Editor } from './bricks/editor/editor'
export type { EditorProps } from './bricks/editor/editor'
// What DocumentPane adds to Editor, for hosts building their own operation editor.
export { useOperationExtensions } from './bricks/editor/hooks/use-operation-extensions'
export type { UseOperationExtensionsParams } from './bricks/editor/hooks/use-operation-extensions'

// A read-only schema viewer, prop-driven like Editor.
export { SdlViewer } from './bricks/sdl-viewer/sdl-viewer'
export type { SdlViewerProps } from './bricks/sdl-viewer/sdl-viewer'
export type { SdlAnnotation, SdlTag } from './bricks/sdl-shared/line-state'
export type { SdlMessage } from './bricks/sdl-shared/message-rows'
export type { Coordinate as SdlCoordinate } from './bricks/sdl-shared/sdl-index'

// What changed between two SDL documents, prop-driven like Editor.
export { SdlDiff } from './bricks/sdl-diff/sdl-diff'
export type { SdlDiffProps, SdlDiffResult } from './bricks/sdl-diff/sdl-diff'
export type { SdlRow, SdlSide } from './bricks/sdl-shared/sdl-rows'

// Editable SDL and JSON with problems under their lines, reported to the host.
export { SdlEditor } from './bricks/sdl-editor/sdl-editor'
export type { SdlEditorProps } from './bricks/sdl-editor/sdl-editor'
export { JsonEditor } from './bricks/json-editor/json-editor'
export type { JsonEditorProps } from './bricks/json-editor/json-editor'
export type { JsonSchema } from './bricks/json-editor/diagnose-json'
export type { EditorDiagnostic } from './bricks/sdl-shared/diagnostics'

// Bricks. Each reads its configuration from the surrounding AGIProvider.
export { ConnectionBar } from './bricks/connection-bar/connection-bar'
export { EditorGroup } from './bricks/editor-group/editor-group'
export { SchemaTree } from './bricks/schema-tree/schema-tree'
export type { SchemaTreeProps } from './bricks/schema-tree/schema-tree'
export { VariablesEditor } from './bricks/variables-editor/variables-editor'
export type { VariablesEditorProps } from './bricks/variables-editor/variables-editor'

// Panes, for assembling a layout the bricks above do not cover.
export { DocumentPane } from './panes/document-pane/document-pane'
export { ResponsePane } from './panes/response-pane/response-pane'

// The primitives the recipes are built from, so a consumer can build their own.
// The rest of primitives stays deep-path: those serve this IDE's chrome, and
// exporting them would commit to APIs shaped for it.
export { Button } from './primitives/button/button'
export type { ButtonProps } from './primitives/button/button'
export { Icon } from './primitives/icon/icon'
export type { IconNames } from './primitives/icon/icon'
export { Popover } from './primitives/popover/popover'
export type { PopoverProps } from './primitives/popover/popover'
export { Resizer } from './primitives/resizer/resizer'
export { RunControl } from './primitives/run-control/run-control'
export type {
  RunControlProps,
  RunStatus,
} from './primitives/run-control/run-control'
