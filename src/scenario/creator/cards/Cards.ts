import {type Node} from '@xyflow/react';
import type {GenericNode} from '../../nodes';

export type ReactFlowCard<N extends GenericNode = GenericNode> =
    Node<{node: N;}>;
