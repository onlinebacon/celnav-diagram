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

Tabs.add('Toggles', '.toggles');
Tabs.add('Variables', '.variables');
Tabs.add('Actions', '.actions', true);

Toggles.create('Earth', 'earth', true);
Toggles.create('Observer', 'observer', true);
Toggles.create('Plumb', 'down', true);
Toggles.create('Zenith', 'up', true);
Toggles.create('GP', 'gp', true);
Toggles.create('Star', 'star', true);
Toggles.create('Star Sight', 'star_sight', true);
Toggles.create('Star GP sight', 'star_gp_sight', true);
Toggles.create('Star GP', 'star_gp', true);
Toggles.create('Horizon', 'hrz', true);
Toggles.create('Sextant', 'sextant', true);
Toggles.create('GP distance', 'arc', true);
Toggles.create('Horizontal', 'horizontal', true);

Scene.init(ctx);

window.addEventListener('keydown', e => {
	const { code } = e;
	const focused = document.querySelector('input[type="text"]:focus');
	if (!focused && code.startsWith('Digit')) {
		const digit = code.replace('Digit', '');
		const index = digit === '0' ? 9 : digit - 1;
		const e = document.querySelectorAll('.tabs button')[index];
		if (e && !DOM.hasClass(e, 'selected')) {
			e.click();
		}
	}
	if (!focused && code.startsWith('Numpad')) {
		const digit = code.replace('Numpad', '');
		const index = digit === '0' ? 9 : digit - 1;
		const e = document.querySelectorAll('.tab-content:not(.hidden) button')[index];
		if (e && !DOM.hasClass(e, 'selected')) {
			e.click();
		}
	}
});

window.addEventListener('wheel', e => {
	const { deltaY } = e;
	if (deltaY > 0) {
		Vars.slide('scale', 0.005);
	}
	if (deltaY < 0) {
		Vars.slide('scale', -0.005);
	}
});
