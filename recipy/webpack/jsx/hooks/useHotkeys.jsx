import combineRefs from '../util/combineRefs';
import useRefWithListeners from './useRefWithListeners';

const useHotkeys = (keys, memo=[]) => {
    let ast = {};
    for (const [shortcut, action] of Object.entries(keys)) {
        const all = Array.isArray(shortcut) ? shortcut : shortcut.trim().split('-').map(s => s.trim()).map(s => s === 'Space' ? ' ' : s);
        const key = all[all.length - 1].toUpperCase();
        const modifiers = all.slice(0, all.length - 1);

        ast[key] = ast[key] || [];
        ast[key].push({modifiers, action});
    }

    const ref = useRefWithListeners({
        click: e => e.target.focus(),
        keydown: (...args) => {
            const [e] = args;
            if (e.isComposing) return;
            const hit = ast[e.key.toUpperCase()];
            if (!hit) return;
            for (const {modifiers, action} of hit) {
                if (modifiers.includes('Shift') && !e.shiftKey) continue;
                if (modifiers.includes('Alt') && !e.altKey) continue;
                if (modifiers.includes('Ctrl') && !e.ctrltKey) continue;
                if (modifiers.includes('Meta') && !e.metaKey) continue;
                action(...args);
            }
        }
    }, memo);

    // Ensure screen readers can focus the
    // DOM node with the shortcuts
    const ensureTabindex = r => {
        if (r && !r.getAttribute('tabindex')) r.setAttribute('tabindex', '0');
    };

    return combineRefs([ensureTabindex, ref]);
};

export default useHotkeys;
