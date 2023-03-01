import { show, hide } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';
import { Header, Header_Hidden } from '@header-main-js';
import Pop_Up_Message from '@pop-up-messages-main-js';
import Spoiler from '@js-moduls/spoiler';

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

            if (this.lock) return; //прерываем возможность показывать/скрывать корзину если она заблокированна

            Header.active_elements.lock();

            if (this.status === 'hide') {
                await this.open();
            } else if (this.status === 'show') {
                await this.close();
            }

            Header.active_elements.unlock();
        },
        //открываем/закрываем корзину

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

            Scroll_To_Top_Button.toggle_show_button(); //показываем кнопку если нужно, этого не обязательно дожидаться

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

        //срабатывает когда мы вводим промокод в инпуте
        // inputed_promocode: function (e) {
        //     this.promocode_button.style.display = e.target.value.length > 0 ? 'flex' : 'none';
        // },
        //срабатывает когда мы вводим промокод в инпуте

        //срабатывает при клике на кнопку применения промокода и запускает проверку правильности промокода, а так же если промокод верен тот применяет скидку к итоговой сумме
        // run_promocode: async function () {
        //     if (this.promocode_input.disabled) return; //если инпут заблокирован ничего не делаем т.к. сейчас судя по всему обрабатывается промокод введённые ранее
        //     let promocod = this.promocode_input.value; //записываем сам промокод

        //     //блокируем инпут промокода
        //     this.promocode_input.classList.add('wait-handle-promocode');
        //     this.promocode_input.disabled = true;
        //     //блокируем инпут промокода

        //     //блокируем кнопку проверки промокода
        //     this.promocode_button.classList.add('button-main--disabled');
        //     this.promocode_button.textContent = 'Проверяем промокод ...';
        //     //блокируем кнопку проверки промокода

        //     //блокируем кнопку оформленяи заказа
        //     this.order_button.classList.add('button-main--disabled');
        //     this.order_button.onclick = e => e.preventDefault(); //блокирыем переход на страницу оформленяи заказа через кнопку
        //     //блокируем кнопку оформленяи заказа

        //     let request_data = {
        //         //запрос на сервер
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json;charset=utf-8' },
        //         body: JSON.stringify({
        //             action: 'check_promocod_and_get_new_prises',
        //             data: promocod,
        //         }),
        //     };

        //     //отправляем запрос на сервер что отправить сообщение и выводим соответсвующие всплывающие окна
        //     await fetch(GDS.ajax_url, request_data)
        //         .then(response => response.json()) //считываем переданные данные
        //         .then(result => {
        //             //тут бдуем обрабатывать полученные данные

        //         })
        //         .catch(e => {
        //             new Pop_Up_Message({
        //                 title: 'Ошибка',
        //                 message: 'Не удалось проверить промокод попробуйте позже =(',
        //                 type: 'error',
        //             });
        //             console.error(e);
        //         });

        //     //разблокируем кнопку отвормления заказа
        //     this.order_button.classList.remove('button-main--disabled');
        //     this.order_button.onclick = null;
        //     //разблокируем кнопку отвормления заказа

        //     //разблокируем инпут промокода
        //     this.promocode_input.classList.remove('wait-handle-promocode');
        //     this.promocode_input.disabled = false;
        //     //разблокируем инпут промокода
        // },
        //срабатывает при клике на кнопку применения промокода и запускает проверку правильности промокода, а так же если промокод верен тот применяет скидку к итоговой сумме

        render_cart: function(){
//сравнимать массивы приводя их в строковый вид и стравнивать равны ли их строковые версии и если равны то это одинаковые комплектации товара для даннйо марки и модели
        },

        init: function () {
            [
                qs('.header-hidden__menu-cart-button'), //кнопка корзины в мобильном меню
                qs('.footer__menu-cart-button'), //кнопка корзины в меню футера
                qs('.header-visible__cart-button'), //кнопка корзины в хедере
                overlay, //положка корзины на сайте
                close_button, //кнопка закрытия корзины
            ].forEach(item => item._on('click', _ => this.toggle_cart())); //показываем/скрываем корзину при клике

            w._on('resize_throttle load', _ => this.size_recalculate()); //пересчитываем верхний отступ корзины пре ресайзе и при первой загрузке

            // this.cart_footer = qs('.cart__footer'); //низ корзины
            // this.promocode_input = qs('.cart__footer-promocod-input input'); //инпут для ввода промокода
            // this.promocode_button = qs('.cart__footer-promocod-button'); //кнопка для приминения промокода
            // this.order_button = qs('.cart__footer-design-order'); //кнопка для перехода на страницу оформления заказа

            // this.promocode_input._on('input', this.inputed_promocode.bind(this)); //срабатывает когда мы вводим промокод в инпуте

            // this.promocode_button._on('click', this.run_promocode.bind(this)); //срабатывает при клике на кнопку применения промокода и запускает проверку правильности промокода, а так же если промокод верен тот применяет скидку к итоговой сумме

            this.render_cart();//функция проверяет локальное хранилище и если там что-то записано для корзины то ренедерт эти товары
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
