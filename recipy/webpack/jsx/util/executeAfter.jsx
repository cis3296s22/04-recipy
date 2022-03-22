
// A wrapper around setTimeout that returns a fn
// that stops the timeout. Useful for things like useEffect().
export const executeAfter = (fn, timeout) => {
    const t = setTimeout(fn, timeout);
    return () => clearTimeout(t);
};
