import DrawingContext from './drawing.js';
import * as Scene from './scene.js';

const canvas = document.querySelector('canvas');
const ctx = new DrawingContext(canvas);

let full_screen = true;

const fillScreenWithCanvas = () => {
	if (full_screen) {
		canvas.style.margin = '0px';
		ctx.canvasSize(window.innerWidth, window.innerHeight);
	} else {
		ctx.canvasSize(800, 600);
		canvas.style.marginTop = (innerHeight - 600) >>> 1;
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

Scene.init(ctx);
