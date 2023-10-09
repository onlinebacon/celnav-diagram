import * as DOM from './dom.js';

const tabs = [];

export const add = (label, selector, selected = false) => {
	const dom = document.querySelector(selector);
	const button = DOM.create('button', [ DOM.text(label) ]);
	const tab = { button, dom, selected };
	document.querySelector('.tabs').appendChild(button);
	if (selected) {
		DOM.addClass(button, 'selected');
		DOM.removeClass(dom, 'hidden');
	} else {
		DOM.addClass(dom, 'hidden');
	}
	tabs.push(tab);
	button.addEventListener('click', () => {
		if (tab.selected) {
			tab.selected = false;
			DOM.removeClass(button, 'selected');
			DOM.addClass(dom, 'hidden');
		} else {
			const item = tabs.find(item => item.selected);
			if (item) {
				item.selected = false;
				DOM.removeClass(item.button, 'selected');
				DOM.addClass(item.dom, 'hidden');
			}
			tab.selected = true;
			DOM.addClass(button, 'selected');
			DOM.removeClass(dom, 'hidden');
		}
	});
};
