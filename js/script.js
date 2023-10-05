import DrawingContext from './drawing.js';
import { smooth } from './ease.js';
import * as Media from './media.js';
import * as Trig from './trig.js';
import { vec2 } from './vec2.js';

let ctx = true ? null : new DrawingContext(null);

const RGB = {
	earth: '0, 127, 255',
	spot: '255, 255, 255',
	down: '0, 255, 127',
	up: '127, 0, 255',
	star: '255, 192, 96',
	starSight: '255, 192, 0',
	starGPSight: '255, 192, 0',
};

let arrowGap = 7;
let arrowEnd = 60;
let pxMileRatio = 160/3959;
let currentLines = [];
let comment = Media.create(() => {
	ctx.comment(currentLines);
});

Media.add(comment);

const fadeIn = (obj, duration = 1000) => {
	obj.opacity = 0;
	Media.add(obj.media);
	return Media.animate(duration, t => obj.opacity = t);
};

const fadeOut = async (obj, duration = 1000) => {
	obj.opacity = 0;
	await Media.animate(duration, t => obj.opacity = 1 - t);
	Media.remove(obj.media);
};

const speedUp = () => Media.setSpeed(128);
const normalSpeed = () => Media.setSpeed(1);

const earth = {
	pos: vec2(400, 300),
	radiusMiles: 3959,
	opacity: 1,
	media: Media.create(() => {
		ctx.circle(
			earth.pos,
			earth.radiusMiles*pxMileRatio,
			`rgba(${RGB.earth}, ${earth.opacity*1.0})`,
			`rgba(${RGB.earth}, ${earth.opacity*0.1})`,
		);
	}),
};

const earthCenter = {
	opacity: 1,
	media: Media.create(() => {
		ctx.spot(earth.pos, `rgba(${RGB.spot}, ${earthCenter.opacity})`);
	}),
};

const gravityArrows = {
	opacity: 0,
	media: Media.create(() => {
		const n = 12;
		const r = earth.radiusMiles*pxMileRatio;
		for (let i=0; i<n; ++i) {
			const dir = vec2(0, 1).rot(Trig.deg(360/n*i));
			const a = earth.pos.plus(dir.scale(r - arrowGap));
			const b = earth.pos.plus(dir.scale(r - arrowEnd));
			ctx.arrow(a, b, `rgba(${RGB.down}, ${gravityArrows.opacity})`);
		}
	}),
};

const observer = {
	opacity: 1,
	pos: vec2(0, 0),
	defAngle: Trig.deg(15),
	angle: Trig.deg(15),
	heightMiles: 200,
	media: Media.create(() => {
		const h = (earth.radiusMiles + observer.heightMiles)*pxMileRatio;
		observer.pos = earth.pos.plus(vec2(0, h).rot(observer.angle));
		ctx.spot(observer.pos, `rgba(${RGB.spot}, ${observer.opacity})`);
	}),
};

const downArrow = {
	opacity: 1,
	media: Media.create(() => {
		const a = observer.pos.plus(vec2(0, -arrowGap).rot(observer.angle));
		const b = observer.pos.plus(vec2(0, -arrowEnd).rot(observer.angle));
		ctx.arrow(a, b, `rgba(${RGB.down}, ${downArrow.opacity})`);
	}),
};

const upArrow = {
	opacity: 1,
	media: Media.create(() => {
		const a = observer.pos.plus(vec2(0, arrowGap).rot(observer.angle));
		const b = observer.pos.plus(vec2(0, arrowEnd).rot(observer.angle));
		ctx.arrow(a, b, `rgba(${RGB.up}, ${upArrow.opacity})`);
	}),
};

const star = {
	opacity: 1,
	distMiles: 5000,
	angle: Trig.deg(60),
	pos: vec2(0, 0),
	media: Media.create(() => {
		const centerDist = (earth.radiusMiles + star.distMiles)*pxMileRatio;
		const offset = vec2(0, centerDist).rot(star.angle);
		star.pos = earth.pos.plus(offset);
		ctx.star(star.pos, 10, `rgba(${RGB.star}, ${star.opacity})`);
	}),
};

