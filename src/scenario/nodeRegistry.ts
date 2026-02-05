import { z } from "zod";

type AnyZod = z.ZodTypeAny;

type NodeDef<
  Type extends string,
  Schema extends AnyZod,
  Scene,
  Card,
  Tab,
> = {
  type: Type;
  schema: Schema;
  scene: Scene;
  card: Card;
  tab: Tab;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

export function defineNodeRegistry<
  // ! Add another 'any' when adding a new view
  const R extends { [K in keyof R & string]: NodeDef<K, AnyZod, any, any, any> } 
>(r: R) {
  return r;
}

export function pluck<
  const R extends Record<string, Record<string, any>>,
  const K extends keyof R[keyof R]
>(r: R, key: K): { [P in keyof R]: R[P][K] } {
  const out: any = {};
  for (const k in r) out[k] = r[k][key];
  return out;
}

export function tuple<const T extends readonly AnyZod[]>(...t: T) {
  return t;
}
