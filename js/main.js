import * as Script from './script.js';

const canvas = document.querySelector('canvas');

let full_screen = false;

const fillScreenWithCanvas = () => {
	if (full_screen) {
		canvas.style.margin = '0px';
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	} else {
		canvas.width = 800;
		canvas.height = 600;
		canvas.style.marginTop = (innerHeight - 600) >>> 1;
		canvas.style.marginLeft = (innerWidth - 800) >>> 1;
	}
};

fillScreenWithCanvas();

window.addEventListener('resize', fillScreenWithCanvas);

Script.init(canvas);
Script.start();

window.addEventListener('keydown', e => {
	if (e.code === 'KeyF') {
		full_screen = !full_screen;
		fillScreenWithCanvas();
	}
});
