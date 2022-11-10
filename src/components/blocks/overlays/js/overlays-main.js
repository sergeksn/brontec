import { Header, Header_Hidden } from '@header-main-js';
import { wait } from '@js-libs/func-kit';

class Overlay_Controller {
    //показывыаем подложку
    async show() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

        if (this.status === 'show') return; //если подложка уже видна сразу завершаем

        //данное ожидание будет прервано только если подложка начнёт скрываться
        if (this.status === 'pending to show') return await wait(() => this.status, 'show', { func: () => this.status === 'pending to hide' || this.status === 'hide', message: 'ждали пока ' + this.track + ' станет SHOW но начал скрываться' }); //ждём пока подложка не станет полностью видимой и только потом завершаем

        this.status = 'pending to show'; //помечаем что подложка начала показ

        this.overlay.style.display = 'block'; //возвращаем подложку в документ

        let sl = window.getComputedStyle(this.overlay); //живая колекция стилей подложки

        await wait(() => sl.display, 'block', { func: () => this.status !== 'pending to show', message: 'ждали пока ' + this.track + ' станет BLOCK но начал скрываться' }); //ждём пока подложка не станет block

        let opacity = this.max_opacity || '0.9';

        this.overlay.style.opacity = opacity; //делаем подложку видимой

        await wait(() => sl.opacity, opacity, { func: () => this.status !== 'pending to show', message: 'ждали пока ' + this.track + ' станет OPACITY 0.9 но  начал скрываться' }); //ждём пока подложка не станет видимой на 0.9

        this.status = 'show'; //помечаем что подложка видна
    }
    //показывыаем подложку

    //скрываем подложку
    async hide() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

        if (this.status === 'hide') return; //если подложка уже скрыта сразу завершаем

        //данное ожидание будет прервано только если подложка начнёт появляться
        if (this.status === 'pending to hide') return await wait(() => this.status, 'hide', { func: () => this.status === 'pending to show' || this.status === 'show', message: 'ждали пока ' + this.track + ' станет HIDE но начал появляться' }); //ждём пока кнопка не станет полностью скрытой и только потом завершаем

        this.status = 'pending to hide'; //помечаем что подложка начала скрываться

        this.overlay.style.opacity = '0'; //делаем подложку прозрачной

        let sl = window.getComputedStyle(this.overlay); //живая колекция стилей подложки

        await wait(() => sl.opacity, '0', { func: () => this.status !== 'pending to hide', message: 'ждали пока ' + this.track + ' станет OPACITY 0 но  начал появляться' }); //ждём пока подложка не станет полностью прозрачной

        this.overlay.style.display = ''; //после того как подложка полностью стала прозрачной убираем её из документа чтоб на неё прозрачную нельзя было кликнуть, т.е. чтоб она не перекрывала контент

        this.status = 'hide'; //помечаем что подложка скрыта
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
const Pop_Up_Message_Overlay = new (class {
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
})();
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
