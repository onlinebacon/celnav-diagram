import DrawingContext from './drawing.js';
import * as Trig from './trig.js';
import * as Toggles from './toggles.js';
import { vec2 } from './vec2.js';
import * as Vars from './variables.js';

const { VARS } = Vars;

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
};

const earthRadiusMiles = 3958.76;
const starRadius = 10;
const lineExcess = 50;
const arrowLen = 100;

// Calculated vars
let obsHeight = 0;
let earthRadius = 0;
let starHeight = 0;
let obsVecPos = vec2();
let starVecPos = vec2();
let obsVecDir = vec2();
let obsGPVecPos = vec2();
let starGPVecPos = vec2();

const recalculateVars = () => {
	earthRadius = earthRadiusMiles*VARS.scale;
	starHeight = VARS.star_height*VARS.scale;
	obsHeight = VARS.obs_height*VARS.scale;
	const starVecDir = vec2(0, 1).rot(VARS.star_dir);
	obsVecDir = vec2(0, 1).rot(VARS.obs_dir);
	obsVecPos = obsVecDir.scale(earthRadius + obsHeight);
	starVecPos = starVecDir.scale(earthRadius + starHeight);
	obsGPVecPos = obsVecDir.scale(earthRadius);
	starGPVecPos = starVecDir.scale(earthRadius);
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
	const b = obsVecPos.plus(obsVecDir.scale(arrowLen));
	ctx.arrow(a, b, COLOR.up);
};
const drawHorizon = () => {
	const hip = earthRadius + obsHeight;
	const adj = earthRadius;
	const dip = Trig.acos(adj/hip);
	const hrzVecDir = vec2(1, 0).rot(VARS.obs_dir + dip);
	const hrzDist = (hip**2 - adj**2)**0.5;
	const hrzVecPos = obsVecPos.plus(hrzVecDir.scale(hrzDist));
	const a = obsVecPos.minus(hrzVecDir.scale(lineExcess));
	const b = hrzVecPos.plus(hrzVecDir.scale(lineExcess));
	ctx.line(a, b, COLOR.horizon);
	ctx.spot(hrzVecPos, COLOR.spot);
};
const drawEarthCenterStarLine = () => drawLineWithExcess(
	vec2(0, 0),
	starVecPos,
	COLOR.starSight,
);
const drawSextant = () => {
	const z1VecDir = vec2(0, 1).rot(VARS.obs_dir + VARS.sxt_idx_dir);
	const z2VecDir = vec2(0, 1).rot(VARS.obs_dir + VARS.sxt_hrz_dir);
	ctx.arrow(obsVecPos, obsVecPos.plus(z1VecDir.scale(arrowLen)), COLOR.z1);
	ctx.arrow(obsVecPos, obsVecPos.plus(z2VecDir.scale(arrowLen)), COLOR.z2);
	let angA = VARS.obs_dir + VARS.sxt_idx_dir;
	let angB = VARS.obs_dir + VARS.sxt_hrz_dir;
	if (VARS.sxt_idx_dir > VARS.sxt_hrz_dir) {
		[ angA, angB ] = [ angB, angA ];
	}
	const reading = Number(Trig.toDeg(VARS.sxt_hrz_dir - VARS.sxt_idx_dir).toFixed(1)) + '°';
	ctx.arc(obsVecPos, arrowLen/2, angA, angB, COLOR.angle);
	const textVecPos = obsVecPos.plus(vec2(0, 1).rot((angA + angB)/2).scale(arrowLen/2 + 3));
	ctx.fontSize(15);
	ctx.textAlign('left').textBaseline('middle');
	ctx.text(reading, textVecPos, COLOR.angle);
};
const drawObserverGP = () => {
	ctx.spot(obsGPVecPos, COLOR.spot);
};
const drawStarGP = () => {
	ctx.spot(starGPVecPos, COLOR.spot);
};
const drawGPDistanceArc = () => {
	const d360 = Trig.deg(360);
	let dif = (VARS.star_dir - VARS.obs_dir + d360)%d360;
	ctx.arc(vec2(0, 0), earthRadius, VARS.obs_dir, VARS.obs_dir + dif, COLOR.angle);
	let dist = Trig.toRad(dif)*earthRadiusMiles;
	let text = Number(dist.toFixed(2)) + ' mi';
	const midDirVec = vec2(0, 1).rot(VARS.obs_dir + dif/2);
	ctx.textAlign('right').textBaseline('middle');
	ctx.text(text, midDirVec.scale(earthRadius - 10), COLOR.angle);
};

const render = () => {
	ctx.clear();
	recalculateVars();
	if (Toggles.get('observer')) {
		ctx.setCenter(...obsVecPos);
	} else {
		ctx.setCenter(0, 0);
	}
	if (Toggles.get('earth')) drawEarth();
	if (Toggles.get('star_gp_sight')) drawEarthCenterStarLine();
	if (Toggles.get('hrz')) drawHorizon();
	if (Toggles.get('down')) drawDown();
	if (Toggles.get('up')) drawUp();
	if (Toggles.get('star_sight')) drawObsStarSight();
	if (Toggles.get('arc')) drawGPDistanceArc();
	if (Toggles.get('sextant')) drawSextant();
	if (Toggles.get('star')) drawStar();
	if (Toggles.get('observer')) drawObserver();
	if (Toggles.get('earth')) drawEarthCenter();
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
	max: 40,
	init: Number((250/earthRadiusMiles).toPrecision(3)),
	ease: Vars.exp10,
	round: (val) => Number(val.toPrecision(3)),
	parse: (str) => str.replace(/px\/mi\s*$/i, ''),
	format: (val) => val + ' px/mi',
});

Vars.add({
	label: 'Observer position',
	name: 'obs_dir',
	min: 0,
	max: 360,
	init: 0,
	round: (val) => Number(val.toFixed(1)),
	parse: (s) => Number(s.repalce(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});

Vars.add({
	label: 'Observer height',
	name: 'obs_height',
	init: 150,
	min: 0,
	max: 500,
	ease: Vars.quadratic,
	round: (val) => Number(val.toPrecision(3)),
	parse: (str) => Number(str.replace(/\s*mi\s*$/i, '')),
	format: (val) => val + ' mi',
});

Vars.add({
	label: 'Star position',
	name: 'star_dir',
	init: 50,
	min: 0,
	max: 360,
	round: (val) => Number(val.toFixed(1)),
	parse: (str) => Number(str.replace(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});

Vars.add({
	label: 'Star height',
	name: 'star_height',
	init: 4000,
	min: 0,
	max: 1e6,
	ease: Vars.quadratic,
	round: (val) => Number(val.toPrecision(3)),
	format: (val) => val + ' mi',
});

Vars.add({
	label: 'Sext. Index',
	name: 'sxt_idx_dir',
	init: 30,
	min: 0,
	max: 180,
	ease: Vars.linear,
	round: (val) => Number(val.toFixed(1)),
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
	round: (val) => Number(val.toFixed(1)),
	parse: (str) => Number(str.replace(/\s*°\s*$/, '')),
	format: (val) => val + '°',
	map: (deg) => Trig.deg(deg),
});
