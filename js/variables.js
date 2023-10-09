import * as DOM from './dom.js';

export const VARS = {};
const VIEW = {};

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

let currentVar = {
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

inputRange.addEventListener('input', () => {
	const { name, min, max, ease, round, format, map } = currentVar;
	const normal = Number(inputRange.value);
	const value = round(ease.fromNormal(normal, min, max));
	VIEW[name] = value;
	VARS[name] = map(value);
	inputText.value = format(value);
});

inputText.addEventListener('change', () => {
	const { name, min, max, ease, parse, map } = currentVar;
	const value = parse(inputText.value);
	if (isNaN(value)) {
		return;
	}
	VIEW[name] = value;
	VARS[name] = map(value);
	const normal = ease.toNormal(value, min, max);
	inputRange.value = normal;
});

// export const add = ({
// 	label = 'Label',
// 	min = 0.0,
// 	val = 0.5,
// 	max = 1.0,
// 	ease = linear,
// 	round = x => Number(x.toFixed(2)),
// 	format = x => x.toString(),
// 	parse = s => Number(s),
// 	onchange = () => {},
// }) => {
// 	const def = window.localStorage.getItem(label);
// 	if (def) {
// 		val = Number(def);
// 	}
// 	const inputText = DOM.create('input', { type: 'text' });
// 	const inputRange = DOM.create('input', {
// 		type: 'range',
// 		min: 0,
// 		max: 1,
// 		step: 0.001,
// 	});
// 	const root = DOM.create('div', 'var-range', [
// 		DOM.create('div', 'label', [ DOM.text(label + ': ') ]),
// 		inputText,
// 		inputRange,
// 	]);
// 	const getValueFromRange = () => {
// 		const normal = Number(inputRange.value);
// 		const value = round(ease.fromNormal(normal, min, max));
// 		return value;
// 	};
// 	const getValueFromText = () => {
// 		return parse(inputText.value);
// 	};
// 	const setTextValue = (value) => {
// 		inputText.value = format(value);
// 	};
// 	const setRangeValue = (value) => {
// 		inputRange.value = ease.toNormal(value, min, max);
// 	};
// 	const setStorageValue = (value) => {
// 		window.localStorage.setItem(label, value);
// 	};
// 	inputRange.addEventListener('input', () => {
// 		const value = getValueFromRange();
// 		setTextValue(value);
// 		setStorageValue(value);
// 		onchange(value);
// 	});
// 	inputText.addEventListener('change', () => {
// 		const value = getValueFromText();
// 		if (isNaN(value)) {
// 			return;
// 		}
// 		setTextValue(value);
// 		setRangeValue(value);
// 		setStorageValue(value);
// 		onchange(value);
// 	});
// 	setTextValue(val);
// 	setRangeValue(val);
// 	if (val != null) {
// 		onchange(val);
// 	}
// 	document.querySelector('.variables').appendChild(root);
// };

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
	unmap = (value) => value,
}) => {
	const button = DOM.create('button', [ DOM.text(label) ]);
	document.querySelector('.variables').appendChild(button);
	VIEW[name] = init;
	VARS[name] = map(init);
	button.addEventListener('click', () => {
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
		currentVar = { name, min, max, ease, round, format, parse, map };
	});
};
