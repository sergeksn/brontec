import { Header_Cart } from '@header-main-js';
import { base_spoiler_fade } from '@js-moduls/spoiler';
import Fade from '@js-moduls/fade';

let cart = qs('.cart'), //корзинаH
    order_spoiler_title = qs('.oformit-zakaz-1__you-order h2'), //элемент для открытия/закрытия спойлера заказа на экранах меньше 640px
    order_spoiler_content_wrap = qs('.oformit-zakaz-1__you-order-spoiler-wrap'), //оболочка спойлера заказа
    order_spoiler_content = qs('.oformit-zakaz-1__you-order-spoiler-wrap-content'), //контент спойлера заказа
    order_loader = qs('.oformit-zakaz-1__you-order-loader'), //лоадер блока заказа которые показываемтся в моменты обновляений и синхронизаций
    order_empty_cart_message = qs('.oformit-zakaz-1__you-order-empty-cart'), //блок сообщения что корзина пустая
    order_zero_cart_price_message = qs('.oformit-zakaz-1__you-order-zero-cart-price'), //блок сообщения что цена товарво в корзине равна нулю
    order_zero_cart_price_message_button = qs('.oformit-zakaz-1__you-order-zero-cart-price button'), //нопка перехода в корзину в блоке сообщения что цена товаров в корзине равна нулю
    CONTROLLER = {
        init: function () {
            w._on('load', Header_Cart.check_actual_cart_data.bind(Header_Cart)); //после загрузки страницы проверяем актуальны ли данные которые мы отобразили или их нужно обновить

            cart._on('update-cart-cata', this.update_order_data.bind(this)); //запускает обнволение данных заказа после обновления данных в корзине, может вызываться про проверке актуальности данных в базе или просто поле изменения или добавленяи нового товара в корзину

            w._on('storage', this.storage_cart_update_listener.bind(this)); //следим за изменения в локальном хранилище, и если обвновились данные корзины то перерендереваем данные на странице заказа

            this.spoiler_order_init(); //создаёт контролер спойлера и прозрачности для блока заказа который будет работать только на экрнах меньше 640px

            this.info_blocks_init(); //функция создаёт контролеры и вешает небходимые обрабочики на кнопки у информационных блоков таких как лоадер заказа, сообщений что корзина пуста или цена товаров в корзине равно нулю

            this.update_order_product_spoilers(); //функция подключает спойлеры к каждому блоку сотава товаров в заказе

            //при ресайзе обновляе статус видимости спойлера состава заказа
            w._on('resize_optimize', function () {
                if (GDS.win.width_rem <= 40) order_spoiler_content.ksn_fade.update_status();
            });
            //при ресайзе обновляе статус видимости спойлера состава заказа
        },

        //срабатывает когда нужно обновить данные заказа, может вызываться про проверке актуальности данных в базе или просто поле изменения или добавленяи нового товара в корзину
        update_order_data: async function (e) {
            let detail = e?.detail,
                data_base_update = detail?.data_base_update ?? false, //обновление было вызвано после синхронизации с базой и тогда нужно показать лоадер на секунду, по умолчанию это не обновление с базой
                important = detail?.important ?? true; //это важное обновление и нужно обновить данные на странице заказа, по умолчанию оно важное

            if (!important) return; //если обнволение было не важным прерываем обновление данных на странице заказа

            //если обновление связано с обновление в базе
            if (data_base_update) {
                order_loader.style.pointerEvents = 'auto'; //перекрываем лодером любые взаимодействия с блоком заказа
                await order_loader.ksn_fade.fade_show(); //показываем лоадер, ОБЯЗАТЕЛЬНО дождавшись полного показа чтоб точно быть уверенным что пользователь это заметит
            }
            //если обновление связано с обновление в базе

            //пока это делать не буду т.к. этот перерендер будет происходить очень редко, если будем работаь с корзиной в других вкладках
            //вслучае если событие вызвано обновление локального хранилища
            // if(e.type == 'storage'){
            //     //мы должны проверить если изменения были не важными, например изменился статус спойлера комплектации товара в корзине, то мы не перередереваем данные на странице заказа
            // }
            //вслучае если событие вызвано обновление локального хранилища

            this.clean_order(); //удаляем все товары в заказе

            w.ksn_order_controler.render_order(); //рендерит блок заказа с нуля

            this.update_order_product_spoilers(); //функция подключает спойлеры к каждому блоку сотава товаров в заказе

            //если обновление связано с обновление в базе
            if (data_base_update) {
                order_loader.ksn_fade.fade_hide(); //скрываем лоадер
                order_loader.style.pointerEvents = ''; //делаем лоадер некликабельным чтоб снова можно было взаимодействовать с блоком заказа
            }
            //если обновление связано с обновление в базе
        },
        //срабатывает когда нужно обновить данные заказа, может вызываться про проверке актуальности данных в базе или просто поле изменения или добавленяи нового товара в корзину

        //следим за изменения в локальном хранилище, и если обвновились данные корзины то перерендереваем данные на странице заказа
        storage_cart_update_listener: function (e) {
            if (e.key === 'cart-data') this.update_order_data(e); //только если изменения касались корзины обновляем данные на странице заказа
        },
        //следим за изменения в локальном хранилище, и если обвновились данные корзины то перерендереваем данные на странице заказа

        //создаёт контролер спойлера и прозрачности для блока заказа который будет работать только на экрнах меньше 640px
        spoiler_order_init: function () {
            let rotate_arrow = () => order_spoiler_title.classList.toggle('open-order-title');

            //создайм спойлер с прозрачный появленяием товаров в заказе
            base_spoiler_fade({
                spoiler_content_wrap: order_spoiler_content_wrap,
                spoiler_content: order_spoiler_content,
                spoiler_toggle_button: order_spoiler_title,
                dependency_func: () => {
                    if (GDS.win.width_rem >= 40 || order_spoiler_title.classList.contains('lock-order-title')) return false; //разрешаем работу спойлера заказа только на экранах меньше 640px и только в слуйчае если спойлер не заблокирован
                },
                open_start_func: rotate_arrow,
                close_start_func: rotate_arrow,
            });
            //создайм спойлер с прозрачный появленяием товаров в заказе
        },
        //создаёт контролер спойлера и прозрачности для блока заказа который будет работать только на экрнах меньше 640px

        //функция создаёт контролеры и вешает небходимые обрабочики на кнопки у информационных блоков таких как лоадер заказа, сообщений что корзина пуста или цена товаров в корзине равно нулю
        info_blocks_init: function () {
            //создаём контролеры видимости для следующих блоков
            new Fade(order_loader);
            new Fade(order_empty_cart_message);
            new Fade(order_zero_cart_price_message);
            //создаём контролеры видимости для следующих блоков

            order_zero_cart_price_message_button._on('click', Header_Cart.toggle_cart.bind(Header_Cart)); //делаем открытие корзины при клике на данную кнопку
            order_zero_cart_price_message_button.disabled = false; //теперь можно разблокировать кнопку, т.к. она теперь имеет действие
        },
        //функция создаёт контролеры и вешает небходимые обрабочики на кнопки у информационных блоков таких как лоадер заказа, сообщений что корзина пуста или цена товаров в корзине равно нулю

        //функция подключает спойлеры к каждому блоку сотава товаров в заказе
        //т.к. заказ рендерится ещё до того как доступны модули спойлеров то мы подключаем данные модули к нужным элементым уже после полнйо загрузки страницы
        update_order_product_spoilers: function () {
            //перебираем все товары в блоке заказа и каждому добавляем функцию спойлера и сокрытия
            qsa('.order__product', order_spoiler_content).forEach(product => {
                let spoiler_content_wrap = qs('.order__product-spoiler-wrap', product), //оболочка спойлера комплектации товара
                    spoiler_content = qs('.order__product-spoiler-wrap-content', product), //контент спойлера комплектации товара
                    spoiler_toggle_button = qs('.order__product-toggle-composition', product), //кнопка для срабатывания спойлера товара
                    before_spoiler_run = () => {
                        //функция которяа будет срабатывать при каждом открытиии/закрытии спойлера
                        let spoiler_controler = spoiler_content_wrap.ksn_spoiler; //контролер данного спойлера состава комплекта

                        if (spoiler_controler.block_height == 0) spoiler_controler.set_block_height(); //еслиу  блока спойлера нулевая высота это значит что спойлер был создан при размере экрана бенее 640px и следовательно был скрыт основным спойлером заказа и его высота не могла быть определена, так что в этом случае мы заново высчитываем высоту данного блока спойлера перед его открытием

                        //ВАЖНО эта функция срабатывает до того как статус спойлера измениться так что статусы проверяем наоборот
                        GDS.order_product_data[product.dataset.id].spoiler_hide = spoiler_controler.status == 'show' ? true : false; //в зависимости от статуста спойлера обновляем данные, чтоб при обновлениях в корзине спойлер не скрывался, а оставляся открытм у тех товаров к оторых был открыт

                        spoiler_toggle_button.classList.toggle('order__product-toggle-composition--open'); //меняем поворот стрелочки у блока заголовка который управляет спойлером
                    };

                //создайм спойлер с прозрачный появленяием контента
                base_spoiler_fade({
                    spoiler_content_wrap: spoiler_content_wrap,
                    spoiler_content: spoiler_content,
                    spoiler_toggle_button: spoiler_toggle_button,
                    open_start_func: before_spoiler_run,
                    close_start_func: before_spoiler_run,
                });
                //создайм спойлер с прозрачный появленяием контента

                spoiler_toggle_button.disabled = false; //разблокируем кнопку чтоб с ней можно было взаимодействоать
            });
        },
        //функция подключает спойлеры к каждому блоку сотава товаров в заказе

        //чистим все товары в заказе
        clean_order: function () {
            order_spoiler_content.innerHTML = '';
        },
        //чистим все товары в заказе
    };

export default CONTROLLER;
