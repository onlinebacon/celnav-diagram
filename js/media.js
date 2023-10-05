let beforeFrame = () => {};
let animReq = null;

const array = [];

let animArr = [];
let speed = 1;

let lastTimestamp = Date.now();
let lastNowVal = 0;
const now = () => {
	const timestamp = Date.now();
	const dt = timestamp - lastTimestamp;
	const res = lastNowVal + dt*speed;
	lastNowVal = res;
	lastTimestamp = timestamp;
	return res;
};

class RElement {
	constructor(fn) {
		this.fn = fn;
	}
	get index() {
		return array.indexOf(this);
	}
	remove() {
		remove(this);
		return this;
	}
}

const iterateAnimations = () => {
	const t = now();
	animArr = animArr.filter(fn => fn(t));
};

const frameLoop = () => {
	beforeFrame();
	iterateAnimations();
	for (const e of array) {
		e.fn();
	}
	animReq = requestAnimationFrame(frameLoop);
};

export const setBeforeFrame = (fn) => {
	beforeFrame = fn;
};

export const create = (fn) => {
	const e = new RElement(fn);
	return e;
};

export const remove = (obj) => {
	const index = array.indexOf(obj);
	if (index !== -1) {
		array.splice(index, 1);
	}
};

export const start = () => {
	if (animReq === null) {
		frameLoop();
	}
};

export const stop = () => {
	if (animReq !== null) {
		cancelAnimationFrame(animReq);
	}
};

export const animate = (duration, fn) => new Promise((done) => {
	if (typeof duration === 'function' && fn === undefined) {
		fn = duration;
		duration = 1000;
	}
	const t0 = now();
	const anim = (t1) => {
		const dt = Math.min(1, (t1 - t0)/duration);
		fn(dt);
		if (dt < 1) {
			return true;
		}
		done();
		return false;
	};
	animArr.push(anim);
});

export const delay = (duration) => new Promise((done) => {
	const t0 = now();
	animArr.push((t1) => {
		const dt = t1 - t0;
		if (dt < duration) {
			return true;
		}
		done();
		return false;
	});
});

export const add = (elem) => {
	if (!array.includes(elem)) {
		array.push(elem);
	}
};

export const setSpeed = (val) => {
	speed = val;
};

export const moveUp = (elem) => {
	remove(elem);
	array.push(elem);
};
