import type { Decimal } from 'decimal.js';
import { Complex } from 'complex.js';

import { Expression } from '../../math-json/math-json-format';

import {
  BoxedExpression,
  BoxedFunctionDefinition,
  BoxedRuleSet,
  BoxedSymbolDefinition,
  BoxedDomain,
  EvaluateOptions,
  IComputeEngine,
  LatexString,
  Metadata,
  NOptions,
  PatternMatchOptions,
  SemiBoxedExpression,
  SimplifyOptions,
  Substitution,
  RuntimeScope,
  DomainCompatibility,
  DomainLiteral,
  BoxedBaseDefinition,
  Rational,
  BoxedSubstitution,
} from '../public';
import { getFreeVars, getSubexpressions, getSymbols } from './utils';
import { isBigRational, isMachineRational } from '../numerics/rationals';
import { asFloat } from '../numerics/numeric';

/**
 * AbstractBoxedExpression
 */

export abstract class AbstractBoxedExpression implements BoxedExpression {
  abstract readonly hash: number;
  abstract readonly json: Expression;
  abstract readonly head: BoxedExpression | string;
  abstract get isCanonical(): boolean;
  abstract set isCanonical(_val: boolean);

  abstract isSame(rhs: BoxedExpression): boolean;
  abstract isEqual(rhs: BoxedExpression): boolean;
  abstract match(
    rhs: BoxedExpression,
    options?: PatternMatchOptions
  ): BoxedSubstitution | null;

  readonly engine: IComputeEngine;

  /** Verbatim LaTeX, obtained from a source, i.e. from parsing, not generated
   * synthetically
   */
  protected _latex?: string;

  protected _wikidata: string | undefined;

  constructor(ce: IComputeEngine, metadata?: Metadata) {
    this.engine = ce;
    if (metadata?.latex !== undefined) this._latex = metadata.latex;
    if (metadata?.wikidata !== undefined) this._wikidata = metadata.wikidata;
  }

  /** `Object.valueOf()`: return a primitive value for the object
   *
   */
  valueOf(): number | string | boolean {
    if (this.symbol === 'True') return true;
    if (this.symbol === 'False') return false;
    return (
      asFloat(this) ?? this.string ?? this.symbol ?? JSON.stringify(this.json)
    );
  }

  /** Object.toString() */
  toString(): string {
    if (this.symbol) return this.symbol;
    if (this.string) return this.string;
    const num = this.numericValue;
    if (num !== null) {
      if (typeof num === 'number') return num.toString();
      if (isMachineRational(num))
        return `${num[0].toString()}/${num[1].toString()}`;
      if (isBigRational(num))
        return `${num[0].toString()}/${num[1].toString()}`;
      if (num instanceof Complex) {
        const im = num.im === 1 ? '' : num.im === -1 ? '-' : num.im.toString();
        if (num.re === 0) return im + 'i';
        if (num.im < 0) return `${num.re.toString()}${im}i`;
        return `${num.re.toString()}+${im}i`;
      }
    }

    return JSON.stringify(this.json);
  }

  [Symbol.toPrimitive](
    hint: 'number' | 'string' | 'default'
  ): number | string | null {
    if (hint === 'number') {
      const v = this.valueOf();
      return typeof v === 'number' ? v : null;
    }
    return this.toString();
  }

  /** Called by `JSON.stringify()` when serializing to json */
  toJSON(): Expression {
    return this.json;
  }

  get scope(): RuntimeScope | null {
    return null;
  }

  /** Object.is() */
  is(rhs: any): boolean {
    if (rhs === null || rhs === undefined) return false;
    return this.isSame(this.engine.box(rhs));
  }

  get latex(): LatexString {
    return this._latex ?? this.engine.serialize(this);
  }

  set latex(val: LatexString) {
    this._latex = val;
  }

  get symbol(): string | null {
    return null;
  }

  get isNothing(): boolean {
    return false;
  }

  get string(): string | null {
    return null;
  }

  getSubexpressions(head: string): BoxedExpression[] {
    return getSubexpressions(this, head);
  }

  get subexpressions(): BoxedExpression[] {
    return this.getSubexpressions('');
  }

  get symbols(): string[] {
    const set = new Set<string>();
    getSymbols(this, set);
    return Array.from(set);
  }

  get freeVars(): string[] {
    const set = new Set<string>();
    getFreeVars(this, set);
    return Array.from(set);
  }

  get errors(): BoxedExpression[] {
    return this.getSubexpressions('Error');
  }

  // Only return non-null for functions
  get ops(): null | BoxedExpression[] {
    return null;
  }

  get nops(): number {
    return 0;
  }

  get op1(): BoxedExpression {
    console.log('abstract-boxed-expression.ts > op1');
    return this.engine.symbol('Nothing');
  }

  get op2(): BoxedExpression {
    console.log('abstract-boxed-expression.ts > op2');

    return this.engine.symbol('Nothing');
  }

  get op3(): BoxedExpression {
    console.log('abstract-boxed-expression.ts > op2');
    return this.engine.symbol('Nothing');
  }

  get isValid(): boolean {
    return true;
  }

  get isPure(): boolean {
    return false;
  }

  get isExact(): boolean {
    return true;
  }

