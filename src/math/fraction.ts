/**
 * Exact Rational Number Arithmetic for Exponent Calculations
 * Guarantees zero floating-point approximation error.
 */

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

export class Fraction {
  readonly num: number;
  readonly den: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }
    const g = gcd(numerator, denominator);
    const sign = denominator < 0 ? -1 : 1;
    this.num = (sign * numerator) / g;
    this.den = Math.abs(denominator) / g;
  }

  static fromInt(n: number): Fraction {
    return new Fraction(n, 1);
  }

  static zero(): Fraction {
    return new Fraction(0, 1);
  }

  static one(): Fraction {
    return new Fraction(1, 1);
  }

  isZero(): boolean {
    return this.num === 0;
  }

  isOne(): boolean {
    return this.num === 1 && this.den === 1;
  }

  isNegative(): boolean {
    return this.num < 0;
  }

  isInteger(): boolean {
    return this.den === 1;
  }

  toNumber(): number {
    return this.num / this.den;
  }

  add(other: Fraction | number): Fraction {
    const f = typeof other === 'number' ? Fraction.fromInt(other) : other;
    return new Fraction(this.num * f.den + f.num * this.den, this.den * f.den);
  }

  sub(other: Fraction | number): Fraction {
    const f = typeof other === 'number' ? Fraction.fromInt(other) : other;
    return new Fraction(this.num * f.den - f.num * this.den, this.den * f.den);
  }

  mul(other: Fraction | number): Fraction {
    const f = typeof other === 'number' ? Fraction.fromInt(other) : other;
    return new Fraction(this.num * f.num, this.den * f.den);
  }

  div(other: Fraction | number): Fraction {
    const f = typeof other === 'number' ? Fraction.fromInt(other) : other;
    if (f.num === 0) {
      throw new Error('Division by zero fraction');
    }
    return new Fraction(this.num * f.den, this.den * f.num);
  }

  pow(exp: number): Fraction {
    if (exp === 0) return Fraction.one();
    if (exp > 0) {
      return new Fraction(Math.pow(this.num, exp), Math.pow(this.den, exp));
    }
    return new Fraction(Math.pow(this.den, -exp), Math.pow(this.num, -exp));
  }

  abs(): Fraction {
    return new Fraction(Math.abs(this.num), this.den);
  }

  neg(): Fraction {
    return new Fraction(-this.num, this.den);
  }

  reciprocal(): Fraction {
    if (this.num === 0) throw new Error('Cannot invert zero fraction');
    return new Fraction(this.den, this.num);
  }

  equals(other: Fraction | number): boolean {
    const f = typeof other === 'number' ? Fraction.fromInt(other) : other;
    return this.num === f.num && this.den === f.den;
  }

  toTeX(): string {
    if (this.den === 1) {
      return `${this.num}`;
    }
    if (this.num < 0) {
      return `-\\frac{${Math.abs(this.num)}}{${this.den}}`;
    }
    return `\\frac{${this.num}}{${this.den}}`;
  }

  /**
   * For usage as an exponent on a variable, e.g. x^{3} or x^{\frac{1}{2}} or x^{-2}
   */
  toExponentTeX(): string {
    if (this.den === 1) {
      return `${this.num}`;
    }
    if (this.num < 0) {
      return `-\\frac{${Math.abs(this.num)}}{${this.den}}`;
    }
    return `\\frac{${this.num}}{${this.den}}`;
  }

  toString(): string {
    return this.den === 1 ? `${this.num}` : `${this.num}/${this.den}`;
  }
}
