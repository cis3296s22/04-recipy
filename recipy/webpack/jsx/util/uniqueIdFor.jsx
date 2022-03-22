const uniqueIdFor = (() => {
    let currentId = 0;
    const map = new Map();

    return object => {
        if (!map.has(object)) {
            map.set(object, ++currentId);
        }

        return map.get(object);
    };
})();

export default uniqueIdFor;

