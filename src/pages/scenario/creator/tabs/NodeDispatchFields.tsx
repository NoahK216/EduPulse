import type { GenericNode } from "../../nodes";
import { useEditorDispatch } from "../editor-store/EditorDispatchContext";

function setPath(root: Record<string, any>, path: string, value: unknown) {
  const parts = path.split(".").filter(Boolean);
  let cur: any = root;

  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]!;
    cur[k] = cur[k] ?? {};
    cur = cur[k];
  }

  cur[parts[parts.length - 1]!] = value;
  return root;
}

function getPath(obj: any, path: string) {
  return path.split(".").filter(Boolean).reduce((acc, k) => acc?.[k], obj);
}

type TextInputDispatchProps<N extends GenericNode> = {
  node: N;
  path: string; // "title" or "scoring.rubric.prompt"
  className?: string;
  placeholder?: string;
};

export function TextInputDispatch<N extends GenericNode>({
  node,
  path,
  className,
  placeholder,
}: TextInputDispatchProps<N>) {
  const value = (getPath(node, path) ?? "") as string;
  const dispatch = useEditorDispatch();

  return (
    <input
      type="text"
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        const patch: any = { type: node.type };
        setPath(patch, path, e.target.value);

        dispatch({
          type: "updateNode",
          id: node.id,
          patch,
        });
      }}
    />
  );
}
