export type BaseNode = {
  id: string;
  type: string;
  title?: string;
};

export type VideoNode = BaseNode & {
  type: "video";
  src: string;
  captionsSrc?: string;
};

export type FreeResponseNode = BaseNode & {
  type: "free_response";
  prompt: string;
  placeholder?: string;
  rubricId?: string; 
};

export type ChoiceNode = BaseNode & {
  type: "choice";
  prompt: string;
  choices: Array<{ id: string; label: string }>;
};

export type ScenarioNode = VideoNode | FreeResponseNode | ChoiceNode;
export type NodeType = ScenarioNode["type"];
