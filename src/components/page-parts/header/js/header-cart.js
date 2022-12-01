import { show, hide, anime } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';

import { Header, Header_Poster, Header_Hidden, Header_Search } from '@header-main-js';

export default new (class {
    constructor() {
        this.cart = d.querySelector('.cart');
        this.cart_body = d.querySelector('.cart__body');
        this.header_visible = d.querySelector('.header-visible'); //постоянно видимая часть меню
        this.body = d.getElementsByTagName('body')[0];
        this.header = d.getElementsByTagName('header')[0];
        this.overlay_common = d.getElementById('cart-overlay-common'); //положка корзины на сайте
        this.overlay_header_hidden = d.getElementById('cart-overlay-header-hidden'); //положка корзины в хедере при его открытии
        this.close_button = d.querySelector('.cart__close-button');

        this.Overlay_Common = new Overlay({ el: this.overlay_common }); //создаём экземпляр подложки корзины для всего контента сайта
        this.Overlay_Header_Hidden = new Overlay({ el: this.overlay_header_hidden }); //создаём экземпляр подложки корзины для скрытого блока хедера

        this.lock = false;
        this.status = 'hide';

        [
            d.querySelector('.header-visible__cart-button>button'), //кнопка корзины в хедере
            this.overlay_common, //положка корзины на сайте
            this.overlay_header_hidden, //положка корзины в хедере при его открытии
            this.close_button, //кнопка закрытия корзины
        ].forEach(item => item._on('click', e => this.toggle_cart())); //показываем/скрываем корзину при клике

        w._on('resize_throttle load', e => this.size_recalculate()); //пересчитываем верхний отступ корзины пре ресайзе и при первой загрузке

        this.swipe_cart();
    }

    //открываем/закрываем корзину
    async toggle_cart() {
        if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

        Header.active_elements.lock();

        if (this.status === 'hide') {
            await this.open_cart();
        } else if (this.status === 'show') {
            await this.close_cart();
        }

        Header.active_elements.unlock();
    }
    //открываем/закрываем корзину

    //скрываем корзину при свайпе
    swipe_cart() {
        this.cart._on(
            'swipe',
            () => this.toggle_cart(),
            {},
            {
                permission_directions: {
                    top: false,
                    right: true,
                    bottom: false,
                    left: false,
                }, //направления в которых нужно учитывать свайп
                mouse_swipe: false,
                min_percent_dist_x: 30, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в % от ширины экрана
                max_time: 500, //максимальное время, за которое должен быть совершен свайп (ms)

                //НЕ ЗАБЫТЬ ДОБАВИТЬ В ИСКЛЮЧЕНИЯ все октивные элементы в корзине
                exceptions_el: [this.close_button], //не вызываем свайп если нажали на кнопку закрытия
            },
        );
    }
    //скрываем корзину при свайпе

    //выпоялняем все действия для открытия корзины
    async open_cart() {
        this.body.classList.add('lock-scroll'); //блокируем прокуртку документа перед показом корзины

        //if (Header_Search.status === 'open' || (Header_Search.status === 'close' && Header_Hidden.status === 'open' && Header_Hidden.size === 'full')) this.header.style.overflowY = 'hidden'; //блокируем прокуртку хедера

        Header_Hidden.size_recalculate();
        console.log(Header_Hidden.size);

        let cart_data = w.localStorage.getItem('cart'); //получаем данные карзины

        //если корзина пуста
        if (cart_data === null) {
        }
        //если корзина пуста

        await Promise.all([this.show(), this.Overlay_Common.show(), this.Overlay_Header_Hidden.show(), Scroll_To_Top_Button.hide()]); //дожидаемся показа корзины и подложки, а так же скрытия кнопки скрола вверх
    }
    //выпоялняем все действия для открытия корзины

    //выпоялняем все действия для закрытия корзины
    async close_cart() {
        Scroll_To_Top_Button.toggle_show_button(); //показываем кнопку если нужно, этого не обязательно дожидаться

        await Promise.all([this.hide(), this.Overlay_Common.hide(), this.Overlay_Header_Hidden.hide()]); //дожидаемся скрытия корзины и подложки

        //this.header.style.overflowY = ''; //разблокируем прокуртку хедера
        if (Header_Hidden.status === 'close') this.body.classList.remove('lock-scroll'); //разблокируем прокуртку документа
    }
    //выпоялняем все действия для закрытия корзины

    //показываем корзину
    show() {
        this.cart.style.transform = 'translateX(100%)'; //для корректной работы анимаци приходится явно задавать смещение т.к. почему-то скрипт не видит значение transform в стилях из таблиц css

        return show.call(this, {
            el: this.cart,
            property: 'translateX',
            value: 0,
            started_value: this.cart.clientWidth,
            display: null,
            units: '%',
        });
    }
    //показываем корзину

    //скрываем корзину
    hide() {
        return hide.call(this, {
            el: this.cart,
            property: 'translateX',
            value: 100,
            started_value: 0,
            display: null,
            units: '%',
        });
    }
    //скрываем корзину

    //пересчитываем верхний отступ корзины пре ресайзе
    size_recalculate() {
        this.cart.style.top = GDS.win.width_rem < 40 ? Header.get_header_h({ header_poster: true, header_visible: true }) + 'px' : Header.get_header_h({ header_poster: true }) + 'px'; //при экранах меньше 640 корзину опускеаем к низу видимой части хедера, а если шире то поднимаем к верху видимрой части
    }
    //пересчитываем верхний отступ корзины пре ресайзе
})();
