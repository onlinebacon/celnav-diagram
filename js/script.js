import DrawingContext from './drawing.js';
import * as Video from './video.js';
import * as Trig from './trig.js';
import { vec2 } from './vec2.js';
import { linear, smooth } from './ease.js';

let ctx = true ? null : new DrawingContext(null);

const RGB = {
	earth: '0, 127, 255',
	spot: '255, 255, 255',
	down: '0, 255, 127',
	up: '127, 0, 255',
	star: '255, 192, 96',
	starSight: '255, 192, 0',
	earthCenterStarLine: '255, 192, 0',
	arc: '255, 64, 8',
	writing: '255, 255, 255',
};

let arrowGap = 7;
let arrowEnd = 60;
let textGap = 7;
let pxMileRatio = 160/3959;

const setSpeed = (value) => {
	Video.write(() => Video.setSpeed(value));
};

const animateValue = (duration, obj, attribute, target, ease = smooth) => {
	const init = () => {
		const base = obj[attribute];
		const targetValue = typeof target === 'function' ? target() : target;
		const dif = targetValue - base;
		return { base, dif };
	};
	const step = (t, { base, dif }) => {
		obj[attribute] = base + dif*ease(t);
	};
	Video.writeAnimation(duration, step, init);
};

const fadeIn = (obj, duration = 250) => {
	Video.write(() => {
		obj.opacity = 0;
		Video.add(obj.media);
	});
	Video.writeAnimation(duration, t => obj.opacity = t);
};

const fadeOut = (obj, duration = 250) => {
	Video.write(() => {
		obj.opacity = 1;
		Video.add(obj.media);
	});
	Video.writeAnimation(duration, t => obj.opacity = 1 - t);
	Video.write(() => Video.remove(obj));
};

