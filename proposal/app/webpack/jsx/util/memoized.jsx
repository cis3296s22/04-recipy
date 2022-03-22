import uniqueIdFor from './uniqueIdFor';

const memoized = f => {
    const memo = {};
    return function() {
        let args = [...arguments];
        let key = args.map(x => `${uniqueIdFor(x)}`).join('|');
        if (memo[key]) {
            return memo[key];
        }
        let v = f.apply(null, args);
        memo[key] = v;
        return v;
    };
};

export default memoized;
