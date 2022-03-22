import setRef from './setRef';

export default function combineRefs(refs) {
    return {
        '_current': null,
        set current(r) {
            this._current = r;
            for (const ref of refs) setRef(ref, r);
        },
        get current() {
            return this._current;
        }
    };
}
