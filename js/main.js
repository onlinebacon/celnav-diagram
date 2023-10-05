import * as Script from './script.js';

const canvas = document.querySelector('canvas');

const FULL_SCREEN = true;

const fillScreenWithCanvas = () => {
	if (FULL_SCREEN) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	} else {
		canvas.width = 800;
		canvas.height = 600;
		canvas.style.marginTop = (innerHeight - 600) >>> 1;
		canvas.style.marginLeft = (innerWidth - 800) >>> 1;
	}
};

fillScreenWithCanvas();

window.addEventListener('resize', fillScreenWithCanvas);

Script.init(canvas);

// const ARROW_GAP = 5;
// const ARROW_LEN = 35;

// const RGB = {
// 	earth: '0, 127, 255',
// 	down: '0, 255, 127',
// 	up: '119, 0, 255',
// 	starSight: '255, 200, 0',
// 	sight: '255, 255, 255',
// 	arc: '255, 64, 32',
// };

// let starAngle = Trig.deg(60);
// let obsDefAngle = Trig.deg(15);
// let obsAngle = obsDefAngle;
// let starDist = 400;
// let zenith = Trig.deg(80);
// let sightOpacity = 0;
// let sightLen = 100;
// let earthPos = vec2(400, 300);
// let earthRad = 200;
// let earthOpacity = 0;

// let earth = Media.rElement(() => {
// 	ctx.circle(
// 		earthPos,
// 		earthRad,
// 		`rgba(${RGB.earth}, ${earthOpacity})`,
// 		`rgba(${RGB.earth}, ${earthOpacity*0.1})`,
// 	);
// });

// const ctx = objCtx(canvas);

// const nullElem = true ? null : Media.rElement();

// const calcDip = (obs) => {
// 	const r = earthRad;
// 	const h = earthPos.minus(obs.pos).len() - r;
// 	return Trig.acos(r/(r + h));
// };

// const buildSight = async (obs) => {
// 	let res = Media.rElement(() => {
// 		let angle = obsAngle + zenith;
// 		const a = obs.pos.plus(vec2(0, ARROW_GAP).rot(angle));
// 		const b = obs.pos.plus(vec2(0, ARROW_GAP + sightLen).rot(angle));
// 		ctx.arrow(a, b, `rgba(${RGB.sight}, ${sightOpacity})`);
// 	});
// 	const a0 = starAngle;
// 	const a1 = Trig.deg(80);
// 	await Media.animate(1000, t => {
// 		zenith = a0 + (a1 - a0)*smooth(t);
// 		sightOpacity = t;
// 	});
// 	return res;
// };

// const addEarthCenter = () => {
// 	return Media.rElement(() => {
// 		ctx.spot(earthPos, `rgba(255, 255, 255, ${earthOpacity})`);
// 	});
// };

// const fadeIn = async (obj, duration = 500) => {
// 	await Media.animate(duration, t => {
// 		obj.opacity = t;
// 	});
// };

// const fadeOut = async (obj, duration = 500) => {
// 	await Media.animate(duration, t => {
// 		obj.opacity = 1 - t;
// 	});
// };

// const buildGravityArrows = (earth) => {
// 	const n = 12;
// 	const obj = { opacity: 0, elem: nullElem };
// 	obj.elem = Media.rElement(() => {
// 		const v1 = vec2(0, earthRad*0.8);
// 		const v2 = vec2(0, earthRad*0.4);
// 		for (let i=0; i<n; ++i) {
// 			const angle = Trig.deg(i/n*360);
// 			const a = v1.rot(angle).plus(earthPos);
// 			const b = v2.rot(angle).plus(earthPos);
// 			ctx.arrow(a, b, `rgba(${RGB.down}, ${obj.opacity})`);
// 		}
// 	});
// 	return obj;
// };

