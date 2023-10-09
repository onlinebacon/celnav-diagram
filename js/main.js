import DrawingContext from './drawing.js';
import * as Scene from './scene.js';
import * as Tabs from './tabs.js';

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

Tabs.add({
	label: 'Toggles',
});
Tabs.add({
	label: 'Variables',
	onselect: () => {
		document.querySelector('.variables').style.display = 'block';
	},
	onunselect: () => {
		document.querySelector('.variables').style.display = 'none';
	},
});

Scene.init(ctx);
