import React, {useRef, useLayoutEffect, useMemo, useCallback} from 'react';
import combineRefs from '../util/combineRefs';
import listen from '../util/listen';

function detectLeftButton(evt) {
    evt = evt || window.event;
    if ("buttons" in evt) {
        return evt.buttons == 1;
    }
    let button = evt.which || evt.button;
    return button == 1;
}

window.__mouseups = [];
window.__mousemoves = [];
listen(window.document, 'mouseup', e => {
    for (const x of window.__mouseups) {
        x(e);
    }
}, {capture: true});

listen(window.document, 'mousemove', e => {
    for (const x of window.__mousemoves) {
        x(e);
    } 
}, {passive: true, capture: true});

function mouseDrag(n, move, up, down) {
    let __move = e => {
        console.log("MOVE");
        move(e);
    };

    let __up = e => {
        console.log("UP");
        let idx = window.__mousemoves.indexOf(__move);
        if (idx != -1) {
            window.__mousemoves.splice(idx, 1);
        }
        up(e);
    };

    let _down = listen(n, 'mousedown', e => {
        console.log("DOWN");
        if (detectLeftButton(e)) {
            window.__mousemoves.push(__move);
            window.__mouseups.push(__up);
            down(e);
        }
    });

    return () => {
        _down();
        let idx = window.__mousemoves.indexOf(__move);
        if (idx != -1) {
            window.__mousemoves.splice(idx, 1);
        }

        idx = window.__mouseups.indexOf(__up);
        if (idx != -1) {
            window.__mouseups.splice(idx, 1);
        }
    };
}

function isAncestor(child, anc) {
    let x = child;
    while (x && x != anc) x = x.parentNode;
    return x != null;
}

function getTimeMS() {
    return (new Date()).getTime();
}

const TIMEOUT = 200;

const MovableDiv = React.forwardRef(({onRelease,
                                      onClick,
                                      disableDrag,
                                      root, // the DOM node that drags are relative to
                                      moveElement, // the thing being moved.
                                      relativeToSelector='.MarzipanoView',
                                      ...props}, fref) => {
    const ref = useRef(moveElement);

    const reset = useCallback(() => {
        if (ref.current) {
            const n = ref.current;
            const {originalStyle} = n.__movableDiv;
            if (originalStyle) {
                n.style.position = originalStyle.position;
                n.style.top = originalStyle.top;
                n.style.left = originalStyle.left;
                n.style.transform = originalStyle.transform;
                console.log("\t---> Reset style attrs", originalStyle);
            }
            console.log("\t---> About to state");
            delete n.__movableDiv;
            n.__movableDiv = null;
            console.log("\t---> Reset state");
        } else {
            console.log("\t---> Would have reset state");
        }
    }, [ref.current]);

    const down = useCallback(() => {
        if (!ref.current) return;
        let n = ref.current;
        if (n.__movableDiv) {
            console.log("DOUBLE DOWN, this is a bug");
            return;
        }

        let offsetX = 0;
        let offsetY = 0;

        let relativeTo = root.querySelector(relativeToSelector);
        if (!isAncestor(n, relativeTo)) {
            let startPos = n.getBoundingClientRect();
            let precty = relativeTo.getBoundingClientRect();

            offsetX = startPos.left - precty.left - (startPos.width / 2);
            offsetY = startPos.top - precty.top - (startPos.height / 2);
        }

        let {width, height} = n.getBoundingClientRect();

        n.__movableDiv = {
            originalStyle: null,
            offsets: {
                x: offsetX,
                y: offsetY
            },
            dimensions: {
                width,
                height
            },
            relativeTo,
            prevTime: getTimeMS()
        };
        console.log("\t---> Configured", n, n.__movableDiv);
    }, [ref.current, root, relativeToSelector]);

    const move = useCallback(e => {
        if (!ref.current) {
           console.log("NO REF");
           return;
        }
        const n = ref.current;
        if (!n.__movableDiv) {
            console.log("NO STATE", n);
            return;
        }
        const {prevTime, originalStyle, dimensions, offsets, relativeTo} = n.__movableDiv;

        const shouldDrag = !disableDrag
                         && prevTime
                         && (originalStyle || ((getTimeMS() - prevTime) > TIMEOUT));
        if (shouldDrag) {
            if (!n.__movableDiv.originalStyle) {
                n.__movableDiv.originalStyle = {
                    position: n.style.position,
                    top: n.style.top,
                    left: n.style.left,
                    transform: n.style.transform
                };
                n.style.transform = '';
                n.style.position = 'absolute';
                console.log("\t---> Set new things & started moving.");
            }

            let {top: pTop, left: pLeft} = relativeTo.getBoundingClientRect();

            let top = e.clientY - (dimensions.height / 2) - pTop - offsets.y;
            let left = e.clientX - (dimensions.width / 2) - pLeft - offsets.x;

            console.log("\t---> Moving to", top, left);
            n.style.top = `${top}px`;
            n.style.left = `${left}px`;
        }
    }, [ref.current, disableDrag]);

    // called FOR EACH GUY when the mouse goes up.
    const up = useCallback(e => {
        if (!ref.current) return;
        const n = ref.current;
        if (!n.__movableDiv) return;
        const {prevTime, dimensions, relativeTo} = n.__movableDiv;

        const isClick = disableDrag || (prevTime && ((getTimeMS() - prevTime) <= TIMEOUT));
        if (isClick) {
            if (onClick) onClick();
        } else {
            let {top: pTop, left: pLeft,
                 bottom: pBottom, right: pRight} = relativeTo.getBoundingClientRect();

            let {width: nWidth, height: nHeight} = dimensions;

            let cx = e.clientX - (nWidth / 2);
            let cy = e.clientY - (nHeight / 2);

            if (cx > pLeft && cy > pTop &&
                cx < pRight && cy < pBottom) {
                let pos = {x: cx - pLeft, y: cy - pTop};
                onRelease(pos);
            }
        }
        reset();
    }, [ref.current, disableDrag, onClick, onRelease]);

    useLayoutEffect(() => {
        let n = ref.current;
        if (n) {
            return mouseDrag(n, move, up, down);
        }
        return () => {};
    }, [ref.current, move, up, down]);

    let r = ref;
    if (fref) r = combineRefs([r, fref]);
    if (moveElement) r = fref;
    return <div {...props} ref={r} />;
});

MovableDiv.displayName = "MovableDiv";

export default MovableDiv;
