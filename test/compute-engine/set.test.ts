import { engine as ce } from '../utils';

describe('ELEMENT', () => {
  test(`literal`, () => {
    expect(
      ce.box(['Element', 2, 'Integer']).evaluate().json
    ).toMatchInlineSnapshot(`True`);
    expect(
      ce.box(['Element', 2, 'Number']).evaluate().json
    ).toMatchInlineSnapshot(`True`);
    expect(
      ce.box(['Element', 2, 'Boolean']).evaluate().json
    ).toMatchInlineSnapshot(`False`);
  });

  test(`strings`, () => {
    expect(
      ce.box(['Element', { str: 'wor' }, { str: 'Hello world' }]).evaluate()
        .json
    ).toMatchInlineSnapshot(`True`);
    expect(
      ce.box(['Element', { str: 'cat' }, { str: 'Hello world' }]).evaluate()
        .json
    ).toMatchInlineSnapshot(`False`);
    expect(
      ce.box(['Element', { str: 'wa' }, { str: 'Hello world' }]).evaluate().json
    ).toMatchInlineSnapshot(`False`);
    expect(
      ce.box(['Element', { str: 'rld' }, { str: 'Hello world' }]).evaluate()
        .json
    ).toMatchInlineSnapshot(`True`);
  });

  test('List', () => {
    expect(
      ce.box(['Element', 3, ['List', 2, 3, 4]]).evaluate().json
    ).toMatchInlineSnapshot(`True`);
    expect(
      ce.box(['Element', 5, ['List', 2, 3, 4]]).evaluate().json
    ).toMatchInlineSnapshot(`False`);
  });

  test('Sublists', () => {
    expect(
      ce.box(['Element', ['List', 2, 3], ['List', 2, 3, 4]]).evaluate().json
    ).toMatchInlineSnapshot(`True`);
    expect(
      ce.box(['Element', ['List', 3, 2], ['List', 2, 3, 4]]).evaluate().json
    ).toMatchInlineSnapshot(`False`);
    expect(
      ce.box(['Element', ['List', 3], ['List', 2, 3, 4]]).evaluate().json
    ).toMatchInlineSnapshot(`True`);
  });

  test('INVALID', () => {
    expect(ce.box(['Element']).evaluate().json).toMatchInlineSnapshot(
      `["Element", ["Error", "'missing'"], ["Error", "'missing'"]]`
    );
    expect(ce.box(['Element', 2]).evaluate().json).toMatchInlineSnapshot(
      `["Element", 2, ["Error", "'missing'"]]`
    );
    expect(
      ce.box(['Element', 2, 'Integer', 'Number']).evaluate().json
    ).toMatchInlineSnapshot(
      `["Element", 2, "Integer", ["Error", "'unexpected-argument'", "Number"]]`
    );
    expect(ce.box(['Element', 2, 3]).evaluate().json).toMatchInlineSnapshot(
      `["Element", 2, 3]`
    );
  });
});
