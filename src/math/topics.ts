import { TopicDefinition } from '../types';

export const TOPICS: TopicDefinition[] = [
  {
    id: 'product-powers',
    name: 'Product of Powers',
    ruleFormula: 'a^m \\cdot a^n = a^{m+n}',
    shortDesc: 'When multiplying powers with the same base, add their exponents.',
    example: 'x^3 \\cdot x^5 = x^{3+5} = x^8',
    domainNotes: 'Bases must be identical. Coefficients are multiplied normally.'
  },
  {
    id: 'quotient-powers',
    name: 'Quotient of Powers',
    ruleFormula: '\\frac{a^m}{a^n} = a^{m-n}',
    shortDesc: 'When dividing powers with the same nonzero base, subtract the denominator exponent from the numerator exponent.',
    example: '\\frac{x^8}{x^3} = x^{8-3} = x^5',
    domainNotes: 'Base a \\neq 0 since division by zero is undefined.'
  },
  {
    id: 'power-power',
    name: 'Power of a Power',
    ruleFormula: '(a^m)^n = a^{mn}',
    shortDesc: 'When raising a power to another power, multiply the inner and outer exponents.',
    example: '(x^3)^4 = x^{3 \\cdot 4} = x^{12}',
    domainNotes: 'Watch negative signs: (-2) \\cdot 3 = -6.'
  },
  {
    id: 'power-product',
    name: 'Power of a Product',
    ruleFormula: '(ab)^n = a^n b^n',
    shortDesc: 'A power applied to a product applies to every factor inside parentheses, including numerical coefficients.',
    example: '(3x^2)^3 = 3^3 \\cdot (x^2)^3 = 27x^6',
    domainNotes: 'Remember to raise numerical coefficients to the power as well.'
  },
  {
    id: 'power-quotient',
    name: 'Power of a Quotient',
    ruleFormula: '\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}',
    shortDesc: 'A power applied to a quotient applies to both numerator and denominator.',
    example: '\\left(\\frac{2x}{y^3}\\right)^2 = \\frac{2^2 x^2}{(y^3)^2} = \\frac{4x^2}{y^6}',
    domainNotes: 'Denominator b \\neq 0.'
  },
  {
    id: 'zero-exponent',
    name: 'Zero Exponent',
    ruleFormula: 'a^0 = 1 \\quad (a \\neq 0)',
    shortDesc: 'Any nonzero base raised to the zero power equals 1.',
    example: '5^0 = 1, \\quad (3xy^2)^0 = 1, \\quad 5x^0 = 5(1) = 5',
    domainNotes: '0^0 is an indeterminate form in arithmetic/algebra; a zero base cannot be evaluated with this rule.'
  },
  {
    id: 'negative-exponents',
    name: 'Negative Exponents',
    ruleFormula: 'a^{-n} = \\frac{1}{a^n} \\quad (a \\neq 0)',
    shortDesc: 'A negative exponent represents the reciprocal of the base raised to the positive power.',
    example: 'x^{-4} = \\frac{1}{x^4}, \\quad \\frac{1}{y^{-3}} = y^3',
    domainNotes: 'Base a \\neq 0. Note that a negative exponent does not make the expression negative.'
  },
  {
    id: 'fractional-exponents',
    name: 'Fractional Exponents',
    ruleFormula: 'a^{m/n} = \\sqrt[n]{a^m} = (\\sqrt[n]{a})^m',
    shortDesc: 'Fractional exponents represent roots and powers. The denominator is the root index, and the numerator is the power.',
    example: 'x^{1/2} = \\sqrt{x}, \\quad 8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4',
    domainNotes: 'For real numbers, even roots of negative numbers are not defined in the real number system.'
  },
  {
    id: 'combining-laws',
    name: 'Combining the Laws of Exponents',
    ruleFormula: '\\text{Multi-step integration of exponent laws}',
    shortDesc: 'Simplify multi-variable expressions requiring sequential application of product, quotient, power, negative, and fractional rules.',
    example: '\\frac{(x^{-2}y^3)^2}{x^3 y^{-1}} = \\frac{x^{-4}y^6}{x^3 y^{-1}} = x^{-4-3} y^{6-(-1)} = x^{-7}y^7 = \\frac{y^7}{x^7}',
    domainNotes: 'Follow standard order of operations: parentheses powers first, then multiply/divide, then eliminate negative exponents.'
  }
];

export function getTopicById(id: string): TopicDefinition | undefined {
  return TOPICS.find(t => t.id === id);
}
