/*
    css.jsx
    CSS Prefixing & Manipulation
*/

import memoized from './memoized';

//
// prefixCSS()
//
// Runtime CSS autoprefixing
//
// Takes: Style dict/object
// Returns: Prefixed style object.
//
// Notes: Only prefixes relevant to the executing browser
//        will be applied. Resultant style dict is NOT
//        portable. The original property is kept to
//        ensure logic that depends on it continues working.
export const prefixCSS = s => {
    let sp = {};
    for (let k of Object.keys(s)) {
        const kp = pickProperty(k);

        if (kp !== undefined) {
            const v = pickValue(kp, s[k]);
            if (kp !== k) {
                sp[kp] = v;
            }
            sp[k] = v;
        }
    }
    return sp;
};

//
// styleToCSS()
//
// Converts a React style object into a CSS string.
//

export const styleToCSS = (s, priority = null) => {
    let d = document.createElement('div');
    for (const [k, v] of Object.entries(s)) {
        let old = d.style[k];
        // try to set the style
        d.style.setProperty(k, v, priority);
        if (d.style[k] === old) {
            d.style.setProperty(k, `${v}px`, priority);
        }
    }
    return d.style.cssText;
};

//
// pickProperty()
//
// Vendor-prefix a given inline style attribute.
//
// Explanation:
//
// 1) CSSStyleDeclarations have different prototypes depending on the browser.
// 2) If a browser supports a style (eg `appearance` or `msTransition`),
// then it will appear in `CSSStyleDeclarations`'s prototype.
//
// Using this logic, we can test a bunch of prefixed versions of any
// given CSS property, and figure out which one the browser supports.
//
const __pickPropertyStyle = document.createElement('div').style;
export const pickProperty = memoized(property => {
    const [firstLetter, ...rest] = property;
    const capitalized = [firstLetter.toLocaleUpperCase(), ...rest].join('');
    return [
         property,
        `ms${capitalized}`,
        `Webkit${capitalized}`,
        `Moz${capitalized}`
    ].find(p => p in __pickPropertyStyle);
});

//
// pickValue()
//
// The idea is kinda like pickProperty, but it's for values.
// The browser won't set invalid CSS values, so, for example,
// we're on I.E. 11 & evaluate:
//
// $ div.style.display = 'flex';
// $ div.style.display
// => ""
// $ div.style.display = '-ms-flex';
// $ div.style.display
// => '-ms-flex'
export const pickValue = memoized((property, value) => {
    if (value === undefined) return value;
    if (value === null) return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.length === 0) return value;

    const s = document.createElement('div').style;
    return [value, `-ms-${value}`, `-webkit-${value}`, `-moz-${value}`, `-o-${value}`].find(v => {
        s[property] = '';
        s[property] = v;
        let isImplemented = s[property] !== '';
        s[property] = '';
        return isImplemented;
    });
});

