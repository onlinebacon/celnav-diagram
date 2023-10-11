import DrawingContext from './drawing.js';
import * as Trig from './trig.js';
import * as Toggles from './toggles.js';
import { vec2 } from './vec2.js';
import * as Vars from './variables.js';
import * as Actions from './actions.js';
import * as Animation from './animation.js';
import * as Miles from './miles.js';
import { smooth } from './ease.js';

const { VALS } = Vars;

let ctx = true ? null : new DrawingContext(null);

const COLOR = {
	earth: 'rgb(0, 127, 255)',
	earthInterior: 'rgba(0, 127, 255, 0.15)',
	spot: 'rgb(255, 255, 255)',
	star: 'rgb(255, 192, 64)',
	starSight: 'rgba(255, 127, 0, 0.4)',
	down: '#0f7',
	up: '#70f',
	horizon: '#666',
	z1: '#fc5',
	z2: '#05c',
	angle: '#fff',
	horizontal: 'rgba(0, 255, 255, 0.5)',
	radius: 'rgba(255, 255, 255, 0.5)',
};

const earthRadiusMiles = 3958.76;
const starRadius = 10;
const lineExcess = 80;
const horizontalLen = 500;
const d360 = Trig.deg(360);

// Calculated vars
let obsDir = 0;
let starDir = 0;
let obsHeight = 0;
let earthRadius = 0;
let starHeight = 0;
let dip = 0;
let hrzMirDir = 0;
let idxMirDir = 0;
let obsVecPos = vec2();
let starVecPos = vec2();
let obsVecDir = vec2();
let obsGPVecPos = vec2();
let starGPVecPos = vec2();
let hrzVecDir = vec2();
let hrzVecPos = vec2();

const CENTER_VEC   = 0x0;
const CENTER_OBS   = 0x1;
const CENTER_EARTH = 0x2;
const CENTER_STAR  = 0x3;
const CENTER_HRZ   = 0x4;

let centerVec = vec2(0, 0);
let center = CENTER_EARTH;

const SIGHT_VAR        = 'SIGHT_VAR';
const SIGHT_STAR       = 'SIGHT_STAR';
const SIGHT_ZENITH     = 'SIGHT_ZENITH';
const SIGHT_HORIZON    = 'SIGHT_HORIZON';
const SIGHT_HORIZONTAL = 'SIGHT_HORIZONTAL';

let idxMirDirType = SIGHT_VAR;
let hrzMirDirType = SIGHT_VAR;

const getCenter = () => {
	switch (center) {
		case CENTER_VEC: return centerVec;
		case CENTER_OBS: return obsVecPos;
		case CENTER_EARTH: return vec2(0, 0);
		case CENTER_STAR: return starVecPos;
		case CENTER_HRZ: return hrzVecPos;
	}
};

const getMirDir = (dirType, def) => {
	switch (dirType) {
		case SIGHT_STAR: return calcDir(starVecPos);
		case SIGHT_ZENITH: return 0;
		case SIGHT_HORIZONTAL: return Trig.deg(90);
		case SIGHT_HORIZON: return Trig.deg(90) + dip;
	}
	return def;
};

