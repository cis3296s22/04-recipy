const scrolling = (() => {
    let depth = 0;
    let setHidden = false;
    let originalOverflow = null;
    return {
        disable() {
            depth += 1;
            if (!setHidden) {
                originalOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";
                setHidden = true;
            }
        },
        enable() {
            depth = Math.max(0, depth - 1);
            if (depth <= 0 && setHidden) {
                document.body.style.overflow = originalOverflow;
                originalOverflow = null;
                setHidden = false;
            }
        }
    };
})();

export default scrolling;
