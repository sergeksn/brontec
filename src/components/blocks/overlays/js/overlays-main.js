import { Header, Header_Hidden } from '@header-main-js';
import { show, hide } from '@js-libs/func-kit';

class Overlay_Controller {
    //показывыаем подложку
    show() {
        return show.call(this, {
            el: this.overlay,
            value: this.max_opacity || '0.9',
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

//хранит объект подложки для хедера
const Header_Overlay = new (class {
    constructor() {
        let teplate = new Overlay_Controller(); //объект с функция управления для подложек

        this.status = 'hide';
        this.lock = false; //польностью блокирует любые действия с подложкой
        this.track = 'header-overlay'; //нужно для того чтоб помечать ошибки в фушкциях show/hide
        this.overlay = document.getElementById('header-overlay'); //полупрозрачная бела подложка для хедера

        //записываем в методы этого класса нужные методы классаконтролера
        this.show = teplate.show.bind(this);
        this.hide = teplate.hide.bind(this);

        this.overlay._on('click touchend', () => {
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
})();
//хранит объект подложки для хедера

//хранит объект подложки для всплывающих окон с сообщениями
const Pop_Up_Message_Overlay = class {
    constructor() {
        let teplate = new Overlay_Controller(); //объект с функция управления для подложек

        this.status = 'hide';
        this.lock = false; //польностью блокирует любые действия с подложкой
        this.track = 'pop-up-message-overlay'; //нужно для того чтоб помечать ошибки в фушкциях show/hide
        this.overlay = document.getElementById('pop-up-message-overlay'); //полупрозрачная бела подложка для всплывающего окна с сообщением

        //записываем в методы этого класса нужные методы классаконтролера
        this.show = teplate.show.bind(this);
        this.hide = teplate.hide.bind(this);

        this.overlay._on('click touchend', () => {
            if (this.lock) return; //прерываем если заблокированная любая активность

            this.click_header_overlay(); //скрываем скрытый блок по клику на полупрозрачную подложку
        }); //скрываем скрытый блок хедера при кдике на фоновую подложку
    }
};
//хранит объект подложки для всплывающих окон с сообщениями

//хранит объект подложки для корзины
const Cart_Overlay = new (class {
    constructor() {
        let teplate = new Overlay_Controller(); //объект с функция управления для подложек

        this.status = 'hide';
        this.lock = false; //польностью блокирует любые действия с подложкой
        this.track = 'cart-overlay'; //нужно для того чтоб помечать ошибки в фушкциях show/hide
        this.overlay = document.getElementById('cart-overlay'); //полупрозрачная бела подложка для корзины

        //записываем в методы этого класса нужные методы классаконтролера
        this.show = teplate.show.bind(this);
        this.hide = teplate.hide.bind(this);

        // this.overlay.style.height = GDS.win.height + 'px'; //задаём высоту подложке равную высоте экрана

        // $(window).on({
        //     events: 'resize_optimize',
        //     callback: () => this.overlay.css('height', GDS.win_height + 'px'),
        // }); //при ресайзах пересчитываем и задаём высоту по новой
    }
})();
//хранит объект подложки для корзины

//хранит объект подложки для картинок открых в полный экран в галереи
const Galery_Overlay = new (class {})();
//хранит объект подложки для картинок открых в полный экран в галереи

//хранит объект подложки для окна предпросмотра отдельной детали комплекта
const Product_Part_Previwe_Overlay = new (class {})();
//хранит объект подложки для окна предпросмотра отдельной детали комплекта

export { Header_Overlay, Pop_Up_Message_Overlay, Cart_Overlay, Galery_Overlay, Product_Part_Previwe_Overlay };
