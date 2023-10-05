import * as Trig from './trig.js';

const { sqrt } = Math;

class Vec2 extends Array {
	constructor(x, y) {
		super(2);
		this[0] = x;
		this[1] = y;
	}
	get x() { return this[0]; }
	get y() { return this[1]; }
	set x(val) { this[0] = val; }
	set y(val) { this[1] = val; }
	len() {
		const [ x, y ] = this;
		return sqrt(x**2 + y**2);
	}
	plus([ x, y ]) {
		return new Vec2(this.x + x, this.y + y);
	}
	minus([ x, y ]) {
		return new Vec2(this.x - x, this.y - y);
	}
	scale(val) {
		const [ x, y ] = this;
		return new Vec2(x*val, y*val);
	}
	normalized() {
		return this.scale(1/this.len());
	}
	rot(angle) {
		const sin = Trig.sin(angle);
		const cos = Trig.cos(angle);
		const [ x, y ] = this;
		return new Vec2(x*cos + y*sin, y*cos - x*sin);
	}
	interpolate(other, t) {
		const [ x0, y0 ] = this;
		const [ x1, y1 ] = other;
		return new Vec2(x0 + (x1 - x0)*t, y0 + (y1 - y0)*t);
	}
}

export const vec2 = (x, y) => new Vec2(x, y);
