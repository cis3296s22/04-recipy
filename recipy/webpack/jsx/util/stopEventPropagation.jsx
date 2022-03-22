
export default function stopEventPropagation(element, list, predicate=null, opts={}) {
    let argsLists = list.map(ev => [ev, e => {
        if (predicate && !predicate(e)) return;
        e.stopPropagation();
    }, opts]);
    for (let args of argsLists) {
        element.addEventListener(...args);
    }
    return () => {
        for (let args of argsLists) {
            element.removeEventListener(...args);
        }
    }
}
