import {useRef} from 'react';

const usePersistent = fn => {
    const ref = useRef(undefined);
    if (ref.current === undefined) {
        ref.current = fn();
    }
    return ref.current;
};

export default usePersistent;
