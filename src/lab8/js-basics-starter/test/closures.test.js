// C5 · createCounter, once, memoize. Тести не змінюйте: це специфікація з ТЗ у вигляді коду.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { createCounter, memoize, once } from '../src/closures.js';

describe('createCounter', () => {
  test('без аргументу починає з 0; increment збільшує на 1 і повертає нове значення', () => {
    const counter = createCounter();
    assert.equal(counter.value(), 0);
    assert.equal(counter.increment(), 1);
    assert.equal(counter.increment(), 2);
    assert.equal(counter.value(), 2);
  });

  test('start задає початкове значення; reset повертає до нього', () => {
    const counter = createCounter(10);
    counter.increment();
    assert.equal(counter.reset(), 10);
    assert.equal(counter.value(), 10);
  });

  test('два лічильники мають незалежний стан', () => {
    const first = createCounter();
    const second = createCounter(100);
    first.increment();
    first.increment();
    second.increment();
    assert.equal(first.value(), 2);
    assert.equal(second.value(), 101);
  });

  test('методи працюють і окремо від об’єкта', () => {
    const { increment, value } = createCounter(5);
    increment();
    assert.equal(value(), 6);
  });

  test('стан схований у замиканні: назовні лише три методи', () => {
    assert.deepEqual(Object.keys(createCounter()).sort(), ['increment', 'reset', 'value']);
  });
});

describe('once', () => {
  test('викликає fn один раз і далі повертає перший результат', () => {
    const calls = [];
    const init = once((x) => {
      calls.push(x);
      return x * 2;
    });
    assert.equal(init(21), 42);
    assert.equal(init(100), 42);
    assert.deepEqual(calls, [21]);
  });

  test('не викликає fn повторно, навіть якщо вона повернула undefined', () => {
    let calls = 0;
    const log = once(() => {
      calls += 1;
    });
    log();
    log();
    log();
    assert.equal(calls, 1);
  });

  test('кожна обгортка має власний стан', () => {
    const first = once(() => 'first');
    const second = once(() => 'second');
    assert.equal(first(), 'first');
    assert.equal(second(), 'second');
  });
});

describe('memoize', () => {
  test('повторний виклик з тим самим аргументом бере результат із кешу', () => {
    let calls = 0;
    const square = memoize((n) => {
      calls += 1;
      return n * n;
    });
    assert.equal(square(4), 16);
    assert.equal(square(4), 16);
    assert.equal(calls, 1);
    assert.equal(square(5), 25);
    assert.equal(calls, 2);
  });

  test("1 і '1' — різні аргументи", () => {
    const type = memoize((x) => typeof x);
    assert.equal(type(1), 'number');
    assert.equal(type('1'), 'string');
  });

  test('кешує й «хибні» результати: 0, undefined, false', () => {
    let calls = 0;
    const zero = memoize(() => {
      calls += 1;
      return 0;
    });
    zero('a');
    zero('a');
    assert.equal(calls, 1);
  });

  test('кожна memoize-функція має власний кеш', () => {
    const double = memoize((n) => n * 2);
    const triple = memoize((n) => n * 3);
    assert.equal(double(3), 6);
    assert.equal(triple(3), 9);
  });
});