const recalculateVars = () => {
	const angleOffset = VALS.cam_rot;
	obsDir = VALS.obs_dir + angleOffset;
	starDir = VALS.star_dir + angleOffset;
	earthRadius = earthRadiusMiles*VALS.scale;
	starHeight = VALS.star_height*VALS.scale;
	obsHeight = VALS.obs_height*VALS.scale;
	const starVecDir = vec2(0, 1).rot(starDir);
	obsVecDir = vec2(0, 1).rot(obsDir);
	obsVecPos = obsVecDir.scale(earthRadius + obsHeight);
	starVecPos = starVecDir.scale(earthRadius + starHeight);
	obsGPVecPos = obsVecDir.scale(earthRadius);
	starGPVecPos = starVecDir.scale(earthRadius);
	const hip = earthRadius + obsHeight;
	const adj = earthRadius;
	dip = Trig.acos(adj/hip);
	hrzVecDir = vec2(1, 0).rot(obsDir + dip);
	const hrzDist = (hip**2 - adj**2)**0.5;
	hrzVecPos = obsVecPos.plus(hrzVecDir.scale(hrzDist));
	hrzMirDir = getMirDir(hrzMirDirType, VALS.sxt_hrz_dir);
	idxMirDir = getMirDir(idxMirDirType, VALS.sxt_idx_dir);
};
const drawLineWithExcess = (a, b, color) => {
	const excess = b.minus(a).normalized().scale(lineExcess);
	a = a.minus(excess);
	b = b.plus(excess);
	ctx.line(a, b, color);
};
const drawEarth = () => {
	ctx.circle([ 0, 0 ], earthRadius, COLOR.earth, COLOR.earthInterior);
};
const drawEarthCenter = () => {
	ctx.spot([ 0, 0 ], COLOR.spot);
};
const drawObserver = () => ctx.spot(obsVecPos, COLOR.spot);
const drawStar = () => ctx.star(starVecPos, starRadius, COLOR.star);
const drawObsStarSight = () => {
	drawLineWithExcess(obsVecPos, starVecPos, COLOR.starSight);
};
const drawDown = () => {
	const a = obsVecPos;
	const b = obsVecPos.minus(obsVecDir.scale(earthRadius + obsHeight - 5));
	ctx.arrow(a, b, COLOR.down);
};
const drawUp = () => {
	const a = obsVecPos;
	const b = obsVecPos.plus(obsVecDir.scale(VALS.arrow_len));
	ctx.arrow(a, b, COLOR.up);
};
const drawHorizon = () => {
	ctx.spot(hrzVecPos, COLOR.spot);
};
const drawHorizonLine = () => {
	const a = obsVecPos.minus(hrzVecDir.scale(lineExcess));
	const b = hrzVecPos.plus(hrzVecDir.scale(lineExcess));
	ctx.line(a, b, COLOR.horizon);
};
const drawHorizonRadius = () => {
	const a = vec2(0, 0)
	const b = hrzVecPos;
	drawLineWithExcess(a, b, COLOR.horizon);
};
const drawEarthCenterStarLine = () => drawLineWithExcess(
	vec2(0, 0),
	starVecPos,
	COLOR.starSight,
);
const drawSextant = () => {
	const z1Dir = obsDir + idxMirDir;
	const z2Dir = obsDir + hrzMirDir;
	const z1VecDir = vec2(0, 1).rot(z1Dir);
	const z2VecDir = vec2(0, 1).rot(z2Dir);
	ctx.arrow(obsVecPos, obsVecPos.plus(z1VecDir.scale(VALS.arrow_len)), COLOR.z1);
	ctx.arrow(obsVecPos, obsVecPos.plus(z2VecDir.scale(VALS.arrow_len)), COLOR.z2);
	let angA = obsDir + idxMirDir;
	let angB = obsDir + hrzMirDir;
	if (idxMirDir > hrzMirDir) {
		[ angA, angB ] = [ angB, angA ];
	}
	const reading = Number(Trig.toDeg(hrzMirDir - idxMirDir).toFixed(2)) + '°';
	ctx.arc(obsVecPos, VALS.arrow_len/2, angA, angB, COLOR.angle);
	const textVecPos = obsVecPos.plus(vec2(0, 1).rot((angA + angB)/2).scale(VALS.arrow_len/2 + 3));
	ctx.fontSize(17);
	ctx.textAlign('left').textBaseline('middle');
	ctx.textDirOut(reading, textVecPos, (angA + angB)/2, 5, COLOR.angle);
};
const drawObserverGP = () => {
	ctx.spot(obsGPVecPos, COLOR.spot);
};
const drawStarGP = () => {
	ctx.spot(starGPVecPos, COLOR.spot);
};
const drawGPtoGPArc = () => {
	let dif = (starDir - obsDir + d360)%d360;
	ctx.arc(vec2(0, 0), earthRadius, obsDir, obsDir + dif, COLOR.angle);
};
const drawGPDistance = () => {
	let dif = (starDir - obsDir + d360)%d360;
	let dist = Trig.toRad(dif)*earthRadiusMiles;
	let text = Miles.stringify(dist, 4);
	const dir = obsDir + dif/2;
	ctx.fontSize(17).textAlign('right').textBaseline('middle');
	ctx.textDirOut(text, vec2(0, 0), dir, earthRadius + 5, COLOR.angle);
};
const drawHorizontal = () => {
	const dif = vec2(horizontalLen/2, 0).rot(obsDir);
	const a = obsVecPos.plus(dif);
	const b = obsVecPos.minus(dif);
	ctx.line(a, b, COLOR.horizontal);
};
const drawRadius = () => {
	const a = vec2(0, 0);
	const b = vec2(0, earthRadius).rot(obsDir);
	const m = a.interpolate(b, 0.5);
	ctx.line(a, b, COLOR.radius);
	ctx.fontSize(15);
	ctx.textDirOut(Miles.stringify(earthRadiusMiles, 6), m, obsDir - Trig.deg(90), 5, COLOR.radius);
};
const drawObsHeight = () => {
	const a = vec2(0, earthRadius).rot(obsDir);
	const b = obsVecPos;
	const m = a.interpolate(b, 0.5);
	const len = VALS.obs_height;
	ctx.line(a, b, COLOR.radius);
	ctx.fontSize(15);
	ctx.textDirOut(Miles.stringify(len, 6), m, obsDir - Trig.deg(90), 5, COLOR.radius);
};

