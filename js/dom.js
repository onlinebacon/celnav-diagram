export const create = (
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

export const text = (str) => {
	return document.createTextNode(str);
};

export const removeClass = (dom, name) => {
	const classes = dom.getAttribute('class')?.trim() ?? '';
	if (classes === '') {
		return false;
	}
	const arr = classes.split(/\s+/);
	const index = arr.indexOf(name);
	if (index === -1) {
		return false;
	}
	arr.splice(index, 1);
	dom.setAttribute('class', arr.join(' '));
	return true;
};

export const addClass = (dom, name) => {
	const classes = dom.getAttribute('class')?.trim() ?? '';
	const arr = (classes !== '') ? classes.split(/\s+/) : [];
	if (arr.includes(name)) {
		return false;
	}
	arr.push(name);
	dom.setAttribute('class', arr.join(' '));
	return true;
};

export const hasClass = (dom, name) => {
	const classes = dom.getAttribute('class')?.trim() ?? '';
	const arr = (classes !== '') ? classes.split(/\s+/) : [];
	return arr.includes(name);
};
