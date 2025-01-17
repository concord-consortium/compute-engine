import {
  gamma as gammaComplex,
  lngamma as lngammaComplex,
} from '../numerics/numeric-complex';
import {
  factorial as bigFactorial,
  gamma as bigGamma,
  lngamma as bigLngamma,
} from '../numerics/numeric-bignum';
import {
  asFloat,
  asSmallInteger,
  factorial,
  gamma,
  lngamma,
} from '../numerics/numeric';
import {
  isBigRational,
  isMachineRational,
  rationalize,
} from '../numerics/rationals';
import { BoxedExpression, IdTable, IComputeEngine } from '../public';
import { bignumPreferred } from '../boxed-expression/utils';
import { canonicalNegate, processNegate } from '../symbolic/negate';
import {
  simplifyAdd,
  evalAdd,
  domainAdd,
  evalSummation,
  canonicalSummation,
} from './arithmetic-add';
import {
  simplifyMultiply,
  evalMultiply,
  evalMultiplication,
  canonicalMultiplication,
} from './arithmetic-multiply';
import { simplifyDivide } from './arithmetic-divide';
import { processPower, processSqrt } from './arithmetic-power';
import { applyN, apply2N } from '../symbolic/utils';
import Decimal from 'decimal.js';
import Complex from 'complex.js';
import {
  validateArgument,
  validateArgumentCount,
  validateArguments,
} from '../boxed-expression/validate';
import { canonical, flattenSequence } from '../symbolic/flatten';

// @todo Future additions to the dictionary
// Re: real part
// Im: imaginary part
// Arg: argument (phase angle in radians)
// Conjugate: complex conjugate
// complex-cartesian (constructor)
// complex-polar
// LogOnePlus: { domain: 'Number' },
// mod (modulo). See https://numerics.diploid.ca/floating-point-part-4.html,
// regarding 'remainder' and 'truncatingRemainder'
// Lcm
// Gcd
// Sum
// Product
// Numerator
// Denominator
// Rationalize: convert an approximate number to a nearby rational
// Mod: modulo
// Boole

// # Prime Numbers:
// Prime: gives the nth prime number
// NextPrime: the smallest prime larger than `n`
// PrimeFactors
// Divisors

// # Combinatorials
// Binomial
// Fibonacci

