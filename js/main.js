import DrawingContext from './drawing.js';
import * as DOM from './dom.js';
import * as Scene from './scene.js';
import * as Tabs from './tabs.js';
import * as Toggles from './toggles.js';
import * as Vars from './variables.js';

const canvas = document.querySelector('canvas');
const ctx = new DrawingContext(canvas);

let full_screen = true;

const fillScreenWithCanvas = () => {
	if (full_screen) {
		canvas.style.margin = '40px 0px 0px 0px';
		ctx.canvasSize(window.innerWidth, window.innerHeight - 40);
	} else {
		ctx.canvasSize(800, 600);
		canvas.style.marginTop = 40 + ((innerHeight - 600) >>> 1);
		canvas.style.marginLeft = (innerWidth - 800) >>> 1;
	}
};

fillScreenWithCanvas();

window.addEventListener('resize', fillScreenWithCanvas);

Tabs.add('Toggles', '.toggles', true);
Tabs.add('Variables', '.variables');
Tabs.add('Actions', '.actions');

Toggles.create('Observer', 'observer', false);
Toggles.create('Plumb', 'down', false);
Toggles.create('Zenith', 'up', false);
Toggles.create('GP', 'gp', false);
Toggles.create('Star', 'star', false);
Toggles.create('Star Sight', 'star_sight', false);
Toggles.create('Star GP sight', 'star_gp_sight', false);
Toggles.create('Star GP', 'star_gp', false);
Toggles.create('Horizon', 'hrz', false);
Toggles.create('Sextant', 'sextant', false);
Toggles.create('GP to GP arc', 'arc', false);
Toggles.create('GP distance', 'gp_dist', false);
Toggles.create('Horizontal', 'horizontal', false);
Toggles.create('Horizon radius', 'hrz_rad', false);
Toggles.create('Radius', 'radius', false);
Toggles.create('Observer height', 'obs_height', false);

Scene.init(ctx);

window.addEventListener('keydown', e => {
	const { code } = e;
	const focused = document.querySelector('input[type="text"]:focus');
	if (focused) {
		return;
	}
	if (code.startsWith('Digit')) {
		const digit = code.replace('Digit', '');
		const index = digit === '0' ? 9 : digit - 1;
		const e = document.querySelectorAll('.tabs button')[index];
		if (e && !DOM.hasClass(e, 'selected')) {
			e.click();
		}
	}
	if (code.startsWith('Numpad')) {
		const digit = code.replace('Numpad', '');
		const index = digit === '0' ? 9 : digit - 1;
		const e = document.querySelectorAll('.tab-content:not(.hidden) button')[index];
		if (e && !DOM.hasClass(e, 'selected')) {
			e.click();
		}
	}
	if (code === 'KeyA') {
		Toggles.all();
	}
});

window.addEventListener('wheel', e => {
	const { deltaY } = e;
	if (deltaY > 0) {
		Vars.slide('scale', -0.005);
	}
	if (deltaY < 0) {
		Vars.slide('scale', 0.005);
	}
});
