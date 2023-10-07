import DrawingContext from './drawing.js';
import * as Range from './range.js';
import * as Trig from './trig.js';
import { vec2 } from './vec2.js';

let ctx = true ? null : new DrawingContext(null);

const COLOR = {
	earth: 'rgb(0, 127, 255)',
	earthInterior: 'rgba(0, 127, 255, 0.15)',
	spot: 'rgb(255, 255, 255)',
	star: 'rgb(255, 192, 64)',
	starSight: 'rgba(255, 127, 0, 0.4)',
	down: 'rgb(0, 255, 127)',
	up: 'rgb(127, 0, 255)',
	horizon: 'rgb(110, 110, 110)',
	z1: '#fc5',
	z2: '#05c',
	angle: '#fff',
};

const earthRadiusMiles = 3958.76;
const starRadius = 6;
const lineExcess = 50;
const arrowLen = 50;

// User vars
let pxMileRatio = Number((200/earthRadiusMiles).toPrecision(3));
let obsHeightMiles = 100;
let starHeightMiles = 2000;
let obsDir = Trig.deg(15);
let starDir = Trig.deg(50);
let z1Dir = Trig.deg(30);
let z2Dir = Trig.deg(60);

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
	earthRadius = earthRadiusMiles*pxMileRatio;
	starHeight = starHeightMiles*pxMileRatio;
	obsHeight = obsHeightMiles*pxMileRatio;
	const starVecDir = vec2(0, 1).rot(starDir);
	obsVecDir = vec2(0, 1).rot(obsDir);
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
	const b = obsVecPos.plus(obsVecDir.scale(50));
	ctx.arrow(a, b, COLOR.up);
};
const drawHorizon = () => {
	const hip = earthRadius + obsHeight;
	const adj = earthRadius;
	const dip = Trig.acos(adj/hip);
	const hrzVecDir = vec2(1, 0).rot(obsDir + dip);
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
	const z1VecDir = vec2(0, 1).rot(obsDir + z1Dir);
	const z2VecDir = vec2(0, 1).rot(obsDir + z2Dir);
	ctx.arrow(obsVecPos, obsVecPos.plus(z1VecDir.scale(arrowLen)), COLOR.z1);
	ctx.arrow(obsVecPos, obsVecPos.plus(z2VecDir.scale(arrowLen)), COLOR.z2);
	let angA = obsDir + z1Dir;
	let angB = obsDir + z2Dir;
	if (z1Dir > z2Dir) {
		[ angA, angB ] = [ angB, angA ];
	}
	const reading = Number(Trig.toDeg(z2Dir - z1Dir).toFixed(1)) + '°';
	ctx.arc(obsVecPos, arrowLen/2, angA, angB, COLOR.angle);
	const textVecPos = obsVecPos.plus(vec2(0, 1).rot((angA + angB)/2).scale(arrowLen/2 + 3));
	ctx.fontSize(10);
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
	let dif = (starDir - obsDir + d360)%d360;
	ctx.arc(vec2(0, 0), earthRadius, obsDir, obsDir + dif, COLOR.angle);
	let dist = Trig.toRad(dif)*earthRadiusMiles;
	let text = Number(dist.toFixed(2)) + ' mi';
	const midDirVec = vec2(0, 1).rot(obsDir + dif/2);
	ctx.textAlign('right').textBaseline('middle');
	ctx.text(text, midDirVec.scale(earthRadius - 10), COLOR.angle);
};

const render = () => {
	ctx.clear();
	recalculateVars();
	ctx.setCenter(...obsVecPos);
	drawEarth();
	drawEarthCenterStarLine();
	drawHorizon();
	drawUp();
	drawDown();
	drawObsStarSight();
	drawGPDistanceArc();
	drawSextant();
	drawStar();
	drawObserver();
	drawEarthCenter();
	drawObserverGP();
	drawStarGP();
};

const frameLoop = () => {
	render();
	requestAnimationFrame(frameLoop);
};

export const init = (drawingContext) => {
	ctx = drawingContext;
	frameLoop();
};

Range.build({
	label: 'Scale',
	min: 0.05,
	max: 40,
	val: pxMileRatio,
	ease: Range.exp10,
	round: (val) => Number(val.toPrecision(3)),
	format: (val) => val + ' px/mi',
	onchange: (val) => pxMileRatio = val,
});

Range.build({
	label: 'Observer position',
	min: 0,
	max: 360,
	val: Number(Trig.toDeg(obsDir).toFixed(1)),
	parse: (s) => Number(s.repalce(/\s*°\s*$/, '')),
	round: (val) => Number(val.toFixed(1)),
	format: (val) => val + '°',
	onchange: (val) => obsDir = Trig.deg(val),
});

Range.build({
	label: 'Observer height',
	min: 0,
	val: obsHeightMiles,
	max: 500,
	ease: Range.quadratic,
	round: (val) => Number(val.toPrecision(3)),
	format: (val) => val + ' mi',
	onchange: (val) => obsHeightMiles = val,
});

Range.build({
	label: 'Star position',
	min: 0,
	max: 360,
	val: Number(Trig.toDeg(starDir).toFixed(1)),
	round: (val) => Number(val.toFixed(1)),
	format: (val) => val + '°',
	onchange: (val) => starDir = Trig.deg(val),
});

Range.build({
	label: 'Star height',
	min: 0,
	val: starHeightMiles,
	max: 1e6,
	ease: Range.quadratic,
	round: (val) => Number(val.toPrecision(3)),
	format: (val) => val + ' mi',
	onchange: (val) => starHeightMiles = val,
});

Range.build({
	label: 'Sextant. Z1',
	min: 0,
	val: Math.round(Trig.toDeg(z1Dir)),
	max: 180,
	ease: Range.linear,
	round: (val) => Number(val.toFixed(1)),
	format: (val) => val + '°',
	onchange: (val) => z1Dir = Trig.deg(val),
});

Range.build({
	label: 'Sextant. Z2',
	min: 0,
	val: Math.round(Trig.toDeg(z2Dir)),
	max: 180,
	ease: Range.linear,
	round: (val) => Number(val.toFixed(1)),
	format: (val) => val + '°',
	onchange: (val) => z2Dir = Trig.deg(val),
});
