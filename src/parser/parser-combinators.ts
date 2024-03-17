import { Concat } from './helpers';
import { ApplyParser, Assume, Parser, ParserFailResult, ParserSuccessResult } from './parser';
import { FlatParserJoin, FlatParserSuccessJoin } from './parser-result-combinators';

/**
 * All parsers need to success (due to FlatParserSucessJoin).
 * If FlatParserJoin would be used instead, then parsing will stop on first fail, however what was parsed will be returned
 */
export interface ChainParsers<P extends Parser[]> extends Parser {
  apply: (input: Assume<this['input'], string[]>) =>
  P extends [
    infer P1 extends Parser,
    ...infer Rest extends Parser[]
  ] ? ApplyParser<typeof input, P1> extends infer R extends ParserSuccessResult<string[]>
      ? FlatParserSuccessJoin<R, ApplyParser<R[1], ChainParsers<Rest>>>
      : ParserFailResult<typeof input>
    : ParserSuccessResult<[], typeof input>;
}

/**
 * At least one of parsers needs to success. The first to succeed is chosen.
 */
export interface OneOfParsers<P extends Parser[]> extends Parser {
  apply: (input: Assume<this['input'], string[]>) =>
  P extends [
    infer P1 extends Parser,
    ...infer Rest extends Parser[]
  ] ? ApplyParser<typeof input, P1> extends infer R extends ParserSuccessResult<string[]>
      ? R
      : ApplyParser<typeof input, OneOfParsers<Rest>>
    : ParserFailResult<typeof input>;
} 

/**
 * Concatenates parser result
 */
export interface MapConcatParser<P extends Parser> extends Parser {
  apply: (input: Assume<this['input'], string[]>) =>
    ApplyParser<typeof input, P> extends infer R extends ParserSuccessResult<string[]>
    ? ParserSuccessResult<[Concat<R[0]>], R[1]>
    : ParserFailResult<typeof input>
} 

/**
 * Applies parser over and over until fails, then returns joined result.
 * It needs to succeed at least once
 */
export interface ManyParser<P extends Parser> extends Parser {
  apply: (input: Assume<this['input'], string[]>) =>
  ApplyParser<typeof input, P> extends infer R extends ParserSuccessResult<string[]>
    ? FlatParserJoin<R, ApplyParser<R[1], ManyParser<P>>>
    : ParserFailResult<typeof input>
}

/**
 * Applies parser over and over until fails, then returns joined result.
 * It needs to succeed at least once
 */
export interface DropParser<P extends Parser> extends Parser {
  apply: (input: Assume<this['input'], string[]>) =>
  ApplyParser<typeof input, P> extends infer R extends ParserSuccessResult<string[]>
    ? ParserSuccessResult<[], R[1]>
    : ParserFailResult<typeof input>
}