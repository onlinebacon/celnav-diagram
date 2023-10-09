const valueMap = {};

const addToggleButton = (name, value) => {
	
};

export const get = (name) => {
	return valueMap[name];
};

export const create = (name, value) => {
	addToggleButton(name, value);
	valueMap[name] = value;
};

export const toggle = (name) => {
	const value = !valueMap[name];
	valueMap[name] = value;
	return value;
};
