import { show, hide } from '@js-libs/func-kit';
import { Header, Header_Hidden } from './header-main';

export default new (class {
    constructor() {
        this.status = 'hide';
        this.lock = false; //польностью блокирует любые действия с подложкой
        this.overlay = d.getElementById('header-overlay'); //полупрозрачная бела подложка для хедера

        this.overlay._on('click', () => {
            if (this.lock) return; //прерываем если заблокированная любая активность

            this.click_header_overlay(); //скрываем скрытый блок по клику на полупрозрачную подложку
        }); //скрываем скрытый блок хедера при кдике на фоновую подложку
    }

    //скрываем окно поиска по клику на полупрозрачную подложку
    async click_header_overlay() {
        if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

        Header.active_elements.lock(); //блокируем активные элементы в хедере

        await Header_Hidden.close(); //закрываем окно поиска

        Header.active_elements.unlock(); //разблокируем активные элементы в хедере
    }
    //скрываем окно поиска по клику на полупрозрачную подложку

    //показывыаем подложку
    show() {
        return show.call(this, {
            el: this.overlay,
            value: 0.9,
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
})();
