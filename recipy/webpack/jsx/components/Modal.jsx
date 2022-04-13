import React from 'react';
import ReactDOM from 'react-dom';
import combineRefs from '../util/combineRefs';
import scrolling from '../util/scrolling';
import useHotkeys from '../hooks/useHotkeys';
import useUnique from '../hooks/useUnique';
import X from './x';

const styles = {
    fullscreenDiv: {
        display: 'flex',
        background: "hsla(0, 0%, 0%, 0.6)",
        zIndex: 100000,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center"
    },
    contentWrapper: {
        pointerEvents: 'auto',
        position: "relative",
        display: "grid",
        width: "auto",
        height: "auto",
        zIndex: 100000,
        margin: 22
    },
    innerStyle: {
        gridColumn: 1,
        gridRow: 1,
        boxSizing: 'border-box',
        width: "100%",
        height: "100%",
        maxWidth: 700,
        maxHeight: "70vh",
        pointerEvents: 'auto',
        borderRadius: 6,
    },
    x: {
        width: 44,
        height: 44,
        background: "black",
        color: "white",
        top: -22,
        right: -22,
        position: 'absolute',
        borderRadius: 22,
        userSelect: 'none',
        cursor: 'pointer',
        pointerEvents: 'all',
        zIndex: 100000,
        boxSizing: 'border-box',
        padding: 5
    }
};

const Modal = React.forwardRef(({children, opener, onClose, showX}, fref) => {
    React.useLayoutEffect(() => {
        scrolling.disable();
        return scrolling.enable;
    }, []);

    const ref = useHotkeys({
        Escape: onClose
    }, []);

    const theDiv = React.useMemo(() => {
        return document.createElement('div');
    }, []);

    React.useLayoutEffect(() => {
        document.body.appendChild(theDiv);
        return () => document.body.removeChild(theDiv);
    }, [theDiv]);
    
    return ReactDOM.createPortal(
        <div className='modal__div'
             onClick={onClose}
             ref={combineRefs([ref, fref])}
             role='dialog'
             aria-modal='true'
             style={styles.fullscreenDiv}>
            <div role="none" style={styles.contentWrapper} onClick={e => e.stopPropagation()}>
                {onClose && showX && <X style={styles.x} onClick={onClose} />}
                <div role="none" className='modal-inner-content' style={styles.innerStyle}>
                    {children}
                </div>
            </div>
        </div>
    , theDiv);
});

Modal.displayName = 'Modal';

export default Modal;

