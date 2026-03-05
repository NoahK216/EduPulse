import { createContext, useContext, type ReactNode } from "react";
import type { EditorDispatch } from "./EditorStore";

const EditorDispatchContext = createContext<EditorDispatch | null>(null);

export function EditorDispatchProvider({
  dispatch,
  children,
}: {
  dispatch: EditorDispatch;
  children: ReactNode;
}) {
  return (
    <EditorDispatchContext.Provider value={dispatch}>
      {children}
    </EditorDispatchContext.Provider>
  );
}

export function useEditorDispatch() {
  const dispatch = useContext(EditorDispatchContext);
  if (!dispatch) {
    throw new Error(
      "useEditorDispatch must be used within an EditorDispatchProvider",
    );
  }
  return dispatch;
}