export const ARITHMETIC_LIBRARY: IdTable[] = [
  {
    //
    // Functions
    //
    Abs: {
      wikidata: 'Q3317982', // magnitude 'Q120812 (for reals)
      threadable: true,
      idempotent: true,
      complexity: 1200,
      signature: {
        domain: ['Function', 'Number', 'NonNegativeNumber'],
        simplify: (ce, ops) => processAbs(ce, ops[0], 'simplify'),
        evaluate: (ce, ops) => processAbs(ce, ops[0], 'evaluate'),
        N: (ce, ops) => processAbs(ce, ops[0], 'N'),
      },
    },

    Add: {
      wikidata: 'Q32043',
      associative: true,
      commutative: true,
      threadable: true,
      idempotent: true,
      complexity: 1300,
      hold: 'all',
      signature: {
        domain: 'NumericFunction',
        codomain: (ce, args) =>
          domainAdd(
            ce,
            args.map((x) => x.domain)
          ),
        // canonical: (ce, args) => canonicalAdd(ce, args), // never called: shortpath
        simplify: (ce, ops) => simplifyAdd(ce, ops),
        evaluate: (ce, ops) => evalAdd(ce, ops),
        N: (ce, ops) => evalAdd(ce, ops, 'N'),
      },
    },

    Ceil: {
      description: 'Rounds a number up to the next largest integer',
      complexity: 1250,
      signature: {
        domain: ['Function', 'Number', 'Integer'],
        evaluate: (_ce, ops) =>
          applyN(
            ops[0],
            Math.ceil,
            (x) => x.ceil(),
            (z) => z.ceil(0)
          ),
      },
    },

    Chop: {
      associative: true,
      threadable: true,
      idempotent: true,
      complexity: 1200,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        evaluate: (ce, ops) =>
          applyN(
            ops[0],
            (x) => ce.chop(x),
            (x) => ce.chop(x),
            (x) => ce.chop(x)
          ),
      },
    },

    Complex: {
      // This function is converted during boxing, so unlikely to encounter
      wikidata: 'Q11567',
      complexity: 500,
    },

    Divide: {
      wikidata: 'Q1226939',
      complexity: 2500,
      // - if numer product of numbers, or denom product of numbers,
      // i.e. √2x/2 -> 0.707x, 2/√2x -> 1.4142x

      signature: {
        domain: ['Function', 'Number', 'Number', 'Number'],
        canonical: (ce, args) => {
          args = validateArguments(ce, canonical(flattenSequence(args)), [
            'Number',
            'Number',
          ]);

          if (args.length !== 2) return ce._fn('Divide', args);

          return ce.div(args[0], args[1]);
        },
        simplify: (ce, args) => simplifyDivide(ce, args[0], args[1]),
        evaluate: (ce, ops) =>
          apply2N(
            ops[0],
            ops[1],
            (n, d) => n / d,
            (n, d) => n.div(d),
            (n, d) => n.div(d)
          ),
      },
    },

    Exp: {
      wikidata: 'Q168698',
      threadable: true,
      complexity: 3500,
      // Exp(x) -> e^x

      signature: {
        domain: ['Function', 'Number', 'Number'],
        canonical: (ce, args) => {
          args = validateArguments(ce, canonical(flattenSequence(args)), [
            'Number',
          ]);
          if (args.length !== 1) return ce._fn('Power', args);
          return ce.pow(ce.symbol('ExponentialE'), args[0]);
        },
      },
    },

    Erf: {
      description: 'Complementary Error Function',

      complexity: 7500,
    },

    Erfc: {
      description: 'Complementary Error Function',

      complexity: 7500,
    },

    Factorial: {
      description: 'The factorial function',
      wikidata: 'Q120976',
      complexity: 9000,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        evaluate: (ce, ops) => {
          const n = asSmallInteger(ops[0]);
          if (n !== null && n >= 0) {
            if (!bignumPreferred(ce)) return ce.number(factorial(n));
            return ce.number(bigFactorial(ce, ce.bignum(n)));
          }
          const num = ops[0].numericValue;
          if (num !== null && num instanceof Complex)
            return ce.number(gammaComplex(num.add(1)));

          const f = asFloat(ops[0]);
          if (f !== null) return ce.number(gamma(1 + f));

          return undefined;
        },
      },
    },

    Floor: {
      wikidata: 'Q56860783',
      complexity: 1250,

      signature: {
        domain: ['Function', 'Number', 'ExtendedRealNumber'],
        evaluate: (ce, ops) =>
          applyN(
            ops[0],
            Math.floor,
            (x) => x.floor(),
            (z) => z.floor(0)
          ),
      },
    },

    Gamma: {
      wikidata: 'Q190573',
      complexity: 8000,

      signature: {
        domain: ['Function', 'Number', 'Number', 'Number'],
        N: (ce, ops) =>
          applyN(
            ops[0],
            (x) => gamma(x),
            (x) => bigGamma(ce, x),
            (x) => gammaComplex(x)
          ),
      },
    },

    LogGamma: {
      complexity: 8000,

      signature: {
        domain: ['Function', 'Number', 'Number', 'Number'],
        N: (ce, ops) =>
          applyN(
            ops[0],
            (x) => lngamma(x),
            (x) => bigLngamma(ce, x),
            (x) => lngammaComplex(x)
          ),
      },
    },

    Ln: {
      description: 'Natural Logarithm',
      wikidata: 'Q204037',
      complexity: 4000,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        N: (ce, ops) =>
          applyN(
            ops[0],
            (x) => (x >= 0 ? Math.log(x) : ce.complex(x).log()),
            (x) => (!x.isNeg() ? x.ln() : ce.complex(x.toNumber()).log()),
            (z) => z.log()
          ),
      },
    },

    Log: {
      description: 'Log(z, b = 10) = Logarithm of base b',
      wikidata: 'Q11197',
      complexity: 4100,

      signature: {
        domain: ['Function', 'Number', ['Maybe', 'Number'], 'Number'],
        canonical: (ce, ops) => {
          ops = canonical(flattenSequence(ops));
          if (ops.length === 1)
            return ce._fn('Log', [validateArgument(ce, ops[0], 'Number')]);
          if (ops.length === 2) {
            const arg = validateArgument(ce, ops[0], 'Number');
            const base = validateArgument(ce, ops[1], 'Number');
            if (base.numericValue === 10) return ce._fn('Log', [arg]);
            return ce._fn('Log', [arg, base]);
          }
          return ce._fn('Log', validateArgumentCount(ce, ops, 2));
        },
        N: (ce, ops) => {
          if (ops[1] === undefined)
            return applyN(
              ops[0],
              (x) =>
                x >= 0 ? Math.log10(x) : ce.complex(x).log().div(Math.LN10),
              (x) =>
                !x.isNeg()
                  ? Decimal.log10(x)
                  : ce.complex(x.toNumber()).log().div(Math.LN10),
              (z) => z.log().div(Math.LN10)
            );
          return apply2N(
            ops[0],
            ops[1],
            (a, b) => Math.log(a) / Math.log(b),
            (a, b) => a.log(b),
            (a, b) => a.log().div(typeof b === 'number' ? Math.log(b) : b.log())
          );
        },
      },
    },

    Lb: {
      description: 'Base-2 Logarithm',
      wikidata: 'Q581168',
      complexity: 4100,

      signature: {
        domain: ['Function', 'Number', 'Number'],

        N: (ce, ops) =>
          applyN(
            ops[0],
            (x) => (x >= 0 ? Math.log2(x) : ce.complex(x).log().div(Math.LN2)),
            (x) =>
              x.isNeg()
                ? Decimal.log10(x)
                : ce.complex(x.toNumber()).log().div(Math.LN2),
            (z) => z.log().div(Math.LN2)
          ),
      },
    },

    Lg: {
      description: 'Base-10 Logarithm',
      wikidata: 'Q966582',
      complexity: 4100,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        N: (ce, ops) =>
          applyN(
            ops[0],
            (x) =>
              x >= 0 ? Math.log10(x) : ce.complex(x).log().div(Math.LN10),
            (x) =>
              !x.isNeg()
                ? Decimal.log10(x)
                : ce.complex(x.toNumber()).log().div(Math.LN10),
            (z) => z.log().div(Math.LN10)
          ),
      },
    },

    Max: {
      description: 'Maximum of two or more numbers',
      complexity: 1200,
      signature: {
        domain: ['Function', ['Sequence', 'Number'], 'Number'],
        simplify: (ce, ops) => {
          if (ops.length === 0) return ce._NEGATIVE_INFINITY;
          if (ops.length === 1) return ops[0];
          return ce.box(['Max', ...ops]);
        },
        evaluate: (ce, ops) => {
          if (ops.length === 0) return ce._NEGATIVE_INFINITY;

          let result: BoxedExpression | undefined = undefined;
          const rest: BoxedExpression[] = [];

          for (const op of ops) {
            if (!op.isNumber || op.numericValue === undefined) rest.push(op);
            else if (!result || op.isGreater(result)) result = op;
          }
          if (rest.length > 0)
            return ce.box(result ? ['Max', result, ...rest] : ['Max', ...rest]);
          return result ?? ce._NAN;
        },
      },
    },

    Min: {
      description: 'Minimum of two or more numbers',
      complexity: 1200,

      signature: {
        domain: ['Function', ['Sequence', 'Number'], 'Number'],
        simplify: (ce, ops) => {
          if (ops.length === 0) return ce._NEGATIVE_INFINITY;
          if (ops.length === 1) return ops[0];
          return ce.box(['Min', ...ops]);
        },
        evaluate: (ce, ops) => {
          if (ops.length === 0) return ce._NEGATIVE_INFINITY;

          let result: BoxedExpression | undefined = undefined;
          const rest: BoxedExpression[] = [];

          for (const op of ops) {
            if (!op.isNumber || op.numericValue === undefined) rest.push(op);
            else if (!result || op.isLess(result)) result = op;
          }
          if (rest.length > 0)
            return ce.box(result ? ['Min', result, ...rest] : ['Min', ...rest]);
          return result ?? ce._NAN;
        },
      },
    },

    Multiply: {
      wikidata: 'Q40276',
      associative: true,
      commutative: true,
      idempotent: true,
      complexity: 2100,
      hold: 'all',

      signature: {
        domain: 'NumericFunction',
        // Never called: fastpath
        // canonical: (ce, args) => {
        //   return canonicalMultiply(ce, args);
        // },
        simplify: (ce, ops) => simplifyMultiply(ce, ops),
        evaluate: (ce, ops) => evalMultiply(ce, ops),
        N: (ce, ops) => evalMultiply(ce, ops, 'N'),
      },
    },

    Negate: {
      description: 'Additive Inverse',
      wikidata: 'Q715358',
      complexity: 2000,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        codomain: (ce, args) => {
          const arg = args[0].domain;
          if (!arg.literal) return arg;
          const negDomain = {
            PositiveNumber: 'NegativeNumber',
            NonNegativeNumber: 'NonPositiveNumber',
            NonPositiveNumber: 'NonNegativeNumber',
            NegativeNumber: 'PositiveNumber',
            PositiveInteger: 'NegativeInteger',
            NonNegativeInteger: 'NonPositiveInteger',
            NonPositiveInteger: 'NonNegativeInteger',
            NegativeInteger: 'PositiveInteger',
          }[arg.literal];
          if (negDomain) return ce.domain(negDomain);
          return arg;
        },
        canonical: (ce, args) => {
          args = validateArguments(ce, canonical(flattenSequence(args)), [
            'Number',
          ]);
          if (args.length !== 1) return ce._fn('Negate', args);

          return canonicalNegate(args[0]);
        },
        simplify: (ce, ops) => processNegate(ce, ops[0], 'simplify'),
        evaluate: (ce, ops) => processNegate(ce, ops[0], 'evaluate'),
        N: (ce, ops) => processNegate(ce, ops[0], 'N'),
        sgn: (_ce, args): -1 | 0 | 1 | undefined => {
          const s = args[0].sgn;
          if (s === undefined || s === null) return undefined;
          if (s === 0) return 0;
          if (s > 0) return -1;
          if (s < 0) return +1;
          return undefined;
        },
      },
    },

    Power: {
      wikidata: 'Q33456',
      commutative: false,
      complexity: 3500,
      signature: {
        domain: ['Function', 'Number', 'Number', 'Number'],
        canonical: (ce, args) => {
          args = validateArguments(ce, canonical(flattenSequence(args)), [
            'Number',
            'Number',
          ]);
          if (args.length !== 2) return ce._fn('Power', args);

          return ce.pow(args[0], args[1]);
        },
        simplify: (ce, ops) => processPower(ce, ops[0], ops[1], 'simplify'),
        evaluate: (ce, ops) => processPower(ce, ops[0], ops[1], 'evaluate'),
        N: (ce, ops) => {
          // @fastpath
          if (
            ce.numericMode === 'machine' &&
            typeof ops[0].numericValue === 'number' &&
            typeof ops[1].numericValue === 'number'
          )
            return ce.number(
              Math.pow(ops[0].numericValue, ops[1].numericValue)
            );
          return processPower(ce, ops[0], ops[1], 'N');
        },
        // Defined as RealNumber for all power in RealNumber when base > 0;
        // when x < 0, only defined if n is an integer
        // if x is a non-zero complex, defined as ComplexNumber
        // Square root of a prime is irrational (AlgebraicNumber)
        // https://proofwiki.org/wiki/Square_Root_of_Prime_is_Irrational
        // evalDomain: (ce, base: BoxedExpression, power: BoxedExpression) ;
      },
    },

    Product: {
      wikidata: 'Q901718',
      complexity: 1000,
      hold: 'first',
      signature: {
        domain: [
          'Function',
          'Anything',
          // [
          //   'Maybe',
          'Tuple',
          // ['Tuple', 'Symbol', ['Maybe', 'Integer'], ['Maybe', 'Integer']],
          // ],
          'Number',
        ],
        // codomain: (ce, args) => domainAdd(ce, args),
        // The 'body' and 'range' need to be interpreted by canonicalMultiplication(). Don't canonicalize them yet.
        canonical: (ce, ops) => canonicalMultiplication(ce, ops[0], ops[1]),
        simplify: (ce, ops) =>
          evalMultiplication(ce, ops[0], ops[1], 'simplify'),
        evaluate: (ce, ops) =>
          evalMultiplication(ce, ops[0], ops[1], 'evaluate'),
        N: (ce, ops) => evalMultiplication(ce, ops[0], ops[1], 'N'),
      },
    },

    Rational: {
      complexity: 2400,

      signature: {
        domain: ['Function', 'Number', ['Maybe', 'Number'], 'RationalNumber'],
        canonical: (ce, args) => {
          args = canonical(flattenSequence(args));

          if (args.length === 0)
            return ce._fn('Rational', [ce.error(['missing', 'Number'])]);

          if (args.length === 1)
            return ce._fn('Rational', [
              validateArgument(ce, args[0], 'ExtendedRealNumber'),
            ]);

          args = validateArguments(ce, args, ['Integer', 'Integer']);

          if (args.length !== 2) return ce._fn('Rational', args);

          return ce.div(args[0], args[1]);
        },
        simplify: (ce, ops) => {
          if (ops.length !== 2) return undefined;
          return simplifyDivide(ce, ops[0], ops[1]);
        },
        evaluate: (ce, ops) => {
          if (ops.length === 2) {
            const [n, d] = [asSmallInteger(ops[0]), asSmallInteger(ops[1])];
            if (n !== null && d !== null) return ce.number([n, d]);
            return undefined;
          }

          //
          // If there is a single argument, i.e. `['Rational', 'Pi']`
          // the function evaluates to a rational expression of the argument
          //
          const f = asFloat(ops[0].N());
          if (f === null) return undefined;
          return ce.number(rationalize(f));
        },
        N: (ce, ops) => {
          if (ops.length === 1) return ops[0];

          return apply2N(
            ops[0],
            ops[1],
            (a, b) => a / b,
            (a, b) => a.div(b),
            (a, b) => a.div(b)
          );
        },
      },
    },

    Root: {
      complexity: 3200,

      signature: {
        domain: ['Function', 'Number', 'Number', 'Number'],
        canonical: (ce, args) => {
          args = canonical(flattenSequence(args));

          if (args.length > 2)
            return ce._fn('Root', validateArgumentCount(ce, args, 2));

          const [base, exp] = [
            validateArgument(ce, args[0], 'Number'),
            validateArgument(ce, args[1], 'Number'),
          ];
          if (!exp.isValid || !base.isValid) return ce._fn('Root', [base, exp]);

          return ce.pow(base, ce.inv(exp));
        },
      },
    },

    Round: {
      complexity: 1250,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        evaluate: (ce, ops) =>
          applyN(
            ops[0],
            Math.round,
            (x) => x.round(),
            (x) => x.round(0)
          ),
      },
    },

    Sign: {
      complexity: 1200,

      signature: {
        domain: ['Function', 'Number', ['Range', -1, 1]],
        simplify: (ce, ops) => {
          const s = ops[0].sgn;
          if (s === 0) return ce._ZERO;
          if (s === 1) return ce._ONE;
          if (s === -1) return ce._NEGATIVE_ONE;
          return undefined;
        },
        evaluate: (ce, ops) => {
          const s = ops[0].sgn;
          if (s === 0) return ce._ZERO;
          if (s === 1) return ce._ONE;
          if (s === -1) return ce._NEGATIVE_ONE;
          return undefined;
        },
        N: (ce, ops) => {
          const s = ops[0].sgn;
          if (s === 0) return ce._ZERO;
          if (s === 1) return ce._ONE;
          if (s === -1) return ce._NEGATIVE_ONE;
          return undefined;
        },
      },
    },

    SignGamma: {
      description: 'The sign of the gamma function: -1 or +1',
      complexity: 7900,

      // @todo
    },
    Sqrt: {
      description: 'Square Root',
      wikidata: 'Q134237',
      complexity: 3000,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        canonical: (ce, args) => {
          args = canonical(flattenSequence(args));
          if (args.length !== 1) return ce._fn('Sqrt', args);
          return ce.pow(args[0], ce._HALF);
        },
        simplify: (ce, ops) => processSqrt(ce, ops[0], 'simplify'),
        evaluate: (ce, ops) => processSqrt(ce, ops[0], 'evaluate'),
        N: (ce, ops) => processSqrt(ce, ops[0], 'N'),
        // evalDomain: Square root of a prime is irrational
        // https://proofwiki.org/wiki/Square_Root_of_Prime_is_Irrational
      },
    },

    Square: {
      wikidata: 'Q3075175',
      complexity: 3100,

      signature: {
        domain: ['Function', 'Number', 'Number'],
        canonical: (ce, args) => {
          args = canonical(flattenSequence(args));
          if (args.length !== 1) return ce._fn('Square', args);
          return ce.pow(args[0], ce.number(2));
        },
      },
    },

    Subtract: {
      wikidata: 'Q40754',
      complexity: 1350,

      signature: {
        domain: ['Function', 'Number', ['Maybe', 'Number'], 'Number'],
        canonical: (ce, args) => {
          // Not necessarily legal, but probably what was intended:
          // ['Subtract', 'x'] -> ['Negate', 'x']
          args = canonical(flattenSequence(args));
          if (args.length === 1) return canonicalNegate(args[0]);
          args = validateArgumentCount(ce, args, 2);
          if (args.length !== 2) return ce._fn('Subtract', args);
          if (!args.every((x) => x.isValid)) return ce._fn('Subtract', args);
          return ce.add([args[0], canonicalNegate(args[1])]);
        },
      },
    },
    Sum: {
      wikidata: 'Q218005',
      complexity: 1000,
      hold: 'all',
      signature: {
        domain: [
          'Function',
          'Anything',
          // [
          //   'Maybe',
          'Tuple',
          // ['Tuple', 'Symbol', ['Maybe', 'Integer'], ['Maybe', 'Integer']],
          // ],
          'Number',
        ],
        canonical: (ce, ops) => canonicalSummation(ce, ops[0], ops[1]),
        simplify: (ce, ops) => evalSummation(ce, ops[0], ops[1], 'simplify'),
        evaluate: (ce, ops) => evalSummation(ce, ops[0], ops[1], 'evaluate'),
        N: (ce, ops) => evalSummation(ce, ops[0], ops[1], 'N'),
      },
    },
  },
  {
    //
    // Constants
    // Note: constants are put in a separate, subsequent, dictionary because
    // some of the values (CatalanConstant) reference some function names (Add...)
    // that are defined above. This avoid circular references.
    //
    e: {
      domain: 'TranscendentalNumber',
      constant: true,
      holdUntil: 'never',
      value: 'ExponentialE',
    },
    i: {
      domain: 'ImaginaryNumber',
      constant: true,
      holdUntil: 'never',
      flags: { imaginary: true },
      value: 'ImaginaryUnit',
    },
    MachineEpsilon: {
      /**
       * The difference between 1 and the next larger floating point number
       *
       *    2^{−52}
       *
       * See https://en.wikipedia.org/wiki/Machine_epsilon
       */
      domain: 'RealNumber',
      holdUntil: 'N',
      constant: true,
      flags: { real: true },
      value: { num: Number.EPSILON.toString() },
    },
    Half: {
      constant: true,
      holdUntil: 'never',
      value: ['Rational', 1, 2],
    },
    ImaginaryUnit: {
      domain: 'ImaginaryNumber',
      constant: true,
      holdUntil: 'evaluate', // @todo maybe?
      wikidata: 'Q193796',
      flags: { imaginary: true },
      value: ['Complex', 0, 1],
    },
    ExponentialE: {
      domain: 'TranscendentalNumber',
      flags: { algebraic: false, real: true },
      wikidata: 'Q82435',
      constant: true,
      holdUntil: 'N',

      value: (engine) =>
        bignumPreferred(engine) ? engine._BIGNUM_ONE.exp() : Math.exp(1),
    },
    GoldenRatio: {
      domain: 'AlgebraicNumber',
      wikidata: 'Q41690',
      constant: true,
      flags: { algebraic: true },
      holdUntil: 'simplify',
      value: ['Divide', ['Add', 1, ['Sqrt', 5]], 2],
    },
    CatalanConstant: {
      domain: 'RealNumber',
      flags: { algebraic: undefined }, // Not proven irrational or transcendental

      wikidata: 'Q855282',
      constant: true,
      holdUntil: 'N',
      value: {
        // From http://www.fullbooks.com/Miscellaneous-Mathematical-Constants1.html
        num: `0.91596559417721901505460351493238411077414937428167
                  21342664981196217630197762547694793565129261151062
                  48574422619196199579035898803325859059431594737481
                  15840699533202877331946051903872747816408786590902
                  47064841521630002287276409423882599577415088163974
                  70252482011560707644883807873370489900864775113225
                  99713434074854075532307685653357680958352602193823
                  23950800720680355761048235733942319149829836189977
                  06903640418086217941101917532743149978233976105512
                  24779530324875371878665828082360570225594194818097
                  53509711315712615804242723636439850017382875977976
                  53068370092980873887495610893659771940968726844441
                  66804621624339864838916280448281506273022742073884
                  31172218272190472255870531908685735423498539498309
                  91911596738846450861515249962423704374517773723517
                  75440708538464401321748392999947572446199754961975
                  87064007474870701490937678873045869979860644874974
                  64387206238513712392736304998503539223928787979063
                  36440323547845358519277777872709060830319943013323
                  16712476158709792455479119092126201854803963934243
                  `,
      },
    },
    EulerGamma: {
      // From http://www.fullbooks.com/Miscellaneous-Mathematical-Constants2.html
      domain: 'RealNumber',
      flags: { algebraic: undefined }, // Not proven irrational or transcendental
      wikidata: 'Q273023',
      holdUntil: 'N',
      constant: true,
      value: {
        num: `0.57721566490153286060651209008240243104215933593992359880576723488486772677766
          467093694706329174674951463144724980708248096050401448654283622417399764492353
          625350033374293733773767394279259525824709491600873520394816567085323315177661
          152862119950150798479374508570574002992135478614669402960432542151905877553526
          733139925401296742051375413954911168510280798423487758720503843109399736137255
          306088933126760017247953783675927135157722610273492913940798430103417771778088
          154957066107501016191663340152278935867965497252036212879226555953669628176388
          792726801324310104765059637039473949576389065729679296010090151251959509222435
          014093498712282479497471956469763185066761290638110518241974448678363808617494
          551698927923018773910729457815543160050021828440960537724342032854783670151773
          943987003023703395183286900015581939880427074115422278197165230110735658339673`,
      },
    },
  },
  {
    PreIncrement: {
      signature: { domain: ['Function', 'Number', 'Number'] },
    },
    PreDecrement: {
      signature: { domain: ['Function', 'Number', 'Number'] },
    },
  },
];

function processAbs(
  ce: IComputeEngine,
  arg: BoxedExpression,
  mode: 'simplify' | 'evaluate' | 'N'
): BoxedExpression | undefined {
  if (mode !== 'simplify') {
    const num = arg.numericValue;
    if (num !== null) {
      if (typeof num === 'number') return ce.number(Math.abs(num));
      if (num instanceof Decimal) return ce.number(num.abs());
      if (num instanceof Complex) return ce.number(num.abs());
      if (isMachineRational(num))
        return ce.number(
          mode === 'N' ? Math.abs(num[0] / num[1]) : [Math.abs(num[0]), num[1]]
        );

      if (isBigRational(num)) {
        const [n, d] = num;
        return ce.number(
          mode === 'N'
            ? ce.bignum(n).div(ce.bignum(d)).abs()
            : [n > 0 ? n : -n, d]
        );
      }
    }
  }
  if (arg.isNonNegative) return arg;
  if (arg.isNegative) return ce.neg(arg);
  return undefined;
}
