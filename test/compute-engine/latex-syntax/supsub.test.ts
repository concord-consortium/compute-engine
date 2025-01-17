import { Expression } from '../../../src/math-json/math-json-format';
import { parse, latex, engine } from '../../utils';

describe('POWER', () => {
  test('Power Invalid forms', () => {
    expect(latex(['Power'])).toMatchInlineSnapshot(
      `(\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}})^{\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}}}`
    );
    expect(
      latex(['Power', null as unknown as Expression])
    ).toMatchInlineSnapshot(
      `(\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}})^{\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}}}`
    );
    expect(
      latex(['Power', undefined as unknown as Expression])
    ).toMatchInlineSnapshot(
      `(\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}})^{\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}}}`
    );
    expect(latex(['Power', 1])).toMatchInlineSnapshot(
      `1^{\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}}}`
    );
    expect(latex(['Power', NaN])).toMatchInlineSnapshot(
      `\\operatorname{NaN}^{\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}}}`
    );
    expect(latex(['Power', Infinity])).toMatchInlineSnapshot(
      `\\infty^{\\mathtip{\\error{\\blacksquare}}{\\mathrm{Number}\\text{ missing}}}`
    );
  });
});

describe('INVERSE FUNCTION', () => {
  test('Valid forms', () => {
    expect(latex(['InverseFunction', 'Sin'])).toMatchInlineSnapshot(`\\arcsin`);
    expect(latex(['InverseFunction', 'f'])).toMatchInlineSnapshot(`f^{-1}`);
  });
});

describe('COMPLEX SYMBOLS', () => {
  test('x_{\\mathrm{max}}', () =>
    expect(
      engine.parse('x_{\\mathrm{max}}').canonical.toJSON()
    ).toMatchInlineSnapshot(`x_max`));
});

