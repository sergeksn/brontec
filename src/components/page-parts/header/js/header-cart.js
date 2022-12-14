import { show, hide } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';
import { Header, Header_Hidden } from '@header-main-js';

let cart = qs('.cart'),
    header_visible = qs('.header-visible'),
    body = qs('body'),
    header = qs('header'),
    overlay = qs('#cart-overlay'),
    close_button = qs('.cart__header-close-button'),
    CONTROLLER = {
        status: 'hide',
        lock: false,
        Overlay: new Overlay({ el: overlay }), //создаём экземпляр подложки корзины для всего контента сайта

        //открываем/закрываем корзину
        toggle_cart: async function () {
            if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

            Header.active_elements.lock();

            if (this.status === 'hide') {
                await this.open();
            } else if (this.status === 'show') {
                await this.close();
            }

            Header.active_elements.unlock();
        },
        //открываем/закрываем корзину

        //скрываем корзину при свайпе
        swipe_cart: function () {
            cart._on(
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
                    min_px_dist_x: 50, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в % от ширины экрана
                    max_time: 500, //максимальное время, за которое должен быть совершен свайп (ms)

                    //НЕ ЗАБЫТЬ ДОБАВИТЬ В ИСКЛЮЧЕНИЯ все октивные элементы в корзине
                    exceptions_el: [
                        close_button, //кнопка закрытия корзины
                        qs('.cart__footer-promocod>input'), //блок с промокодом т.к. там инпут
                        qs('.cart__footer-design-order'), //кнопка оформленяи заказа
                        qs('.cart__body'), //тело корзины т.к. там нужен нормальный скрол
                    ], //не вызываем свайп если нажали на кнопку закрытия
                },
            );
        },
        //скрываем корзину при свайпе

        //выпоялняем все действия для открытия корзины
        open: async function () {
            overlay.style.top = header_visible.getBoundingClientRect().bottom + 'px'; //опускаем подложку корзины так чтоб всегода было видно постер и верхнюю часть хедера

            body.scrollbar.lock(); //блокируем прокуртку документа
            body.scrollbar.show_scrollbar_space(); //добавляем пространство имитирующее скролбар

            //если открыт блок хедера
            if (Header_Hidden.status === 'open') {
                header.scrollbar.lock(); //блокируем прокуртку хедера перед показом корзины если открыт скрытый блок хедера
            }
            //если открыт блок хедера

            //если закрыт блок хедера
            else {
                header.scrollbar.show_scrollbar_space(); //добавляем пространство имитирующее скролбар
            }
            //если закрыт блок хедера

            let cart_data = w.localStorage.getItem('cart'); //получаем данные карзины

            //если корзина пуста
            if (cart_data === null) {
            }
            //если корзина пуста

            cart.style.transform = 'translateX(100%)'; //для корректной работы анимаци приходится явно задавать смещение т.к. почему-то скрипт не видит значение transform в стилях из таблиц css

            await Promise.all([
                show({
                    el: cart,
                    instance: this,
                    property: 'translateX',
                    value: 0,
                    started_value: cart.clientWidth,
                    units: '%',
                }),
                this.Overlay.show(),
                Scroll_To_Top_Button.hide(),
            ]); //дожидаемся показа корзины и подложки, а так же скрытия кнопки скрола вверх
        },
        //выпоялняем все действия для открытия корзины

        //выпоялняем все действия для закрытия корзины
        close: async function () {
            Scroll_To_Top_Button.toggle_show_button(); //показываем кнопку если нужно, этого не обязательно дожидаться

            await Promise.all([
                hide({
                    el: cart,
                    instance: this,
                    property: 'translateX',
                    value: 100,
                    started_value: 0,
                    units: '%',
                }),
                this.Overlay.hide(),
            ]); //дожидаемся скрытия корзины и подложки

            //если закрыт блок хедера
            if (Header_Hidden.status === 'close') {
                body.scrollbar.unlock(); //разблокируем прокуртку документа
                body.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар
            }
            //если закрыт блок хедера

            header.scrollbar.unlock(); //разблокируем прокуртку хедера
            header.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар
        },
        //выпоялняем все действия для закрытия корзины

        //пересчитываем верхний отступ корзины пре ресайзе
        size_recalculate: function () {
            cart.style.top = GDS.win.width_rem < 40 ? Header.get_header_h({ header_poster: true, header_visible: true }) + 'px' : Header.get_header_h({ header_poster: true }) + 'px'; //при экранах меньше 640 корзину опускеаем к низу видимой части хедера, а если шире то поднимаем к верху видимрой части

            overlay.style.top = header_visible.getBoundingClientRect().bottom + 'px'; //опускаем подложку корзины так чтоб всегода было видно постер и верхнюю часть хедера
        },
        //пересчитываем верхний отступ корзины пре ресайзе

        init: function () {
            [
                qs('.header-visible__cart-button'), //кнопка корзины в хедере
                overlay, //положка корзины на сайте
                close_button, //кнопка закрытия корзины
            ].forEach(item => item._on('click', _ => this.toggle_cart())); //показываем/скрываем корзину при клике

            w._on('resize_throttle load', _ => this.size_recalculate()); //пересчитываем верхний отступ корзины пре ресайзе и при первой загрузке

            this.swipe_cart();
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
