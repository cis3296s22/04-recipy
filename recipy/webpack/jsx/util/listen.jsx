/*
export default function listen() {
    const [target, ...args] = Array.from(arguments);
    target.addEventListener(...args);
    console.log('ADDING', target, ...args);
    return () => {
        console.log("REMOVING", target, ...args);
        target.removeEventListener(...args);
    }
}*/

export default function listen(target, type, listener, arg = undefined) {
    target.addEventListener(type, listener, arg)
    return () => target.removeEventListener(type, listener, arg);
}