describe('SUPSUB', () => {
  test('Superscript', () => {
    expect(parse('2^2')).toMatchInlineSnapshot(`["Square", 2]`);
    expect(parse('x^t')).toMatchInlineSnapshot(`["Power", "x", "t"]`);
    expect(parse('2^{10}')).toMatchInlineSnapshot(`["Power", 2, 10]`);
    expect(parse('\\pi^2')).toMatchInlineSnapshot(`["Square", "Pi"]`);
    expect(parse('2^23')).toMatchInlineSnapshot(`12`);
    expect(parse('2^\\pi')).toMatchInlineSnapshot(`["Power", 2, "Pi"]`);
    expect(parse('2^\\frac12')).toMatchInlineSnapshot(`["Sqrt", 2]`);
    expect(parse('2^{3^4}')).toMatchInlineSnapshot(
      `["Power", 2, ["Power", 3, 4]]`
    );
    expect(parse('2^{10}')).toMatchInlineSnapshot(`["Power", 2, 10]`);
    expect(parse('2^{-2}')).toMatchInlineSnapshot(
      `["Divide", 1, ["Square", 2]]`
    );
    expect(parse('2^3^4')).toMatchInlineSnapshot(`
      [
        "Power",
        2,
        [
          "Error",
          [
            "ErrorCode",
            "'incompatible-domain'",
            "Number",
            ["Domain", "List"]
          ],
          ["List", 3, 4]
        ]
      ]
    `); // @todo: unclear what the right answer is... (and it's invalid LaTeX)
    expect(parse('2^{3^4}')).toMatchInlineSnapshot(
      `["Power", 2, ["Power", 3, 4]]`
    );
    expect(parse('12^34.5')).toMatchInlineSnapshot(`["Multiply", 4.5, 1728]`);
    expect(parse('x^2')).toMatchInlineSnapshot(`["Square", "x"]`);
    expect(parse('x^{x+1}')).toMatchInlineSnapshot(
      `["Power", "x", ["Add", "x", 1]]`
    );
  });
  test('Subscript', () => {
    expect(parse('x_0')).toMatchInlineSnapshot(`x_0`);
    expect(parse('x^2_0')).toMatchInlineSnapshot(`["Square", "x_0"]`);
    expect(parse('x_0^2')).toMatchInlineSnapshot(`["Square", "x_0"]`);
    expect(parse('x_{n+1}')).toMatchInlineSnapshot(
      `["Subscript", "x", ["Add", "n", 1]]`
    );
    expect(parse('x_n_{+1}')).toMatchInlineSnapshot(
      `["Subscript", "x", ["List", "n", 1]]`
    );
  });
  test('Pre-sup, pre-sub', () => {
    expect(parse('_p^qx')).toMatchInlineSnapshot(`
      [
        "Multiply",
        [
          "Error",
          [
            "ErrorCode",
            "'incompatible-domain'",
            "Number",
            ["Domain", "String"]
          ],
          ["Subscript", "'missing'", ["Latex", "'_'"]]
        ],
        ["Power", "p", "q"],
        "x"
      ]
    `); // @fixme: nope...
    expect(parse('_p^qx_r^s')).toMatchInlineSnapshot(`
      [
        "Multiply",
        [
          "Error",
          [
            "ErrorCode",
            "'incompatible-domain'",
            "Number",
            ["Domain", "String"]
          ],
          ["Subscript", "'missing'", ["Latex", "'_'"]]
        ],
        ["Power", "p", "q"],
        ["Power", "x_r", "s"]
      ]
    `); // @fixme: nope...
    expect(parse('_{p+1}^{q+1}x_{r+1}^{s+1}')).toMatchInlineSnapshot(`
      [
        "Multiply",
        [
          "Error",
          [
            "ErrorCode",
            "'incompatible-domain'",
            "Number",
            ["Domain", "String"]
          ],
          ["Subscript", "'missing'", ["Latex", "'_'"]]
        ],
        ["Power", ["Add", "p", 1], ["Add", "q", 1]],
        ["Power", ["Subscript", "x", ["Add", "r", 1]], ["Add", "s", 1]]
      ]
    `); // @fixme: nope...
    expect(parse('x{}_{p+1}^{q+1}x_{r+1}^{s+1}')).toMatchInlineSnapshot(`
      [
        "Multiply",
        ["Power", ["Subscript", "x", ["Add", "p", 1]], ["Add", "q", 1]],
        ["Power", ["Subscript", "x", ["Add", "r", 1]], ["Add", "s", 1]]
      ]
    `); // @fixme: nope...
  });
  test('Sup/Sub groups', () => {
    expect(parse('(x+1)^{n-1}')).toMatchInlineSnapshot(
      `["Power", ["Add", "x", 1], ["Subtract", "n", 1]]`
    );
    expect(parse('(x+1)_{n-1}')).toMatchInlineSnapshot(
      `["Subscript", ["Add", "x", 1], ["Subtract", "n", 1]]`
    );
    expect(parse('(x+1)^n_0')).toMatchInlineSnapshot(
      `["Power", ["Subscript", ["Add", "x", 1], 0], "n"]`
    );
    expect(parse('^p_q{x+1}^n_0')).toMatchInlineSnapshot(`
      [
        "Multiply",
        [
          "Power",
          [
            "Error",
            [
              "ErrorCode",
              "'incompatible-domain'",
              "Number",
              ["Domain", "String"]
            ],
            "'missing'"
          ],
          [
            "Error",
            [
              "ErrorCode",
              "'incompatible-domain'",
              "Number",
              ["Domain", "String"]
            ],
            ["Latex", "'^'"]
          ]
        ],
        "p_q",
        ["Power", ["Subscript", ["Add", "x", 1], 0], "n"]
      ]
    `); // @fixme: nope...
    expect(parse('^{12}_{34}(x+1)^n_0')).toMatchInlineSnapshot(`
      [
        "Multiply",
        [
          "Power",
          [
            "Error",
            [
              "ErrorCode",
              "'incompatible-domain'",
              "Number",
              ["Domain", "String"]
            ],
            "'missing'"
          ],
          [
            "Error",
            [
              "ErrorCode",
              "'incompatible-domain'",
              "Number",
              ["Domain", "String"]
            ],
            ["Latex", "'^'"]
          ]
        ],
        ["Subscript", 12, 34],
        ["Power", ["Subscript", ["Add", "x", 1], 0], "n"]
      ]
    `); // @fixme: nope...
  });
  test('Accents', () => {
    expect(parse('\\vec{x}')).toMatchInlineSnapshot(`["OverVector", "x"]`);
    expect(parse('\\vec{AB}')).toMatchInlineSnapshot(
      `["OverVector", ["Multiply", "A", "B"]]`
    ); // @fixme: nope...
    expect(parse('\\vec{AB}^{-1}')).toMatchInlineSnapshot(
      `["Divide", 1, ["OverVector", ["Multiply", "A", "B"]]]`
    );
  });
});

