export default function matchesSelector(element, selector) {
    const fn = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector;
    return fn.call(element, selector);
};
