import * as DOM from './dom.js';

const valueMap = {};

const addToggleButton = (label, name, value) => {
	const button = DOM.create('button', [ DOM.text(label) ]);
	if (value) {
		DOM.addClass(button, 'on');
	}
	document.querySelector('.toggles').appendChild(button);
	button.addEventListener('click', () => {
		valueMap[name] = !valueMap[name];
		if (valueMap[name]) {
			DOM.addClass(button, 'on');
		} else {
			DOM.removeClass(button, 'on');
		}
	});
};

export const get = (name) => {
	return valueMap[name];
};

export const create = (label, name, value) => {
	addToggleButton(label, name, value);
	valueMap[name] = value;
};
