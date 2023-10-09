import * as DOM from './dom.js';

const tabs = [];

export const add = ({ label, selected = false, onselect, onunselect }) => {
	const button = DOM.create('button', [ DOM.text(label) ]);
	const tab = { button, selected, onselect, onunselect };
	document.querySelector('.tabs').appendChild(button);
	tabs.push(tab);
	if (tab.selected) {
		onselect?.();
	}
	button.addEventListener('click', () => {
		if (tab.selected) {
			tab.selected = false;
			DOM.removeClass(button, 'selected');
			onunselect?.();
		} else {
			const item = tabs.find(item => item.selected);
			if (item) {
				item.selected = false;
				DOM.removeClass(item.button, 'selected');
				item.onunselect?.();
			}
			tab.selected = true;
			DOM.addClass(button, 'selected');
			onselect?.();
		}
	});
};
