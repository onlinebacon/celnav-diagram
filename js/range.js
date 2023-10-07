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

const create = (
	tagname = 'div',
	...args
) => {
	const dom = document.createElement(tagname);
	for (const arg of args) {
		if (typeof arg === 'string') {
			dom.setAttribute('class', arg);
		} else if (arg instanceof Array) {
			for (const item of arg) {
				dom.appendChild(item);
			}
		} else if (arg instanceof Object) {
			for (const key in arg) {
				dom.setAttribute(key, arg[key]);
			}
		}
	}
	return dom;
};

const text = (str) => {
	return document.createTextNode(str);
};

export const build = ({
	label = 'Label',
	min = 0.0,
	val = 0.5,
	max = 1.0,
	ease = linear,
	round = x => Number(x.toFixed(2)),
	format = x => x.toString(),
	parse = s => Number(s),
	onchange = () => {},
}) => {
	const inputText = create('input', { type: 'text' });
	const inputRange = create('input', {
		type: 'range',
		min: 0,
		max: 1,
		step: 0.001,
	});
	const root = create('div', 'var-range', [
		create('div', 'label', [ text(label + ': ') ]),
		inputText,
		inputRange,
	]);
	const getValueFromRange = () => {
		const normal = Number(inputRange.value);
		const value = round(ease.fromNormal(normal, min, max));
		return value;
	};
	const getValueFromText = () => {
		return parse(inputText.value);
	};
	const setTextValue = (value) => {
		inputText.value = format(value);
	};
	const setRangeValue = (value) => {
		inputRange.value = ease.toNormal(value, min, max);
	};
	inputRange.addEventListener('input', () => {
		const value = getValueFromRange();
		setTextValue(value);
		onchange(value);
	});
	inputText.addEventListener('change', () => {
		const value = getValueFromText();
		if (isNaN(value)) {
			return;
		}
		setTextValue(value);
		setRangeValue(value);
		onchange(value);
	});
	setTextValue(val);
	setRangeValue(val);
	document.querySelector('.var-box').appendChild(root);
};
