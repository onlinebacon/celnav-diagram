import * as DOM from './dom.js';

const actions = document.querySelector('.actions');

export const add = (name, fn) => {
    const button = DOM.create('button', [ DOM.text(name) ]);
    button.addEventListener('click', fn);
    actions.appendChild(button);
};
