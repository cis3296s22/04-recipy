import {useRef, useLayoutEffect, useState, useEffect} from 'react';

const usePromise = (promiseFactory, memo = []) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(undefined);
    const [result, setResult] = useState(undefined);

    // Ensure we don't call any setter
    // if the component has been unmounted
    const unmounted = useRef(false);
    useEffect(() => {
        unmounted.current = false;
        return () => {
            unmounted.current = true;
        };
    }, memo);

    const load = () => {
        if (!loading) setLoading(true);
        promiseFactory().then(d => {
            if (!unmounted.current) {
                setResult(d);
                setError(null);
                setLoading(false);
            }
        }).catch(e => {
            if (!unmounted.current) {
                setResult(undefined);
                setError(e);
                setLoading(false);
            }
        });
    };

    useEffect(load, memo);

    return {loading, error, result, reload: load};
};

export default usePromise;
