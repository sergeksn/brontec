import { Header_Search } from '@header-main-js';
import { wait } from '@js-libs/func-kit';

class Overlay_Controller {
    //показывыаем подложку
    async show() {
        if (this.status === 'show' || this.status === 'pending to show') return; //если видна или в процессе показа то не нужно снова начинать показывать

        this.status = 'pending to show';

        this.overlay.style.display = 'block';

        let style_list = window.getComputedStyle(this.overlay);

        await wait(() => style_list.display, 'block', { value: this.track }) //нужно добалять т.к. свойство display применяя одновременно с opacity не сработает как нужно, т.к. применятся одновременно, а нам нужно по очереди чтоб было плавное появление через transition
            .then(async () => {
                this.overlay.style.opacity = '0.9';

                await wait(() => style_list.opacity, '0.9', { value: this.track })
                    .then(() => {
                        this.status = 'show';
                    })
                    .catch(() => {});
            })
            .catch(() => {});
    }
    //показывыаем подложку

    //скрываем подложку
    async hide() {
        if (this.status === 'hide' || this.status === 'pending to hide') return; //если скрыта или в процессе скрытия то не нужно пытаться скрывать снова

        this.status = 'pending to hide';

        let style_list = window.getComputedStyle(this.overlay);

        this.overlay.style.opacity = '0';

        await wait(() => style_list.opacity, '0', { value: { value: this.track } })
            .then(() => {
                this.overlay.style.display = '';
                this.status = 'hide';
            })
            .catch(() => {});
    }
    //скрываем подложку
}

//хранит объект подложки для хеднера
const Header_Overlay = new (class {
    //pending to hide - в процессе скрытия
    //hide - скрыто
    //pending to show - в процессе появления
    //show - видно
    status = 'hide';

    track = 'header-overlay'; //нужно для track в событиях show/hide

    overlay = document.getElementById('header-overlay'); //полупрозрачная бела подложка для хедера

    constructor() {
        let teplate = new Overlay_Controller(); //объект с функция управления для подложек

        //записываем в методы этого класса нужные методы классаконтролера
        this.show = teplate.show.bind(this);
        this.hide = teplate.hide.bind(this);

        this.overlay._on("click touchend", Header_Search.click_header_overlay.bind(Header_Search));//скрываем скрытый блок хедера при кдике на фоновую подложку
    }
})();
//хранит объект подложки для хеднера

//хранит объект подложки для корзины
const Cart_Overlay = new (class {
    //pending to hide - в процессе скрытия
    //hide - скрыто
    //pending to show - в процессе появления
    //show - видно
    status = 'hide';

    track = 'cart-overlay'; //нужно для track в событиях show/hide

    overlay = document.getElementById('cart-overlay'); //полупрозрачная бела подложка для корзины

    constructor() {
        let teplate = new Overlay_Controller(); //объект с функция управления для подложек

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

export { Header_Overlay, Cart_Overlay, Galery_Overlay, Product_Part_Previwe_Overlay };
