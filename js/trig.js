const { PI, sqrt } = Math;
const TAU = PI*2;

let RAD, DEG, IRAD, IDEG;

const setRadianValue = (val) => {
	RAD = val;
	DEG = RAD/180*PI;
	IRAD = 1/RAD;
	IDEG = 180/(RAD*PI);
};

setRadianValue(1);

export const useRadians = () => setRadianValue(1);
export const useDegrees = () => setRadianValue(180/PI);
export const deg = (ang) => ang*DEG;
export const rad = (ang) => ang*RAD;
export const toDeg = (ang) => ang*IDEG;
export const toRad = (ang) => ang*IRAD;
export const sin = (ang) => Math.sin(ang*IRAD);
export const cos = (ang) => Math.cos(ang*IRAD);
export const tan = (ang) => Math.tan(ang*IRAD);
export const asin = (sin) => Math.asin(sin)*RAD;
export const acos = (cos) => Math.acos(cos)*RAD;
export const atan = (tan) => Math.atan(tan)*RAD;

export const sAng = (adj, opp) => {
	const len = sqrt(adj**2 + opp**2);
	if (len === 0) {
		return 0;
	}
	const abs = acos(adj/len);
	if (opp >= 0) {
		return abs;
	}
	return - abs;
};

export const uAng = (adj, opp) => {
	const len = sqrt(adj**2 + opp**2);
	if (len === 0) {
		return 0;
	}
	const abs = acos(adj/len);
	if (opp >= 0) {
		return abs;
	}
	return TAU*RAD - abs;
};
