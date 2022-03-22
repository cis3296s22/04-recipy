import {useDebugValue, useState} from 'react';
import combineRefs from '../util/combineRefs';
import matchesSelector from '../util/matchesSelector';

import useRefWithListeners from './useRefWithListeners';

const useHover = (memo = []) => {
    const [hover, setHover] = useState(false);
    const [active, setActive] = useState(false);
    const ref = useRefWithListeners({
        mouseenter: e => { // eslint-disable-line no-unused-vars
            setHover(true);
        },
        mouseleave: e => { // eslint-disable-line no-unused-vars
            setHover(false);
            setActive(false);
        },
        mouseup: e => { // eslint-disable-line no-unused-vars
            setActive(false);
        },
        mousedown: e => { // eslint-disable-line no-unused-vars
            setActive(true);
        }
    }, memo);

    useDebugValue(`${hover ? 'hover' : 'not hover'}, ${active ? 'active' : 'not active'}`);
    return [{hover, active}, combineRefs([r => {
        // When the ref changes, we need to get the initial
        // hover/active state of the newly ref'd node.
        if (r) {
            setHover(matchesSelector(r, r.nodeName.toLowerCase() + ":hover"));
            setActive(matchesSelector(r, r.nodeName.toLowerCase() + ":active"));
        } else {
            // clear out values for the old DOM node.
            setHover(false);
            setActive(false);
        }
    }, ref])];
};

export default useHover;
