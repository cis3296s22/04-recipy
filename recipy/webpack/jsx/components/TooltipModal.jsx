import React, {useRef, forwardRef} from 'react';

const styles = {
    modal: {
        top: 0,
        left: 0,
        right: 0,
    },
    modalTooltipInner: {
        position: 'absolute',
        left: '50%',
        top: -15,
        wordBreak: 'break-word',
        whiteSpace: 'nowrap',
        transform: `translate(-50%, -100%)`,
    },
    modalArrow: c => ({
        position: 'absolute',
        top: -5,
        left: '50%',
        width: 0,
        height: 0,
        borderLeft: "10px solid transparent",
        borderRight: "10px solid transparent",
        borderTop: `10px solid ${c}`,
        transform: `translate(-50%, -100%)`,
    })
};

const TooltipModal = forwardRef(({arrowColor = 'black', children}, ref) => {
    return (
    <div ref={ref} className="TooltipModal" style={styles.modal}>
        <div style={styles.modalTooltipInner}>
            {children}
        </div>
        <div style={styles.modalArrow(arrowColor)} />
    </div>
    );
});

TooltipModal.displayName = 'TooltipModal';

export default TooltipModal;

