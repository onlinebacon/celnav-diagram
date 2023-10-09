const animations = [];

const remove = (animation) => {
    const index = animations.indexOf(animation);
    if (index !== -1) {
        animations.splice(index, 1);
    }
};

export const animate = (duration, step, callback) => {
    const start = Date.now();
    let animation;
    let interval = setInterval(() => {
        const dt = Date.now() - start;
        const t = Math.min(1, dt/duration);
        step(t);
        if (t === 1) {
            clearInterval(interval);
            remove(animation);
            callback?.();
        }
    }, 0);
    animation = { interval, step, callback };
    animations.push(animation);
};

export const finishAll = () => {
    while (animations.length !== 0) {
        const { interval, step, callback } = animations.splice(0, 1)[0];
        clearInterval(interval);
        step(1);
        callback?.();
    }
};
