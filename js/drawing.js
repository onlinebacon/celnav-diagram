import * as Trig from './trig.js';
import { vec2 } from './vec2.js';

const TAU = Math.PI*2;
const DEF_LINE_WID = 1;
const DEF_SPOT_RAD = DEF_LINE_WID*1.5;

export default class DrawingContext {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.setDimensions(800, 600);
		this.ctx.lineCap = 'round';
	}
	setDimensions(width, height) {
		this.w = width;
		this.h = height;
		return this;
	}
	__project([ x, y ]) {
		const { w, h, canvas } = this;
		const { width, height } = canvas;
		const s = height/h;
		y = height - y*s;
		x = (width - w*s)/2 + x*s;
		return [ x, y ];
	}
	__scale(val) {
		const { h, canvas } = this;
		const { height } = canvas;
		const s = height/h;
		return s*val;
	}
	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		return this;
	}
	moveTo(vec) {
		this.ctx.moveTo(...this.__project(vec));
		return this;
	}
	lineTo(vec) {
		this.ctx.lineTo(...this.__project(vec));
		return this;
	}
	lineWidth(val) {
		this.ctx.lineWidth = this.__scale(val);
		return this;
	}
	spot(pos, color = null) {
		const { ctx } = this;
		if (color != null) {
			ctx.fillStyle = color;
		}
		ctx.beginPath();
		ctx.arc(...this.__project(pos), this.__scale(DEF_SPOT_RAD), 0, TAU);
		ctx.fill();
		return this;
	}
	star(pos, radius, color = null) {
		const { ctx } = this;
		if (color != null) {
			ctx.fillStyle = color;
		}
		const [ cx, cy ] = this.__project(pos);
		const r2 = this.__scale(radius);
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
		const { ctx } = this;

		this.lineWidth(DEF_LINE_WID);
		ctx.beginPath();
		ctx.arc(...this.__project(center), this.__scale(radius), 0, TAU);

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
		const { ctx } = this;
		if (color !== null) {
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
		}

		const dif = b.minus(a);
		const dist = dif.len();

		this.lineWidth(Math.min(DEF_LINE_WID, 0.1*dist));
		ctx.beginPath();
		this.moveTo(a);
		this.lineTo(b);
		ctx.stroke();

		return this;
	}
	arrow(a, b, color = null) {
		const { ctx } = this;
		if (color !== null) {
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
		}

		const dif = b.minus(a);
		const dist = dif.len();
		const tipSize = Math.min(dist*0.3, 8);
		const dir = dif.normalized();

		this.lineWidth(Math.min(DEF_LINE_WID, 0.1*dist));
		ctx.beginPath();
		this.moveTo(a);
		this.lineTo(b.minus(dir.scale(tipSize/2)));
		ctx.stroke();

		const c = b.plus(dir.rot(Trig.deg(150)).scale(tipSize));
		const d = b.plus(dir.rot(Trig.deg(210)).scale(tipSize));

		ctx.beginPath();
		this.moveTo(b);
		this.lineTo(c);
		this.lineTo(d);
		ctx.fill();
		return this;
	}
	arc(center, radius, a, b, color) {
		const { ctx } = this;
		const [ x, y ] = this.__project(center);
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, this.__scale(radius), -Trig.toRad(a), -Trig.toRad(b), true);
		ctx.stroke();
		return this;
	}
	coordOf([ x, y ]) {
		const { w, h, canvas } = this;
		const { width, height } = canvas;
		const s = h/height;
		y = (height - y)*s;
		x = x*s + (w - width*s)/2;
		return vec2(x, y);
	}
	comment(lines) {
		const { ctx } = this;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = '#aaa';
		let space = this.__scale(10);
		let size = this.__scale(20);
		const stride = space + size;
		ctx.font = size + 'px arial';
		for (let i=0; i<lines.length; ++i) {
			const line = lines[lines.length - 1 - i];
			ctx.fillText(line, this.canvas.width/2, this.canvas.height - (space + stride*i));
		}
		return this;
	}
}
