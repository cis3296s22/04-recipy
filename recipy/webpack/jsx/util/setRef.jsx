
export default function setRef(ref, v) {
    if (!ref) return;

    if (typeof ref === 'function') {
        ref(v);
    } else {
        ref.current = v;
    }
}
