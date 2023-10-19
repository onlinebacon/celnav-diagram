import * as Trig from './trig.js';
import { vec2 } from './vec2.js';

const { PI } = Math;
const TAU = PI*2;
const DEF_LINE_WID = 2;
const DEF_SPOT_RAD = DEF_LINE_WID*1.5;
const d150 = Trig.deg(150);
const d210 = Trig.deg(210);
const cos30 = Trig.cos(Trig.deg(30));

export default class DrawingContext {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.bgColor = '#111';
		this.canvasSize(canvas.width, canvas.height);
		this.setCenter(0, 0);
	}
	mightBeOnScreen([ x, y ]) {
		const { cx, cy } = this;
		const distSqr = (x - cx)**2 + (y - cy)**2;
		if (distSqr > this.scrRadSqr) {
			return false;
		}
		return true;
	}
	canvasSize(width, height) {
		const { canvas } = this;
		canvas.width = width;
		canvas.height = height;
		this.scrRadSqr = (width/2)**2 + (height/2)**2;
		this.scrRad = Math.sqrt(this.scrRadSqr);
		this.scrDiam = this.scrRad*2;
		return this;
	}
	setCenter(x, y) {
		this.center = vec2(x, y);
		this.cx = x;
		this.cy = y;
		return this;
	}
	fromCenter([ x, y ]) {
		const { canvas, cx, cy } = this;
		x = canvas.width/2 + (x - cx);
		y = canvas.height/2 - (y - cy);
		return vec2(x, y);
	}
	clear() {
		this.ctx.fillStyle = this.bgColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		return this;
	}
	moveTo(vec) {
		this.ctx.moveTo(...this.fromCenter(vec));
		return this;
	}
	lineTo(vec) {
		this.ctx.lineTo(...this.fromCenter(vec));
		return this;
	}
	lineWidth(val) {
		this.ctx.lineWidth = val;
		return this;
	}
	spot(pos, color = null) {
		const { ctx } = this;
		if (color != null) {
			ctx.fillStyle = color;
		}
		ctx.beginPath();
		ctx.arc(...this.fromCenter(pos), DEF_SPOT_RAD, 0, TAU);
		ctx.fill();
		return this;
	}
	star(pos, radius, color = null) {
		const { ctx } = this;
		if (color != null) {
			ctx.fillStyle = color;
		}
		const [ cx, cy ] = this.fromCenter(pos);
		const r2 = radius;
		const r1 = r2*0.35;
		ctx.beginPath();
		for (let i=0; i<5; ++i) {
			const x1 = cx + Math.sin(TAU*i/5)*r1;
			const y1 = cy + Math.cos(TAU*i/5)*r1;
			const x2 = cx + Math.sin(TAU*(i + 0.5)/5)*r2;
			const y2 = cy + Math.cos(TAU*(i + 0.5)/5)*r2;
			if (i === 0) {
				ctx.moveTo(x1, y1);
			} else {
				ctx.lineTo(x1, y1);
			}
			ctx.lineTo(x2, y2);
		}
		ctx.fill();
		return this;
	}
	circle(center, radius, strokeColor = null, fillColor = null) {
		const { ctx, cx, cy } = this;
		const [ x, y ] = center;
		const rel = vec2(x - cx, y - cy);
		const dir = rel.normalized();
		const dist = rel.len();
		const dif = dist - radius;
		if (dif > this.scrRad) {
			return this;
		}

		this.lineWidth(DEF_LINE_WID);

		if (radius > 100*this.scrRad) {
			const tan = this.center.plus(dir.scale(dif));
			const sideDir = vec2(dir.y, -dir.x);
			const side = this.scrRad;
			const a = tan.plus(sideDir.scale(-side));
			const b = tan.plus(sideDir.scale(+side));
			const c = b.plus(dir.scale(side));
			const d = a.plus(dir.scale(side));
			const n = 200;
			ctx.strokeStyle = strokeColor;
			ctx.beginPath();
			this.moveTo(d);
			for (let i=0; i<=n; ++i) {
				const offset = (2*i/n - 1)*side;
				const base = tan.plus(sideDir.scale(offset));
				const drop = radius - Math.sqrt(radius**2 - offset**2);
				const point = base.plus(dir.scale(drop));
				this.lineTo(point);
			}
			this.lineTo(c);
			this.lineTo(d);
		} else {
			ctx.beginPath();
			ctx.arc(...this.fromCenter(center), radius, 0, TAU);
		}

		if (fillColor !== null) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}
		
		if (strokeColor !== null) {
			ctx.strokeStyle = strokeColor;
			ctx.stroke();
		}

		return this;
	}
	line(a, b, color = null) {
		const aInScr = this.mightBeOnScreen(a);
		const bInScr = this.mightBeOnScreen(b);
		if (aInScr && !bInScr) {
			b = a.plus(b.minus(a).normalized().scale(this.scrDiam));
		}
		if (bInScr && !aInScr) {
			a = b.plus(a.minus(b).normalized().scale(this.scrDiam));
		}
		const { ctx } = this;
		if (color !== null) {
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
		}

		this.lineWidth(DEF_LINE_WID);
		ctx.beginPath();
		this.moveTo(a);
		this.lineTo(b);
		ctx.stroke();

		return this;
	}
	mightBeInScreen([ x, y ]) {
		const { cx, cy, scrRadSqr } = this;
		return (x - cx)**2 + (y - cy)**2 <= scrRadSqr;
	}
	arrow(a, b, color = null) {
		const { ctx } = this;
		if (color !== null) {
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
		}

		const dif = b.minus(a);
		const dist = dif.len();
		const tipSize = Math.min(dist*0.3, DEF_LINE_WID*8);
		const dir = dif.normalized();

		const maxDist = this.scrRad*10;
		if (dist > maxDist) {
			const aInScr = this.mightBeInScreen(a);
			const bInScr = this.mightBeInScreen(b);
			if (aInScr && !bInScr) {
				b = a.plus(dir.scale(maxDist));
			} else if (bInScr && !aInScr) {
				a = b.minus(dir.scale(maxDist));
			}
		}

		this.lineWidth(Math.min(DEF_LINE_WID, 0.1*dist));
		ctx.beginPath();
		this.moveTo(a);
		this.lineTo(b.minus(dir.scale(tipSize*cos30)));
		ctx.stroke();

		const c = b.plus(dir.rot(d150).scale(tipSize));
		const d = b.plus(dir.rot(d210).scale(tipSize));

		ctx.beginPath();
		this.moveTo(b);
		this.lineTo(c);
		this.lineTo(d);
		ctx.fill();
		return this;
	}
	arc(center, radius, a, b, color) {
		const { ctx } = this;
		const [ x, y ] = this.fromCenter(center);
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, radius, -PI/2 + Trig.toRad(a), -PI/2 + Trig.toRad(b), false);
		ctx.stroke();
		return this;
	}
	text(text, pos, color) {
		const [ x, y ] = this.fromCenter(pos);
		const { ctx } = this;
		ctx.fillStyle = color;
		ctx.fillText(text, x, y);
		return this;
	}
	fontSize(value) {
		this.ctx.font = value + 'px arial';
		return this;
	}
	textAlign(type) {
		this.ctx.textAlign = type;
		return this;
	}
	textDirOut(text, pos, dir, gap, color) {
		const { ctx } = this;
		const normal = vec2(0, 1).rot(dir);
		const a = pos.plus(normal.scale(gap));
		const [ nx ] = normal;
		ctx.save();
		ctx.fillStyle = color;
		ctx.textBaseline = 'middle';
		const [ x, y ] = this.fromCenter(a);
		if (nx >= 0) {
			ctx.textAlign = 'left';
			ctx.translate(x, y);
			ctx.rotate(Math.PI*1.5 + Trig.toRad(dir));
			ctx.fillText(text, 0, 0);
		} else {
			ctx.textAlign = 'right';
			ctx.translate(x, y);
			ctx.rotate(Math.PI*0.5 + Trig.toRad(dir));
			ctx.fillText(text, 0, 0);
		}
		ctx.restore();
	}
	textBaseline(type) {
		this.ctx.textBaseline = type;
		return this;
	}
}
