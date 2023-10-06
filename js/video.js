const events = [];
const elements = [];
const animations = [];

let beforeFrame = () => {};
let animReq = null;
let speed = 1;
let lastUnixtime = Date.now();
let lastTimestamp = 0;
let eventIndex = 0;
let timePointer = 0;
let paused = false;

const resetTime = () => {
	lastUnixtime = Date.now();
	lastTimestamp = 0;
};

export const pause = () => {
	paused = true;
};

export const unpause = () => {
	paused = false;
	lastUnixtime = Date.now();
};

const now = () => {
	if (paused) {
		return lastTimestamp;
	}
	const unixtime = Date.now();
	const timestamp = lastTimestamp + (unixtime - lastUnixtime)*speed;
	lastTimestamp = timestamp;
	lastUnixtime = unixtime;
	return timestamp;
};

const arrayRemove = (array, item) => {
	const index = array.indexOf(item);
	if (item !== -1) {
		array.splice(index, 1);
	}
};

const runNextEvent = (timestamp = now()) => {
	if (eventIndex >= events.length) {
		return;
	}
	const next = events[eventIndex];
	if (timestamp < next.timestamp) {
		return;
	}
	next.fn();
	++ eventIndex;
	lastTimestamp = next.timestamp;
};

const flushEvents = () => {
	while (eventIndex < events.length && events[eventIndex].timestamp < lastTimestamp) {
		events[eventIndex].fn();
		++ eventIndex;
	}
};

const iterateAnimations = () => {
	const timestamp = now();
	for (const { step, arg } of animations) {
		step(timestamp, arg);
	}
};

class RElement {
	constructor(fn) {
		this.fn = fn;
	}
	get index() {
		return elements.indexOf(this);
	}
	remove() {
		remove(this);
		return this;
	}
}

const frameOnce = () => {
	runNextEvent();
	iterateAnimations();
	beforeFrame();
	for (const e of elements) {
		e.fn();
	}
};

const frameLoop = () => {
	frameOnce();
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
	const index = elements.indexOf(obj);
	if (index !== -1) {
		elements.splice(index, 1);
	}
};

export const start = () => {
	eventIndex = 0;
	events.sort((a, b) => a.timestamp - b.timestamp);
	resetTime();
	if (animReq === null) {
		frameLoop();
	}
};

export const stop = () => {
	if (animReq !== null) {
		cancelAnimationFrame(animReq);
	}
};

export const add = (elem) => {
	if (!elements.includes(elem)) {
		elements.push(elem);
	}
};

export const setSpeed = (val) => {
	speed = val;
};

export const moveUp = (elem) => {
	remove(elem);
	elements.push(elem);
};

export const moveBelow = (elem, ...targets) => {
	remove(elem);
	const index = targets.map(t => elements.indexOf(t)).reduce((a, b) => Math.min(a, b));
	elements.splice(index, 0, elem);
};

export const writeAnimation = (duration, fn, init) => {
	const start = timePointer;
	const end = start + duration;
	const step = (timestamp, arg) => {
		const t = Math.min(1, (timestamp - start)/duration);
		fn(t, arg);
	};
	const animation = { step, arg: undefined };
	events.push({
		timestamp: start,
		fn: () => {
			if (init != null) {
				animation.arg = init();
			}
			animations.push(animation);
			step(start, animation.arg);
		},
	});
	events.push({
		timestamp: end,
		fn: () => {
			step(end, animation.arg),
			arrayRemove(animations, animation);
		},
	});
	timePointer += duration;
	return { start, end };
};

export const writeDelay = (duration) => {
	const start = timePointer;
	const end = start + duration;
	timePointer = end;
	return { start, end };
};

export const write = (fn) => {
	const start = timePointer;
	const end = start;
	events.push({ timestamp: timePointer, fn });
	return { start, end };
};

export const movePointer = (offset) => {
	timePointer += offset;
};

export const moveForwardTo = (timestamp) => {
	lastTimestamp = timestamp;
	flushEvents();
	frameOnce();
};

export const currentTime = () => {
	return now();
};

export const endTime = () => {
	return events.map(e => e.timestamp).reduce((a, b) => Math.max(a, b));
};
