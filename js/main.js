import DrawingContext from './drawing.js';
import * as Scene from './scene.js';
import * as Tabs from './tabs.js';
import * as Toggles from './toggles.js';

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

window.addEventListener('keydown', e => {
	if (e.code === 'KeyF') {
		full_screen = !full_screen;
		fillScreenWithCanvas();
	}
});

Tabs.add('Toggles', '.toggles', true);
Tabs.add('Variables', '.variables');
Tabs.add('Actions', '.actions');

Toggles.create('Earth', 'earth', true);
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
Toggles.create('GP distance', 'arc', false);

Scene.init(ctx);
