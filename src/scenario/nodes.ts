import z from 'zod';

import {ChoiceCard} from './creator/cards/Choice.Card';
import {FreeResponseCard} from './creator/cards/FreeResponse.Card';
import {VideoCard} from './creator/cards/Video.Card';
import {ChoiceTab} from './creator/tabs/Choice.Tab';
import {FreeResponseTab} from './creator/tabs/FreeResponse.Tab';
import {VideoTab} from './creator/tabs/Video.Tab';
import {defineNodeRegistry, pluck, tuple} from './nodeRegistry';
import {ChoiceNodeSchema, FreeResponseNodeSchema, VideoNodeSchema} from './nodeSchemas';
import {ChoiceScene} from './viewer/scenes/Choice.Scene';
import {FreeResponseScene} from './viewer/scenes/FreeResponse.Scene';
import {VideoScene} from './viewer/scenes/Video.Scene';

// TODO Create nodes server side
export const nodeRegistry = defineNodeRegistry({
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


const nodeSchemas = tuple(
    nodeRegistry.video.schema, 
    nodeRegistry.choice.schema,
    nodeRegistry.free_response.schema
);

export const GenericNodeSchema = z.discriminatedUnion('type', nodeSchemas);
export type GenericNode = z.infer<typeof GenericNodeSchema>;

// Projections
export const scenes = pluck(nodeRegistry, 'scene');
export const cards = pluck(nodeRegistry, 'card');
export const tabs = pluck(nodeRegistry, 'tab');

export type NodeType = GenericNode['type'];
export type NodeOf<T extends NodeType> = Extract<GenericNode, {type: T}>;