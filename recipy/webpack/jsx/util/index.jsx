import ReactDOM from 'react-dom';
import React from 'react';

export const compose = (...args) => {
    return (...cargs) => args.reverse().reduce((acc, x) => Array.isArray(acc) ? x(...acc) : x(acc), cargs);
};

export const promptFile = ({requireMime = undefined} = {}) => {
    return new Promise((resolve, reject) => {
        let i = document.createElement('input');
        i.setAttribute('type', 'file');
        if (requireMime !== undefined) {
            if (Array.isArray(requireMime)) {
                requireMime = requireMime.join(',');
            }
            i.setAttribute('accept', requireMime);
        }
        i.addEventListener('change', e => {
            let reader = new FileReader();
            reader.onload = function(evt) {
                if (evt.target.readyState !== 2) return;
                if (evt.target.error) {
                    reject(evt.target.error);
                    return;
                }
                resolve(evt.target.result);
            };

            reader.readAsText(e.target.files[0]);
        });
        i.click();
    });
};



export const getEventPath = e => {
    if (e.nativeEvent) return getEventPath(e.nativeEvent);
    return e.path || (e.composedPath && e.composedPath()); // eslint-disable-line no-extra-parens
};

export function getCookie(name) {
    if (document.cookie) {
        let parts = document.cookie.split(';')
                                   .map(x => x.trim().split('=', 2))
                                   .filter(x => x.length === 2)
                                   .find(x => x[0] === name);
        if (parts) return decodeURIComponent(parts[1]);
    }
    return null;
}

export function getCSRFToken() {
    return getCookie('csrftoken');
}

export function djangoFetch(resource, _init) {
    let hs = _init.headers ? _init.headers : {};
    hs['X-CSRFToken'] = getCSRFToken();
    return fetch(resource, {..._init, headers: hs});
};

export function djangoJSONFetch(_resource, _init) {
    let resource = _resource;
    let {headers, body, method="GET", ...init} = _init;

    const hasJSONBody = body && !([window.Blob && Blob.prototype,
             window.BufferSource && BufferSource.prototype,
             window.FormData && FormData.prototype,
             window.URLSearchParams && URLSearchParams.prototype,
             window.ReadableStream && ReadableStream.prototype].includes(body.__proto__)
            || typeof body === 'string') && typeof body === 'object';

    if (method === 'GET' || method === "HEAD") {
        // Allow GET and HEAD to pass URL args
        // like POST and friends pass JSON HTTP bodies
        if (hasJSONBody) {
            let as = new URLSearchParams();
            Object.entries(body).forEach(x => as.append(...x));
            if (!resource.endsWith('?')) resource += '?';
            resource += as.toString();
        }
        body = undefined;
    } else {
        if (!headers) headers = {};
        headers['Content-Type'] = 'application/json';
        // Allow an object to be passed as the body
        if (hasJSONBody) {
            body = JSON.stringify(body);
        }
    }

    return djangoFetch(resource, {...init, headers, body, method}).then(x => {
        let contentType = x.headers.get('content-type');
        if (x.status > 299) {
            throw new Error(`HTTP ${x.status}`);
        }

        if (contentType && contentType.includes('application/json')) {
            return x.json().then(json => ({httpStatus: x.status, json}));
        }
        throw new Error('Invalid response format.');
    });
};