// const buildObserver = () => {
// 	const obs = { pos: null, dir: null, elem: nullElem };
// 	const update = () => {
// 		const dir = vec2(0, 1).rot(obsAngle);
// 		const pos = earthPos.plus(dir.scale(earthRad*1.1));
// 		obs.pos = pos;
// 		obs.dir = dir;
// 	};
// 	obs.elem = Media.rElement(() => {
// 		update();
// 		ctx.spot(obs.pos, '#fff');
// 	});
// 	update();
// 	return obs;
// };

// const buildDownArrow = (obs) => {
// 	const obj = {
// 		elem: nullElem,
// 	};
// 	obj.elem = Media.rElement(() => {
// 		const { pos, dir } = obs;
// 		const a = pos.plus(dir.scale(-ARROW_GAP));
// 		const b = pos.plus(dir.scale(-(ARROW_GAP + ARROW_LEN)));
// 		ctx.arrow(a, b, '#0f7');
// 	});
// 	return obj;
// };

// const buildUpArrow = (obs) => {
// 	const obj = { elem: nullElem };
// 	obj.elem = Media.rElement(() => {
// 		const { pos, dir } = obs;
// 		const a = pos.plus(dir.scale(ARROW_GAP));
// 		const b = pos.plus(dir.scale(ARROW_GAP + ARROW_LEN));
// 		ctx.arrow(a, b, `rgb(${RGB.up})`);
// 	});
// 	return obj;
// };

// const shrinkEarthToCorner = async (earth) => {
// 	const p1 = earthPos;
// 	const p2 = vec2(200, 150);
// 	const r1 = earthRad;
// 	const r2 = 150;
// 	await Media.animate(1000, t => {
// 		t = smooth(t);
// 		earthPos = p1.interpolate(p2, t);
// 		earthRad = r1 + (r2 - r1)*t;
// 	});
// };

// const buildStar = () => {
// 	const star = { elem: nullElem, pos: vec2(0, 0) };
// 	const update = () => {
// 		const pos = earthPos.plus(vec2(0, starDist).rot(starAngle));
// 		star.pos = pos;
// 	};
// 	star.elem = Media.rElement(() => {
// 		update();
// 		ctx.star(star.pos, 7, '#fd5');
// 	});
// 	update();
// 	return star;
// };

// const buildGPStarSightLine = (star) => {
// 	const line = { elem: nullElem };
// 	line.elem = Media.rElement(() => {
// 		ctx.line(earthPos, star.pos, `rgba(${RGB.starSight}, 0.5)`);
// 	});
// };

// const moveStarAway = () => {
// 	const d0 = starDist;
// 	const d1 = 1e5;
// 	return Media.animate(2000, t => {
// 		t = exp(t);
// 		starDist = d0 + t*(d1 - d0);
// 	});
// };

// const moveObsToGP = () => {
// 	const d = starAngle - obsDefAngle;
// 	return Media.animate(1000, t => {
// 		t = smooth(t);
// 		obsAngle = obsDefAngle + d*t;
// 	});
// };

// const buildGP = (earth) => {
// 	const gp = { pos: vec2(0, 0), elem: nullElem };
// 	const update = () => {
// 		gp.pos = earthPos.plus(vec2(0, earthRad).rot(starAngle));
// 	};
// 	gp.elem = Media.rElement(() => {
// 		update();
// 		ctx.spot(gp.pos, '#fff');
// 	});
// 	update();
// 	return gp;
// };

// const moveObserverBack = () => {
// 	const d = obsDefAngle - starAngle;
// 	return Media.animate(1000, t => {
// 		t = smooth(t);
// 		obsAngle = starAngle + d*t;
// 	});
// };

// const buildToStarArrow = (obs, star) => {
// 	Media.rElement(() => {
// 		const dir = star.pos.minus(obs.pos).normalized();
// 		const a = obs.pos.plus(dir.scale(ARROW_GAP));
// 		const b = obs.pos.plus(dir.scale(ARROW_GAP + ARROW_LEN));
// 		ctx.arrow(a, b, `rgb(${RGB.starSight})`);
// 	});
// };

