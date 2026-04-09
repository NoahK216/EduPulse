import z from 'zod';

import {ChoiceCard} from './creator/cards/Choice.Card';
import {FreeResponseCard} from './creator/cards/FreeResponse.Card';
import {StartCard} from './creator/cards/Start.Card';
import {VideoCard} from './creator/cards/Video.Card';
import {ChoiceTab} from './creator/tabs/Choice.Tab';
import {FreeResponseTab} from './creator/tabs/FreeResponse.Tab';
import {StartTab} from './creator/tabs/Start.Tab';
import {VideoTab} from './creator/tabs/Video.Tab';
import {defineNodeRegistry, pluck} from './nodeRegistry';
import {
  ChoiceNodeSchema,
  FreeResponseNodeSchema,
  type GenericNode,
  type NodeType,
  StartNodeSchema,
  TextNodeSchema,
  VideoNodeSchema,
} from './nodeSchemas';
import {ChoiceScene} from './viewer/scenes/Choice.Scene';
import {FreeResponseScene} from './viewer/scenes/FreeResponse.Scene';
import {StartScene} from './viewer/scenes/Start.Scene';
import {VideoScene} from './viewer/scenes/Video.Scene';
import {TextTab} from './creator/tabs/Text.Tab';
import { TextCard } from './creator/cards/Text.Card';
import { TextScene } from './viewer/scenes/Text.Scene';

// TODO Create nodes server side
export const nodeRegistry = defineNodeRegistry({
  start: {
    type: 'start',
    schema: StartNodeSchema,
    scene: StartScene,
    card: StartCard,
    tab: StartTab,
    factory: (): z.infer<typeof StartNodeSchema> => ({
      id: crypto.randomUUID(),
      type: 'start',
    }),
  },
  text: {
    type: 'text',
    schema: TextNodeSchema,
    scene: TextScene,
    card: TextCard,
    tab: TextTab,
    factory: (partial): z.infer<typeof TextNodeSchema> => ({
      id: crypto.randomUUID(),
      type: 'text',
      text: "",
      ...partial,
    }),
  },
  video: {
    type: 'video',
    schema: VideoNodeSchema,
    scene: VideoScene,
    card: VideoCard,
    tab: VideoTab,
    factory: (partial): z.infer<typeof VideoNodeSchema> => ({
      id: crypto.randomUUID(),
      type: 'video',
      src: undefined,
      autoplay: false,
      ...partial,
    }),
  },
  choice: {
    type: 'choice',
    schema: ChoiceNodeSchema,
    scene: ChoiceScene,
    card: ChoiceCard,
    tab: ChoiceTab,
    factory: (partial): z.infer<typeof ChoiceNodeSchema> => ({
      id: crypto.randomUUID(),
      type: 'choice',
      prompt: 'Multiple Choice',
      choices: [{id: crypto.randomUUID(), label: 'choice 1'}],
      ...partial,
    }),
  },
  free_response: {
    type: 'free_response',
    schema: FreeResponseNodeSchema,
    scene: FreeResponseScene,
    card: FreeResponseCard,
    tab: FreeResponseTab,
    factory: (partial): z.infer<typeof FreeResponseNodeSchema> => ({
      id: crypto.randomUUID(),
      type: 'free_response',
      prompt: 'Free Response',
      placeholder: '',
      rubric: {
        id: crypto.randomUUID(),
        context: '',
        answerBuckets: [{id: crypto.randomUUID(), classifier: 'classifier 1'}]
      },
      ...partial,
    }),
  },
} as const);
export const NODE_TYPE_LABELS: Record<GenericNode["type"], string> = {
    start: "Start",
    text: "Text",
    video: "Video",
    choice: "Multiple Choice",
    free_response: "Free Response",
};

// Projections
export const scenes = pluck(nodeRegistry, 'scene');
export const cards = pluck(nodeRegistry, 'card');
export const tabs = pluck(nodeRegistry, 'tab');
export type NodeOf<T extends NodeType> = Extract<GenericNode, {type: T}>;
