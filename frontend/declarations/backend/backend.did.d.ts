import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Note {
  'id' : bigint,
  'subject' : string,
  'bulletPoints' : Array<string>,
}
export type Result = { 'ok' : boolean } |
  { 'err' : string };
export type Result_1 = { 'ok' : Note } |
  { 'err' : string };
export type Result_2 = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE {
  'createNote' : ActorMethod<[string, Array<string>], Result_2>,
  'deleteNote' : ActorMethod<[bigint], Result>,
  'getNote' : ActorMethod<[bigint], Result_1>,
  'getNotes' : ActorMethod<[], Array<Note>>,
  'updateNote' : ActorMethod<[bigint, string, Array<string>], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
