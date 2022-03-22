import {useDebugValue, useRef, useLayoutEffect} from 'react';
import listen from '../util/listen';

const useRefWithListeners = (listeners, memo = [], passive = false) => {
    const callables = Object.entries(listeners).map(([k, v]) => el => listen(el, k, v, {passive}));

    useDebugValue(listeners, ls => Object.keys(ls).join(', '));

    const ref = useRef();
    useLayoutEffect(() => {
        const el = ref.current;
        if (el) {
            const cancels = callables.map(c => c(el));
            return () => cancels.map(f => f());
        }
        return () => {};
    }, [Object.keys(listeners).join('__'), ...memo]);
    return ref;
};

export default useRefWithListeners;
