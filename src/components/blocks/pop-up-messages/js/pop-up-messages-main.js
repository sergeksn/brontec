export default class {
    constructor(data) {
        let d = document;

        this.pop_up = d.querySelector('.pop-up-message');
        this.title = this.pop_up.querySelector('.pop-up-message__title');
        this.close_button = this.pop_up.querySelector('.pop-up-message__close-button');
        this.text_block = this.pop_up.querySelector('.pop-up-message__text');

        this.pop_up.classList.add('pop-up-message--' + data.type);
        this.title.innerHTML += data.title;
        this.text_block.innerHTML = data.message;
    }
}