describe('PRIME', () => {
  test('Valid forms', () => {
    expect(parse("f'")).toMatchInlineSnapshot(`
      [
        "Sequence",
        "f",
        [
          "Error",
          ["ErrorCode", "'unexpected-token'", "'''"],
          ["Latex", "'''"]
        ]
      ]
    `); // @fixme
    expect(parse("f''")).toMatchInlineSnapshot(`
      [
        "Sequence",
        "f",
        [
          "Error",
          ["ErrorCode", "'unexpected-token'", "'''"],
          ["Latex", "''''"]
        ]
      ]
    `); // @fixme
    expect(parse("f'''")).toMatchInlineSnapshot(`
      [
        "Sequence",
        "f",
        [
          "Error",
          ["ErrorCode", "'unexpected-token'", "'''"],
          ["Latex", "'''''"]
        ]
      ]
    `); // @fixme
    expect(parse('f\\prime')).toMatchInlineSnapshot(`
      [
        "Sequence",
        "f",
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ]
      ]
    `); // @fixme
    expect(parse('f\\prime\\prime')).toMatchInlineSnapshot(`
      [
        "Sequence",
        "f",
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ]
      ]
    `); // @fixme
    expect(parse('f\\prime\\prime\\prime')).toMatchInlineSnapshot(`
      [
        "Sequence",
        "f",
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ]
      ]
    `); // @fixme
    expect(parse('f\\doubleprime')).toMatchInlineSnapshot(`
      [
        "Sequence",
        "f",
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\doubleprime'"],
          ["Latex", "'\\doubleprime'"]
        ]
      ]
    `); // @fixme
    expect(parse('f^{\\prime}')).toMatchInlineSnapshot(`
      [
        "Power",
        [
          "Error",
          [
            "ErrorCode",
            "'incompatible-domain'",
            "Number",
            ["Domain", "Function"]
          ],
          "f"
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ]
      ]
    `);
    expect(parse('f^{\\prime\\prime}')).toMatchInlineSnapshot(`
      [
        "Sequence",
        [
          "Power",
          [
            "Error",
            [
              "ErrorCode",
              "'incompatible-domain'",
              "Number",
              ["Domain", "Function"]
            ],
            "f"
          ],
          ["Error", "'expected-closing-delimiter'", ["Latex", "'\\prime'"]]
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ],
        ["Error", "'unexpected-closing-delimiter'", ["Latex", "'}'"]]
      ]
    `); // @fixme
    expect(parse('f^{\\prime\\prime\\prime}')).toMatchInlineSnapshot(`
      [
        "Sequence",
        [
          "Power",
          [
            "Error",
            [
              "ErrorCode",
              "'incompatible-domain'",
              "Number",
              ["Domain", "Function"]
            ],
            "f"
          ],
          ["Error", "'expected-closing-delimiter'", ["Latex", "'\\prime'"]]
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\prime'"],
          ["Latex", "'\\prime'"]
        ],
        ["Error", "'unexpected-closing-delimiter'", ["Latex", "'}'"]]
      ]
    `); // @fixme
    expect(parse('f^{\\doubleprime}')).toMatchInlineSnapshot(`
      [
        "Power",
        [
          "Error",
          [
            "ErrorCode",
            "'incompatible-domain'",
            "Number",
            ["Domain", "Function"]
          ],
          "f"
        ],
        [
          "Error",
          ["ErrorCode", "'unexpected-command'", "'\\doubleprime'"],
          ["Latex", "'\\doubleprime'"]
        ]
      ]
    `);
  });
});