const starDir = {
	opacity: 1,
	media: Media.create(() => {
		const dir = star.pos.minus(observer.pos).normalized();
		const a = observer.pos.plus(dir.scale(arrowGap));
		const b = observer.pos.plus(dir.scale(arrowEnd));
		ctx.arrow(a, b, `rgba(${RGB.starSight}, ${starDir.opacity})`);
	}),
};

const starGP = {
	pos: vec2(0, 0),
	opacity: 1,
	media: Media.create(() => {
		const r = earth.radiusMiles*pxMileRatio;
		starGP.pos = earth.pos.plus(vec2(0, r).rot(star.angle));
		ctx.spot(starGP.pos, `rgba(${RGB.spot}, ${starGP.opacity})`);
	}),
};

const starGPSight = {
	opacity: 1,
	media: Media.create(() => {
		const color = `rgba(${RGB.starGPSight}, ${starGPSight.opacity*0.4})`;
		ctx.line(earth.pos, star.pos, color);
	}),
};

const steps = [
	// speedUp,
	`Let's say the earth is a perfect sphere`,
	() => fadeIn(earth),
	1500,
	`This white dot represents its very center`,
	() => fadeIn(earthCenter),
	2500,
	`In this earth, the direction of down is wherever the center is`,
	() => fadeIn(gravityArrows, 2000),
	1000,
	() => fadeOut(gravityArrows),
	1000,
	`Let's place an observer close to the earth's surface`,
	500,
	() => fadeIn(observer),
	2500,
	`This green arrow shows the direction of down for this observer`,
	() => fadeIn(downArrow),
	2500,
	`The purple arrow points in the opposite direction\nand it establishes where up is`,
	() => fadeIn(upArrow),
	3500,
	'',
	() => {
		const startPos = earth.pos;
		const endPos = vec2(250, 210);
		const startRatio = pxMileRatio;
		const endRatio = 250/3959;
		return Media.animate(t => {
			t = smooth(t);
			earth.pos = startPos.interpolate(endPos, t);
			pxMileRatio = startRatio + (endRatio - startRatio)*t;
		});
	},
	`Let's place a star somewhere near the earth`,
	500,
	() => fadeIn(star),
	1500,
	`Let's draw an arrow showing the direction\nin which the observer sees the star`,
	3000,
	() => fadeIn(starDir),
	2000,
	`If we move the observer towards the star`,
	1000,
	() => {
		const a0 = observer.angle;
		const a1 = star.angle;
		return Media.animate(2000, t => {
			observer.angle = a0 + (a1 - a0)*smooth(t);
		});
	},
	`At some point, the direction to the\nstar matches the direction of up`,
	3000,
	`The point at the surface where the star is\nexactly upwards is called the GP of that star`,
	() => fadeIn(starGP, 500),
	3500,
	`Also, if you create a straight line\nconnecting the center of the earth and the star`,
	5000,
	// normalSpeed,
	`this line will go straight through the GP`,
	() => fadeIn(starGPSight),
	2000,
	'',
	() => {
		const a0 = star.angle;
		const a1 = observer.defAngle;
		return Media.animate(2000, t => {
			observer.angle = a0 + (a1 - a0)*smooth(t);
		});
	},
];

export const init = async (canvas) => {
	ctx = new DrawingContext(canvas);
	Media.setBeforeFrame(() => {
		ctx.ctx.fillStyle = '#111';
		ctx.ctx.fillRect(0, 0, canvas.width, canvas.height);
	});
	Media.start();
	for (const step of steps) {
		const type = typeof step;
		if (type === 'string') {
			currentLines = step.trim().split(/\s*\n\s*/);
			Media.moveUp(comment);
		} else if (type === 'number') {
			await Media.delay(step);
		} else {
			await step();
		}
	}
};