const earth = {
	pos: vec2(400, 300),
	radiusMiles: 3959,
	opacity: 1,
	media: Video.create(() => {
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
	media: Video.create(() => {
		ctx.spot(earth.pos, `rgba(${RGB.spot}, ${earthCenter.opacity})`);
	}),
};

const gravityArrows = {
	opacity: 0,
	media: Video.create(() => {
		const n = 12;
		const r = earth.radiusMiles*pxMileRatio;
		for (let i=0; i<n; ++i) {
			const dir = vec2(0, 1).rot(Trig.deg(360/n*i));
			const a = earth.pos.plus(dir.scale(r - arrowGap));
			const b = earth.pos.plus(dir.scale(r - arrowEnd));
			ctx.arrow(a, b, `rgba(${RGB.down}, ${gravityArrows.opacity/2})`);
		}
	}),
};

const observer = {
	opacity: 1,
	pos: vec2(0, 0),
	defAngle: Trig.deg(15),
	angle: Trig.deg(15),
	heightMiles: 150,
	media: Video.create(() => {
		const h = (earth.radiusMiles + observer.heightMiles)*pxMileRatio;
		observer.pos = earth.pos.plus(vec2(0, h).rot(observer.angle));
		ctx.spot(observer.pos, `rgba(${RGB.spot}, ${observer.opacity})`);
	}),
};

const downArrow = {
	opacity: 1,
	media: Video.create(() => {
		const a = observer.pos.plus(vec2(0, -arrowGap).rot(observer.angle));
		const b = observer.pos.plus(vec2(0, -arrowEnd).rot(observer.angle));
		ctx.arrow(a, b, `rgba(${RGB.down}, ${downArrow.opacity})`);
	}),
};

const upArrow = {
	opacity: 1,
	media: Video.create(() => {
		const a = observer.pos.plus(vec2(0, arrowGap).rot(observer.angle));
		const b = observer.pos.plus(vec2(0, arrowEnd).rot(observer.angle));
		ctx.arrow(a, b, `rgba(${RGB.up}, ${upArrow.opacity})`);
	}),
};

const star = {
	opacity: 1,
	distMiles: 3000,
	angle: Trig.deg(50),
	pos: vec2(0, 0),
	media: Video.create(() => {
		const centerDist = (earth.radiusMiles + star.distMiles)*pxMileRatio;
		const offset = vec2(0, centerDist).rot(star.angle);
		star.pos = earth.pos.plus(offset);
		ctx.star(star.pos, 10, `rgba(${RGB.star}, ${star.opacity})`);
	}),
};

const starDir = {
	opacity: 1,
	media: Video.create(() => {
		const dir = star.pos.minus(observer.pos).normalized();
		const a = observer.pos.plus(dir.scale(arrowGap));
		const b = observer.pos.plus(dir.scale(arrowEnd));
		ctx.arrow(a, b, `rgba(${RGB.starSight}, ${starDir.opacity})`);
	}),
};

const starGP = {
	pos: vec2(0, 0),
	opacity: 1,
	media: Video.create(() => {
		const r = earth.radiusMiles*pxMileRatio;
		starGP.pos = earth.pos.plus(vec2(0, r).rot(star.angle));
		ctx.spot(starGP.pos, `rgba(${RGB.spot}, ${starGP.opacity})`);
	}),
};

const earthCenterStarLine = {
	opacity: 1,
	media: Video.create(() => {
		const color = `rgba(${RGB.earthCenterStarLine}, ${earthCenterStarLine.opacity*0.4})`;
		ctx.line(earth.pos, star.pos, color);
	}),
};

const observerGP = {
	pos: vec2(0, 0),
	opacity: 1,
	media: Video.create(() => {
		const r = earth.radiusMiles*pxMileRatio;
		observerGP.pos = earth.pos.plus(vec2(0, r).rot(observer.angle));
		ctx.spot(observerGP.pos, `rgba(${RGB.spot}, ${observerGP.opacity})`);
	}),
};

const arc = {
	opacity: 1,
	media: Video.create(() => {
		const a = Trig.deg(90) - star.angle;
		const b = Trig.deg(90) - observer.angle;
		ctx.lineWidth(2);
		ctx.arc(earth.pos, earth.radiusMiles*pxMileRatio, a, b, `rgba(${RGB.arc}, ${arc.opacity})`);
	}),
};

const buildRadius = () => {
	const obj = {
		opacity: 1,
		t: 1,
		dir: 0,
		media: Video.create(() => {
			const color = `rgba(${RGB.writing}, ${obj.opacity})`;
			const miles = earth.radiusMiles*obj.t;
			const a = earth.pos;
			const b = earth.pos.plus(vec2(0, miles*pxMileRatio).rot(obj.dir));
			const textPos = a.plus(b).scale(0.5).minus(vec2(textGap, 0));
			const text = Math.round(miles) + ' mi';
			ctx.line(a, b, color);
			ctx.fontSize(14).textBaseline('middle').textAlign('right').text(text, textPos, color);
		}),
	};
	return obj;
};

const radius1 = buildRadius();
const radius2 = buildRadius();

const height = {
	opacity: 1,
	dir: 0,
	t: 1,
	media: Video.create(() => {
		const color = `rgba(${RGB.writing}, ${height.opacity})`;
		const dif = observer.pos.minus(observerGP.pos);
		const len = dif.len()*height.t;
		const miles = len/pxMileRatio;
		const a = observerGP.pos;
		const b = a.plus(dif.normalized().scale(len));
		const textPos = a.plus(b).scale(0.5).minus(vec2(textGap, 0));
		const text = Math.round(miles) + ' mi';
		ctx.line(a, b, color);
		ctx.fontSize(14).textBaseline('middle').textAlign('right').text(text, textPos, color);
	}),
};

const build = () => {
	setSpeed(1);

	fadeIn(earth);
	
	fadeIn(earthCenter);
	
	fadeIn(gravityArrows);
	fadeOut(gravityArrows);
	
	fadeIn(observer);
	
	fadeIn(downArrow);

	fadeIn(upArrow);

	Video.writeAnimation(1000, (t, { pos_a, pos_b, ratio_a, ratio_b }) => {
		t = smooth(t);
		earth.pos = pos_a.interpolate(pos_b, t);
		pxMileRatio = ratio_a + (ratio_b - ratio_a)*t;
	}, () => ({
		pos_a: vec2(...earth.pos),
		pos_b: vec2(100, 100),
		ratio_a: pxMileRatio,
		ratio_b: 400/3959,
	}));

	fadeIn(star);
	
	fadeIn(starDir);
	
	animateValue(1000, observer, 'angle', star.angle + Trig.deg(10));
	animateValue(1000, observer, 'angle', star.angle);
	
	fadeIn(earthCenterStarLine, 1000);
	
	fadeIn(starGP);
	
	animateValue(2000, observer, 'angle', observer.defAngle);
	
	fadeIn(observerGP);

	Video.write(() => {
		arc.opacity = 0;
		Video.add(arc.media);
		Video.moveBelow(arc.media, starGP.media);
	})
	fadeIn(arc);

	Video.write(() => {
		radius1.opacity = 0;
		radius1.t = 0;
		Video.add(radius1.media);
	});
	
	Video.writeAnimation(1000, t => {
		radius1.t = smooth(t);
		radius1.opacity = t;
	});
	
	animateValue(1000, radius1, 'dir', () => observer.angle);
	
	Video.write(() => {
		height.opacity = 0;
		height.t = 0;
		Video.add(height.media);
	});

	Video.writeAnimation(1000, t => {
		height.t = smooth(t);
		height.opacity = t;
	});
	
	Video.write(() => {
		radius2.opacity = 0;
		Video.add(radius2.media);
	});
	Video.writeAnimation(1000, t => {
		radius2.opacity = Math.min(1, t*5);
		radius2.dir = observer.angle + smooth(t)*(star.angle - observer.angle);
	});

	Video.writeDelay(duration);
};

export const init = async (canvas) => {
	ctx = new DrawingContext(canvas);
	Video.setBeforeFrame(() => {
		ctx.ctx.fillStyle = '#111';
		ctx.ctx.fillRect(0, 0, canvas.width, canvas.height);
	});
	build();
};

export const start = () => {
	Video.start();
};