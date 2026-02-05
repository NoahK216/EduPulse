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

export const nodeRegistry = defineNodeRegistry({
  video: {
    type: 'video',
    schema: VideoNodeSchema,
    scene: VideoScene,
    card: VideoCard,
    tab: VideoTab,
  },
  choice: {
    type: 'choice',
    schema: ChoiceNodeSchema,
    scene: ChoiceScene,
    card: ChoiceCard,
    tab: ChoiceTab,
  },
  free_response: {
    type: 'free_response',
    schema: FreeResponseNodeSchema,
    scene: FreeResponseScene,
    card: FreeResponseCard,
    tab: FreeResponseTab,
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

export type NodeType = keyof typeof nodeRegistry;