  /** For a symbol, true if the symbol is a free variable (no value) */
  get isFree(): boolean {
    return false;
  }

  /** For a symbol, true if the symbol is a constant (unchangeable value) */
  get isConstant(): boolean {
    return false;
  }

  get canonical(): BoxedExpression {
    return this;
  }

  apply(
    _fn: (x: BoxedExpression) => SemiBoxedExpression,
    _head?: string
  ): BoxedExpression {
    return this;
  }

  subs(_sub: Substitution, options?: { canonical: boolean }): BoxedExpression {
    if (options?.canonical) return this.canonical;
    return this;
  }

  solve(_vars: Iterable<string>): null | BoxedExpression[] {
    return null;
  }

  replace(_rules: BoxedRuleSet): null | BoxedExpression {
    return null;
  }

  has(_v: string | string[]): boolean {
    return false;
  }

  get isNaN(): boolean | undefined {
    return undefined;
  }

  get isZero(): boolean | undefined {
    return undefined;
  }
  get isNotZero(): boolean | undefined {
    return undefined;
  }

  get isOne(): boolean | undefined {
    return undefined;
  }

  get isNegativeOne(): boolean | undefined {
    return undefined;
  }

  get isInfinity(): boolean | undefined {
    return undefined;
  }

  // Not +- Infinity, not NaN
  get isFinite(): boolean | undefined {
    return undefined;
  }

  get isEven(): boolean | undefined {
    return undefined;
  }

  get isOdd(): boolean | undefined {
    return undefined;
  }

  get isPrime(): boolean | undefined {
    return undefined;
  }

  get isComposite(): boolean | undefined {
    return undefined;
  }

  get numericValue(): number | Decimal | Complex | Rational | null {
    return null;
  }

  get sgn(): -1 | 0 | 1 | undefined | null {
    return null;
  }

  isLess(_rhs: BoxedExpression): boolean | undefined {
    return undefined;
  }

  isLessEqual(_rhs: BoxedExpression): boolean | undefined {
    return undefined;
  }

  isGreater(_rhs: BoxedExpression): boolean | undefined {
    return undefined;
  }

  isGreaterEqual(_rhs: BoxedExpression): boolean | undefined {
    return undefined;
  }

  // x > 0
  get isPositive(): boolean | undefined {
    return undefined;
  }

  // x >= 0
  get isNonNegative(): boolean | undefined {
    return undefined;
  }

  // x < 0
  get isNegative(): boolean | undefined {
    return undefined;
  }

  // x <= 0
  get isNonPositive(): boolean | undefined {
    return undefined;
  }

  //
  //
  //
  //
  //

  isCompatible(
    _dom: BoxedDomain | DomainLiteral,
    _kind?: DomainCompatibility
  ): boolean {
    return false;
  }

  get description(): string[] | undefined {
    return undefined;
  }

  get url(): string | undefined {
    return undefined;
  }

  get wikidata(): string | undefined {
    return this._wikidata;
  }
  set wikidata(val: string | undefined) {
    this._wikidata = val;
  }

  get complexity(): number | undefined {
    return undefined;
  }

  get basedDefinition(): BoxedBaseDefinition | undefined {
    return undefined;
  }

  get symbolDefinition(): BoxedSymbolDefinition | undefined {
    return undefined;
  }

  get functionDefinition(): BoxedFunctionDefinition | undefined {
    return undefined;
  }

  bind(_scope: RuntimeScope | null): void {
    return;
  }

  unbind(): void {
    return;
  }

  get keys(): IterableIterator<string> | null {
    return null;
  }
  get keysCount() {
    return 0;
  }
  getKey(_key: string): BoxedExpression | undefined {
    return undefined;
  }
  hasKey(_key: string): boolean {
    return false;
  }

  get value(): BoxedExpression | undefined {
    return undefined;
  }
  set value(_value: BoxedExpression | number | undefined) {
    throw new Error(`Can't change the value of \\(${this.latex}\\)`);
  }

  get domain(): BoxedDomain {
    return this.engine.domain('Void') as BoxedDomain;
  }
  set domain(_domain: BoxedDomain) {
    throw new Error(`Can't change the domain of \\(${this.latex}\\)`);
  }

  get explicitDomain(): BoxedDomain | undefined {
    return this.domain;
  }

  get isNumber(): boolean | undefined {
    return undefined;
  }

  get isInteger(): boolean | undefined {
    return undefined;
  }

  get isRational(): boolean | undefined {
    return undefined;
  }

  get isAlgebraic(): boolean | undefined {
    return false;
  }

  get isReal(): boolean | undefined {
    return undefined;
  }

  // Real or +-Infinity
  get isExtendedReal(): boolean | undefined {
    return undefined;
  }

  get isComplex(): boolean | undefined {
    return undefined;
  }

  get isImaginary(): boolean | undefined {
    return undefined;
  }

  get isExtendedComplex(): boolean | undefined {
    return undefined;
  }
  simplify(_options?: SimplifyOptions): BoxedExpression {
    return this;
  }
  evaluate(options?: EvaluateOptions): BoxedExpression {
    return this.simplify(options);
  }

  N(_options?: NOptions): BoxedExpression {
    return this.evaluate();
  }
}
