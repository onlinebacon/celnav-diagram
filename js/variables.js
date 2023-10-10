import * as DOM from './dom.js';

export const VALS = {};
const VIEW = {};
const MAP = {};

export const linear = {
	fromNormal: (normal, min, max) => {
		return min + normal*(max - min);
	},
	toNormal: (value, min, max) => {
		return (value - min)/(max - min);
	},
};

export const quadratic = {
	fromNormal: (normal, min, max) => {
		return linear.fromNormal(normal**2, min, max);
	},
	toNormal: (value, min, max) => {
		return linear.toNormal(value, min, max)**0.5;
	},
};

export const exp10 = {
	fromNormal: (normal, min, max) => {
		const a = Math.log10(min);
		const b = Math.log10(max);
		const exp = a + normal*(b - a);
		return 10**exp;
	},
	toNormal: (value, min, max) => {
		const a = Math.log10(min);
		const b = Math.log10(max);
		const exp = Math.log10(value);
		return (exp - a)/(b - a);
	},
};

let currentVarConfig = {
	name: '',
	min: 0,
	max: 1,
	ease: linear,
	round: (value) => Number(value.toFixed(2)),
	format: (value) => value.toString(),
	parse: (s) => Number(s),
	map: (value) => value,
};

const range = document.querySelector('.range');
const divLabel = range.querySelector('.label');
const inputText = range.querySelector('input[type="text"]');
const inputRange = range.querySelector('input[type="range"]');

const setNormal = (config, normal, round = true) => {
	const { name, min, max, ease, map } = config;
	const rawVal = ease.fromNormal(normal, min, max);
	const value = round ? config.round(rawVal) : rawVal;
	VIEW[name] = value;
	VALS[name] = map(value);
	return value;
};

inputRange.addEventListener('input', () => {
	const value = setNormal(currentVarConfig, Number(inputRange.value));
	inputText.value = currentVarConfig.format(value);
});

inputText.addEventListener('change', () => {
	const { name, min, max, ease, parse, map } = currentVarConfig;
	const value = parse(inputText.value);
	if (isNaN(value)) {
		return;
	}
	VIEW[name] = value;
	VALS[name] = map(value);
	const normal = ease.toNormal(value, min, max);
	inputRange.value = normal;
});

export const add = ({
	label,
	name,
	init,
	min,
	max,
	ease = linear,
	round = (value) => Number(value.toFixed(2)),
	format = (value) => value.toString(),
	parse = (s) => Number(s),
	map = (value) => value,
}) => {
	const config = { label, name, init, min, max, ease, round, format, parse, map };
	const button = DOM.create('button', [ DOM.text(label) ]);
	document.querySelector('.variables').appendChild(button);
	VIEW[name] = init;
	VALS[name] = map(init);
	button.addEventListener('click', () => {
		if (DOM.hasClass(button, 'selected')) {
			DOM.removeClass(button, 'selected');
			range.style.display = 'none';
			return;
		}
		const selected = document.querySelector('.variables .selected');
		if (selected) {
			DOM.removeClass(selected, 'selected');
		}
		DOM.addClass(button, 'selected');
		range.style.display = 'block';
		divLabel.innerText = label + ': ';
		const value = VIEW[name];
		inputText.value = format(value);
		inputRange.value = ease.toNormal(value, min, max);
		currentVarConfig = config;
	});
	MAP[name] = config;
};

export const slide = (name, offset) => {
	const config = MAP[name];
	const { min, max, ease } = config;
	const normal = ease.toNormal(VIEW[name], min, max) + offset;
	const value = setNormal(config, normal);
	if (config === currentVarConfig) {
		inputRange.value = normal;
		inputText.value = config.format(value);
	}
};

export const set = (name, value, round) => {
	const config = MAP[name];
	const { min, max, ease } = config;
	const normal = ease.toNormal(value, min, max);
	value = setNormal(config, normal, round);
	if (config === currentVarConfig) {
		inputText.value = config.format(value);
		inputRange.value = normal;
	}
};
