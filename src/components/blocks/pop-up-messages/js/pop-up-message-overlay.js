import { show, hide } from '@js-libs/func-kit';

export default class {
    constructor(overlay) {
        this.status = 'hide';
        this.lock = false; //польностью блокирует любые действия с подложкой
        this.overlay = overlay; //полупрозрачная бела подложка для хедера
    }

    //показывыаем подложку
    show(opacity = 0.5) {
        return show.call(this, {
            el: this.overlay,
            value: opacity,
        });
    }
    //показывыаем подложку

    //скрываем подложку
    hide() {
        return hide.call(this, {
            el: this.overlay,
        });
    }
    //скрываем подложку
}
