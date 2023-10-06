export const linear = (t) => {
	return t;
};

export const smooth = (t) => {
	return (1 - Math.cos(t*Math.PI))/2;
};

export const exp = (t, c = 10) => {
	return (2**(t*c) - 1)/(2**c - 1);
};
