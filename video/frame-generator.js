import * as fs from 'fs';
import * as Script from '../js/script.js';
import * as Video from '../js/video.js';
import { createCanvas } from 'canvas';
import * as cliProgress from 'cli-progress';

const canvas = createCanvas(400, 300);

Script.init(canvas);

const fps = 15;
const totalTime = Video.endTime();
const totalFrames = Math.ceil(totalTime*(fps/1000));
const frameDuration = totalTime/totalFrames;

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar.start(totalFrames, 0);

const nSize = totalFrames.toString().length;

for (let i=0; i<totalFrames; ++i) {
	const n = i + 1;
	const t = Math.round(i*frameDuration);
	const fname = `./frames/frame-${n.toString().padStart(nSize, '0')}.png`;
	Video.moveForwardTo(t);
	fs.writeFileSync(fname, canvas.toBuffer('image/png'));
	bar.update(n);
}

bar.stop();
