import {useLayoutEffect} from 'react';
import {listen} from '../util';

const useListener = (domElement, event, callback, callbackMemo = [], opts = {}) => {
    return useLayoutEffect(() => listen(domElement, event, callback, opts),
                                        [domElement, event, opts && opts.capture, opts && opts.passive, ...callbackMemo]);
};

export default useListener;
