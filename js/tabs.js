import * as DOM from './dom.js';

const tabs = [];

export const add = (label, selector, selected = false) => {
	const dom = document.querySelector(selector);
	const button = DOM.create('button', [ DOM.text(label) ]);
	const tab = { button, dom, selected };
	document.querySelector('.tabs').appendChild(button);
	if (selected) {
		DOM.addClass(button, 'selected');
		dom.style.display = 'block';
	} else {
		dom.style.display = 'none';
	}
	tabs.push(tab);
	button.addEventListener('click', () => {
		if (tab.selected) {
			tab.selected = false;
			DOM.removeClass(button, 'selected');
			dom.style.display = 'none';
		} else {
			const item = tabs.find(item => item.selected);
			if (item) {
				item.selected = false;
				DOM.removeClass(item.button, 'selected');
				item.dom.style.display = 'none';
			}
			tab.selected = true;
			DOM.addClass(button, 'selected');
			dom.style.display = 'block';
		}
	});
};