const render = () => {
	ctx.clear();
	recalculateVars();
	ctx.setCenter(...getCenter());
	drawEarth();
	if (Toggles.get('radius')) drawRadius();
	if (Toggles.get('obs_height')) drawObsHeight();
	if (Toggles.get('star_gp_sight')) drawEarthCenterStarLine();
	if (Toggles.get('hrz_rad')) drawHorizonRadius();
	if (Toggles.get('hrz')) drawHorizonLine();
	if (Toggles.get('down')) drawDown();
	if (Toggles.get('up')) drawUp();
	if (Toggles.get('horizontal')) drawHorizontal();
	if (Toggles.get('star_sight')) drawObsStarSight();
	if (Toggles.get('arc')) drawGPtoGPArc();
	if (Toggles.get('gp_dist')) drawGPDistance();
	if (Toggles.get('sextant')) drawSextant();
	if (Toggles.get('star')) drawStar();
	if (Toggles.get('observer')) drawObserver();
	if (Toggles.get('hrz')) drawHorizon();
	drawEarthCenter();
	if (Toggles.get('gp')) drawObserverGP();
	if (Toggles.get('star_gp')) drawStarGP();
};

const frameLoop = () => {
	render();
	requestAnimationFrame(frameLoop);
};

export const init = (drawingContext) => {
	ctx = drawingContext;
	frameLoop();
};

Vars.add({
	label: 'Scale',
	name: 'scale',
	min: 0.0001,
	max: 150,
	init: Number((300/earthRadiusMiles).toPrecision(3)),
	ease: Vars.exp10,
	round: (val) => Number(val.toPrecision(3)),
	parse: (str) => str.replace(/px\/mi\s*$/i, ''),
	format: (val) => val + ' px/mi',
});