// const moveSightDown = (obs) => {
// 	const a0 = zenith;
// 	const a1 = Trig.deg(90) + calcDip(obs) + Trig.deg(20);
// 	return Media.animate(1000, t => {
// 		zenith = a0 + (a1 - a0)*smooth(t);
// 	});
// };

// const moveSightUp = (obs) => {
// 	const a0 = zenith;
// 	const a1 = Trig.deg(90) + calcDip(obs) - Trig.deg(20);
// 	return Media.animate(1000, t => {
// 		zenith = a0 + (a1 - a0)*smooth(t);
// 	});
// };

// const moveSightToHorizon = (obs) => {
// 	const a0 = zenith;
// 	const a1 = Trig.deg(90) + calcDip(obs);
// 	return Media.animate(1000, t => {
// 		zenith = a0 + (a1 - a0)*smooth(t);
// 	});
// };

// const extendSight = () => {
// 	const a0 = sightLen;
// 	const a1 = 100;
// 	return Media.animate(1000, t => {
// 		sightLen = a0 + (a1 - a0)*smooth(t);
// 	});
// };

// const shrinkSight = () => {
// 	const a0 = sightLen;
// 	const a1 = ARROW_LEN;
// 	return Media.animate(1000, t => {
// 		sightLen = a0 + (a1 - a0)*smooth(t);
// 	});
// };

// const fadeInEarth = () => Media.animate(1000, t => earthOpacity = t);

// const run = async () => {
// 	Media.setSpeed(2);
	
// 	await Media.delay(500);
// 	await fadeInEarth();
	
// 	await Media.delay(1500);
// 	addEarthCenter();
	
// 	await Media.delay(1500);
// 	const gArrows = buildGravityArrows();
// 	await fadeIn(gArrows);
	
// 	await Media.delay(1000);
// 	await fadeOut(gArrows);
// 	Media.remove(gArrows.elem);
	
// 	await Media.delay(1000);
// 	const obs = buildObserver();
	
// 	await Media.delay(1000);
// 	const downArrow = buildDownArrow(obs);
	
// 	await Media.delay(1000);
// 	const upArrow = buildUpArrow(obs);
	
// 	await Media.delay(1000);
// 	Media.remove(downArrow.elem);
// 	Media.remove(upArrow.elem);
	
// 	await Media.delay(1000);
// 	await shrinkEarthToCorner();
	
// 	await Media.delay(1000);
// 	const star = buildStar();
	
// 	await Media.delay(1000);
// 	Media.add(upArrow.elem);
	
// 	await Media.delay(1000);
// 	await moveObsToGP();
	
// 	await Media.delay(1000);
// 	Media.add(downArrow.elem);
	
// 	await Media.delay(1000);
// 	const gp = buildGP();
	
// 	await Media.delay(1000);
// 	moveObserverBack();
	
// 	await Media.delay(1000);
// 	buildToStarArrow(obs, star);
	
// 	await Media.delay(1000);
// 	Media.rElement(() => {
// 		ctx.lineWidth(1.5);
// 		ctx.arc(earthPos, earthRad, Trig.deg(90) - starAngle, Trig.deg(90) - obsAngle, `rgb(${RGB.arc})`);
// 	});
	
// 	await Media.delay(1000);
// 	buildGPStarSightLine(star);
	
// 	await Media.delay(1000);
// 	await buildSight(obs);

// 	await Media.delay(1000);
// 	await moveSightDown(obs);
	
// 	await Media.delay(1000);
// 	await moveSightUp(obs);
	
// 	await Media.delay(1000);
// 	await moveSightToHorizon(obs);
	
// 	await Media.delay(1000);
// 	await extendSight();

// 	await Media.delay(1000);
// 	await shrinkSight();

// 	await Media.delay(1000);
// 	await moveStarAway();
// };

// Media.setBeforeFrame(() => {
// 	ctx.ctx.fillStyle = '#171717';
// 	ctx.ctx.fillRect(0, 0, canvas.width, canvas.height);
// });
// Media.start();

// run();
