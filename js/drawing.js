import * as Trig from './trig.js';
import { vec2 } from './vec2.js';

const { PI } = Math;
const TAU = PI*2;
const DEF_LINE_WID = 2;
const DEF_SPOT_RAD = DEF_LINE_WID*1.5;

export default class DrawingContext {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.bgColor = '#111';
		this.canvasSize(canvas.width, canvas.height);
		this.setCenter(0, 0);
		this.scale = 1;
	}
	canvasSize(width, height) {
		const { canvas } = this;
		canvas.width = width;
		canvas.height = height;
		return this;
	}
	setCenter(x, y) {
		this.cx = x;
		this.cy = y;
		return this;
	}
	unscaled(value) {
		return value/this.scale;
	}
	__project([ x, y ]) {
		const { canvas, cx, cy, scale } = this;
		x = canvas.width/2 + (x - cx)*scale;
		y = canvas.height/2 - (y - cy)*scale;
		return [ x, y ];
	}
	__scale(val) {
		return val*this.scale;
	}
	clear() {
		this.ctx.fillStyle = this.bgColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
		this.ctx.lineWidth = val;
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
		const tipSize = Math.min(dist*0.3, DEF_LINE_WID*8);
		const dir = dif.normalized();

		this.lineWidth(Math.min(DEF_LINE_WID, 0.1*dist));
		ctx.beginPath();
		this.moveTo(a);
		this.lineTo(b.minus(dir.scale(tipSize*Trig.cos(Trig.deg(30)))));
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
		ctx.arc(x, y, this.__scale(radius), -PI/2 + Trig.toRad(a), -PI/2 + Trig.toRad(b), false);
		ctx.stroke();
		return this;
	}
	coordOf([ x, y ]) {
		const { ax, bx, ay, by } = this;
		return vec2((x - bx)/ax, (y - by)/ay);
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
	text(text, pos, color) {
		const [ x, y ] = this.__project(pos);
		const { ctx } = this;
		ctx.fillStyle = color;
		ctx.fillText(text, x, y);
		return this;
	}
	fontSize(value) {
		this.ctx.font = this.__scale(value) + 'px arial';
		return this;
	}
	textAlign(type) {
		this.ctx.textAlign = type;
		return this;
	}
	textBaseline(type) {
		this.ctx.textBaseline = type;
		return this;
	}
}