Vars.add({
	label: 'Observer position',
	name: 'obs_dir',
	min: -180,
	max: 180,
	init: 10,
	round: (val) => Number(val.toFixed(2)),
	parse: (s) => Number(s.replace(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});

Vars.add({
	label: 'Observer height',
	name: 'obs_height',
	init: 100,
	min: 0,
	max: 500,
	ease: Vars.quadratic,
	round: (val) => Number(val.toPrecision(3)),
	parse: (str) => Miles.parse(str),
	format: (val) => Miles.stringify(val),
});

Vars.add({
	label: 'Camera rotation',
	name: 'cam_rot',
	init: 0,
	min: -180,
	max: 180,
	round: (val) => Number(val.toFixed(2)),
	parse: (s) => Number(s.replace(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});

Vars.add({
	label: 'Star position',
	name: 'star_dir',
	init: 50,
	min: 0,
	max: 360,
	round: (val) => Number(val.toFixed(2)),
	parse: (str) => Number(str.replace(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});

Vars.add({
	label: 'Star height',
	name: 'star_height',
	init: 4000,
	min: 1,
	max: 5e7,
	ease: Vars.exp10,
	round: (val) => Number(val.toPrecision(3)),
	parse: (str) => Miles.parse(str),
	format: (val) => Miles.stringify(val),
});

Vars.add({
	label: 'Sext. Index',
	name: 'sxt_idx_dir',
	init: 30,
	min: 0,
	max: 180,
	ease: Vars.linear,
	round: (val) => Number(val.toFixed(2)),
	parse: (str) => Number(str.replace(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});

Vars.add({
	label: 'Sext. Hrz.',
	name: 'sxt_hrz_dir',
	init: 60,
	min: 0,
	max: 180,
	ease: Vars.linear,
	round: (val) => Number(val.toFixed(2)),
	parse: (str) => Number(str.replace(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});

Vars.add({
	label: 'Arrow length',
	name: 'arrow_len',
	init: 100,
	min: 50,
	max: 400,
	ease: Vars.linear,
	parse: (str) => Number(str.replace(/\s*px\s*$/, '')),
	format: (val) => val + 'px',
});

Actions.add('Center observer', () => {
	Animation.finishAll();
	const a = getCenter();
	center = CENTER_VEC;
	Animation.animate(500, (t) => {
		t = smooth(t);
		centerVec = a.interpolate(obsVecPos, t);
	}, () => {
		center = CENTER_OBS;
	});
});

Actions.add('Center earth', () => {
	Animation.finishAll();
	const a = getCenter();
	center = CENTER_VEC;
	Animation.animate(500, (t) => {
		t = smooth(t);
		centerVec = a.interpolate(vec2(0, 0), t);
	}, () => {
		center = CENTER_EARTH;
	});
});

Actions.add('Center star', () => {
	Animation.finishAll();
	const a = getCenter();
	center = CENTER_VEC;
	Animation.animate(500, (t) => {
		t = smooth(t);
		centerVec = a.interpolate(starVecPos, t);
	}, () => {
		center = CENTER_STAR;
	});
});

Actions.add('Center horizon', () => {
	Animation.finishAll();
	const a = getCenter();
	center = CENTER_VEC;
	Animation.animate(500, (t) => {
		t = smooth(t);
		centerVec = a.interpolate(hrzVecPos, t);
	}, () => {
		center = CENTER_HRZ;
	});
});

const calcDir = (target) => {
	const [ x, y ] = target.minus(obsVecPos).normalized();
	let angle = Trig.acos(y);
	if (x < 0) {
		angle = d360 - angle;
	}
	angle = (angle - obsDir + d360) % d360;
	return angle;
};

const setSextant = (idxType, hrzType) => {
	console.log({ idxType, hrzType });
	const idx0 = getMirDir(idxMirDirType, idxMirDir);
	const hrz0 = getMirDir(hrzMirDirType, hrzMirDir);
	const idx1 = getMirDir(idxType);
	const hrz1 = getMirDir(hrzType);
	console.log({ idx0, hrz0, idx1, hrz1 });
	Animation.finishAll();
	idxMirDirType = SIGHT_VAR;
	hrzMirDirType = SIGHT_VAR;
	idxMirDir = idx0;
	hrzMirDir = hrz0;
	Animation.animate(500, (t) => {
		Vars.set('sxt_idx_dir', Trig.toDeg(idx0 + t*(idx1 - idx0)));
		Vars.set('sxt_hrz_dir', Trig.toDeg(hrz0 + t*(hrz1 - hrz0)));
	}, () => {
		idxMirDirType = idxType;
		hrzMirDirType = hrzType;
	});
};

Actions.add('Measure zenith', () => setSextant(SIGHT_ZENITH, SIGHT_STAR));
Actions.add('Measure Hs', () => setSextant(SIGHT_STAR, SIGHT_HORIZON));
Actions.add('Measure horizon zenith', () => setSextant(SIGHT_ZENITH, SIGHT_HORIZON));
Actions.add('Measure dip', () => setSextant(SIGHT_HORIZONTAL, SIGHT_HORIZON));
Actions.add('Measure alt.', () => setSextant(SIGHT_STAR, SIGHT_HORIZONTAL));
