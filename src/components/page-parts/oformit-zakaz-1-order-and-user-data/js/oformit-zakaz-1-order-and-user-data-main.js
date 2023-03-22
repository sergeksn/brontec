import { Header, Header_Cart } from '@header-main-js';
import { base_spoiler_fade } from '@js-moduls/spoiler';
import Fade from '@js-moduls/fade';

let cart = qs('.cart'),
    form = qs('#user-data'),
    fio_input = qs('#fio'),
    email_input = qs('#email'),
    tel_input = qs('#tel'),
    policy_checkbox = qs('#polici-konf-checkbox'),
    button = qs('.oformit-zakaz-4__pay-run-button'), //кнопка отправки заказа
    button_text, //текст кнопки отправки заказа
    order_spoiler_title = qs('.oformit-zakaz-1__you-order h2'), //элемент для открытия/закрытия спойлера заказа на экранах меньше 640px
    order_spoiler_content_wrap = qs('.oformit-zakaz-1__you-order-spoiler-wrap'), //оболочка спойлера заказа
    order_spoiler_content = qs('.oformit-zakaz-1__you-order-spoiler-wrap-content'), //контент спойлера заказа
    order_loader = qs('.oformit-zakaz-1__you-order-loader'), //лоадер блока заказа которые показываемтся в моменты обновляений и синхронизаций
    order_product_amount_area = qs('.oformit-zakaz-1__you-order-info-amount'), //поле с количеством комплектов в заказе
    order_common_price_area = qs('.oformit-zakaz-1__you-order-info-price'), //поле с общей ценой товаров в заказе
    order_empty_cart_message = qs('.oformit-zakaz-1__you-order-empty-cart'), //блок сообщения что корзина пустая
    order_zero_cart_price_message = qs('.oformit-zakaz-1__you-order-zero-cart-price'), //блок сообщения что цена товарво в корзине равна нулю
    order_zero_cart_price_message_button = qs('.oformit-zakaz-1__you-order-zero-cart-price button'), //нопка перехода в корзину в блоке сообщения что цена товаров в корзине равна нулю
    promocod_input = qs('#promocod'), //инпут промокода
    promocod_clean_button = qs('.oformit-zakaz-3__promocod-input-wrap-clean-input'), //кнопка очистки поля промокода
    promocod_submit_button = qs('.oformit-zakaz-3__promocod-submit'), //кнопка применения промокода
    promocod_success_message = qs('.oformit-zakaz-3__promocod-success'), //сообщение что промокод успешно применён
    promocod_error_message = qs('.oformit-zakaz-3__promocod-error'), //сообщение что неверный промокод
    promocod_full_price = qs('.oformit-zakaz-3__promocod-prices-full'), //полная цена заказа без учёта промокода в блоке промокода
    promocod_discont = qs('.oformit-zakaz-3__promocod-prices-promocod-discont'), //скидка промокода, т.е. сколько съэкономил этот промокод в руб
    delivery_price = qs('.oformit-zakaz-3__promocod-prices-delivery'), //стоимость доставки без учёта промокода
    finall_order_price = qs('.oformit-zakaz-4__pay-final-price'), //финальная цена для оплаты с учётом промокода и цены доставки
    CONTROLER = {
        init: function () {
            if (!form) return; //если нет такой формы то прерываем инициализацию

            w._on('load', Header_Cart.check_actual_cart_data.bind(Header_Cart)); //после загрузки страницы проверяем актуальны ли данные которые мы отобразили или их нужно обновить

            cart._on('update-cart-cata', this.update_order_data.bind(this)); //запускает обнволение данных заказа после обновления данных в корзине, может вызываться про проверке актуальности данных в базе или просто поле изменения или добавленяи нового товара в корзину

            w._on('storage', this.storage_cart_update_listener.bind(this)); //следим за изменения в локальном хранилище, и если обвновились данные корзины то перерендереваем данные на странице заказа

            promocod_input._on('input', this.input_promocod_event.bind(this)); //срабатывает при вводе в полне промокода

            promocod_clean_button._on('click', this.clean_promocod_input.bind(this)); //очищает поле инпута при клике на кнопку очистки

            promocod_submit_button._on('click', this.submit_promocod.bind(this)); //проверяем актуальность промокода после нажатия кнопки применить промокод

            this.form_init(); //запускает все необходиме функции для работы формы отправки заказа

            this.spoiler_order_init(); //создаёт контролер спойлера и прозрачности для блока заказа который будет работать только на экрнах меньше 640px

            this.info_blocks_init(); //функция создаёт контролеры и вешает небходимые обрабочики на кнопки у информационных блоков таких как лоадер заказа, сообщений что корзина пуста или цена товаров в корзине равно нулю

            this.update_order_product_spoilers(); //функция подключает спойлеры к каждому блоку сотава товаров в заказе

            this.update_payment_block(); //функция обновляет цену заказа, скидку промокода, статус актуальности промокода и цену доставки в блоке информации по оплате заказа

            this.update_submit_block(); //обновляет данные в блоке с отправкой заказа
        },

        //следим за изменения в локальном хранилище, и если обвновились данные корзины то перерендереваем данные на странице заказа
        storage_cart_update_listener: function (e) {
            if (e.key === 'cart-data') this.update_order_data(e); //только если изменения касались корзины обновляем данные на странице заказа
        },
        //следим за изменения в локальном хранилище, и если обвновились данные корзины то перерендереваем данные на странице заказа

        //срабатывает когда нужно обновить данные заказа, может вызываться про проверке актуальности данных в базе или просто поле изменения или добавленяи нового товара в корзину
        update_order_data: async function (e) {
            let detail = e?.detail,
                data_base_update = detail?.data_base_update ?? false, //обновление было вызвано после синхронизации с базой и тогда нужно показать лоадер на секунду, по умолчанию это не обновление с базой
                important = detail?.important ?? true; //это важное обновление и нужно обновить данные на странице заказа, по умолчанию оно важное

            if (!form) return; //если нет такой формы то прерываем

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

            this.update_payment_block(); //функция обновляет цену заказа, скидку промокода, статус актуальности промокода и цену доставки в блоке информации по оплате заказа

            //если обновление связано с обновление в базе
            if (data_base_update) {
                order_loader.ksn_fade.fade_hide(); //скрываем лоадер
                order_loader.style.pointerEvents = ''; //делаем лоадер некликабельным чтоб снова можно было взаимодействовать с блоком заказа
            }
            //если обновление связано с обновление в базе
        },
        //срабатывает когда нужно обновить данные заказа, может вызываться про проверке актуальности данных в базе или просто поле изменения или добавленяи нового товара в корзину

        //чистим все товары в заказе
        clean_order: function () {
            order_spoiler_content.innerHTML = '';
        },
        //чистим все товары в заказе

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
                        GDS.prepare_cart_data_for_order[product.dataset.id].spoiler_hide = spoiler_controler.status == 'show' ? true : false; //в зависимости от статуста спойлера обновляем данные, чтоб при обновлениях в корзине спойлер не скрывался, а оставляся открытм у тех товаров к оторых был открыт

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

        //запускает все необходиме функции для работы формы отправки заказа
        form_init: function () {
            button_text = button.textContent; //записываем исходный текст кнопки

            this.area_fio = qs('.oformit-zakaz-4__contact-info-fio');
            this.area_email = qs('.oformit-zakaz-4__contact-info-email');
            this.area_tel = qs('.oformit-zakaz-4__contact-info-tel');

            form._on('submit', this.form_submit.bind(this), { passive: false }); //при отправлке формы перехватываем управление

            button._on('click', this.click_submit_button.bind(this)); //при клике на кнопку отправки

            [fio_input, email_input, tel_input].forEach(input => input._on('input', this.inputed_event.bind(this))); //при каждом взаимодействии с инпутом проверяем его валидность и записываем текст в соответствующие поле внизу страницы
            policy_checkbox._on('input', this.check_validation.bind(null, { policy: true })); //при каждом взаимодействии с инпутом проверяем его валидность
        },
        //запускает все необходиме функции для работы формы отправки заказа

        //при отправлке формы перехватываем управление
        form_submit: async function (e) {
            e.preventDefault(); //предотвращаем отправку формы стандартным образом

            button.setAttribute('disabled', 'disabled'); //блокируем кнопку
            button.textContent = 'Ожидайте ...';

            button.removeAttribute('disabled'); //блокируем кнопку
            button.textContent = button_text;
        },
        //при отправлке формы перехватываем управление

        //записывает содержимое инпутов в соотвествующие поля внизу страницы оформленяи заказа
        inputed_event: function (e) {
            let input = e.target,
                id = input.id;

            this['area_' + id].textContent = input.value;

            this.check_validation({ [id]: true });
        },
        //записывает содержимое инпутов в соотвествующие поля внизу страницы оформленяи заказа

        //проверяет валидность заполненых полей
        //settings - объект с настрйоками какие поля проверять на валидность в данной проверке
        check_validation: function (settings = {}) {
            let default_setings = { fio: false, email: false, tel: false, policy: false }; //по умолчанию мы не проверяем ни какие поля
            settings = { ...default_setings, ...settings }; //вписываем наши настрйоки заменяя настройки по умолчанию

            if (settings.fio) fio_input.classList.add('custom-text-input--check-valid'); //делает пометку что нужно провеять валидность и применять соответствующие стили для инпута ФИО

            if (settings.email) email_input.classList.add('custom-text-input--check-valid'); //делает пометку что нужно провеять валидность и применять соответствующие стили для инпута почты

            if (settings.tel) tel_input.classList.add('custom-text-input--check-valid'); //делает пометку что нужно провеять валидность и применять соответствующие стили для инпута телефона

            if (settings.policy) policy_checkbox.parentNode.classList.add('custom-checbox--check-valid'); //делает пометку что нужно провеять активен ли чекбокс политики конфиденциальности и в соответствии с этим применять соответствующие стили
        },
        //проверяет валидность заполненых полей

        //при клике на кнопку отправки
        click_submit_button: function () {
            Header.hide_and_lock_on_time(); //скрываем хедер скрываем и блокируем показ хедера на секунду чтоб он не закрывал чать экрана
            this.check_validation({ fio: true, email: true, tel: true, policy: true }); //проверяет валидность заполненых полей
        },
        //при клике на кнопку отправки

        //функция обновляет цену заказа, скидку промокода, статус актуальности промокода и цену доставки в блоке информации по оплате заказа
        update_payment_block: async function () {
            let cart_data = localStorage.getItem('cart-data');

            //если корзина пуста то блокируем инпут и кнопку промокода
            if (!cart_data || cart_data == '{}') {
                promocod_submit_button.disabled = true; //блокируем кнопку
                promocod_input.disabled = true; //блокируем инпут
                promocod_full_price.textContent = 0;
                promocod_discont.textContent = 0;
                delivery_price.textContent = 0;
                return;
            }
            //если корзина пуста то блокируем инпут и кнопку промокода

            let full_price = +order_common_price_area.textContent.replace('\u00A0', ''); //получаем полную цену из блока заказа без пробелов-разделителей и ввиде числа

            promocod_full_price.textContent = full_price.toLocaleString('ru'); //берём общую цену товаров в заказе из уже высчитаной цены в верхнем блоке со списком товаров в заказе, т.к. в любом случае данная функция пересчёта будет вызваться всегда только после того как будет перерендерен блок сверху с полными данными о заказе

            this.set_delivery_price(full_price); //заполйнем цену доставки

            let promocod_price = await this.get_promokod_data(); //проверяем промокод и если он есть получаем цену заказа с учётом помокода

            this.set_discont_price(promocod_price); //заполняем цену скидки с учётом промокода
        },
        //функция обновляет цену заказа, скидку промокода, статус актуальности промокода и цену доставки в блоке информации по оплате заказа

        //получает на вход цену заказа после применения промокода если он есть высчитывает сумму скидки
        set_discont_price: function (promocod_price) {
            promocod_discont.textContent = promocod_price ? (promocod_price - +order_common_price_area.textContent.replace('\u00A0', '')).toLocaleString('ru').replace('-', '- ') : 0; //записываем сколько нам экномит промокод
        },
        //получает на вход цену заказа после применения промокода если он есть высчитывает сумму скидки

        //определяем бесплатняа доставка или нет отталкиваясь от цены заказа ДО применения промокода
        set_delivery_price: function (full_price) {
            delivery_price.textContent = full_price >= GDS.delivery.border ? 0 : GDS.delivery.price.toLocaleString('ru');
        },
        //определяем бесплатняа доставка или нет отталкиваясь от цены заказа ДО применения промокода

        //получаем промокод и если он есть получаем цену заказа с учётом помокода
        get_promokod_data: async function () {
            let promocod = localStorage.getItem('promocod'), //наличие промокода в хранилище
                cart_data = localStorage.getItem('cart-data'); //данные в корзины

            if (!promocod || promocod == '' || !cart_data || cart_data == '{}') return 9500; //если нет промокода или нет данных в корзине прерываем дальнейшие проверки
        },
        //получаем промокод и если он есть получаем цену заказа с учётом помокода

        //срабатывает при вводе в поле промокода
        input_promocod_event: function () {
            promocod_submit_button.disabled = promocod_input.value.length < 1; //блокируем кнопку если в инпуте ничего не введено

            promocod_clean_button.style.display = ''; //так же после неправильного промокода будет показан крестик чтоб его убрать, и данный крестик мы скрываем сразу после того как изменим занчение в поле промокода, крестик не показывается при простом заполнении инпута чтоб при прокрутке на мобильном человек случайно его не нажал и не сёр промокод

            promocod_input.classList.remove('custom-text-input--error', 'custom-text-input--success'); //если у инпута были пометки ошибко или успеху убираем их чтоб бордер был цвета по умолчанию

            //скрываем сообщения ошибки и успеха
            promocod_success_message.style.display = '';
            promocod_error_message.style.display = '';
        },
        //срабатывает при вводе в поле промокода

        //очищает поле инпута при клике на кнопку очистки
        clean_promocod_input: function () {
            promocod_input.value = ''; //чистим поле промокода
            promocod_clean_button.style.display = ''; //скрывам кнопку очистки промокода
            promocod_submit_button.disabled = true; //блокируем кнопку
            promocod_input.classList.remove('custom-text-input--error'); //удаляему инпута пометку что была ошибка при неправильном промокоде
            promocod_error_message.style.display = ''; //скрываем сообщение ошибки
        },
        //очищает поле инпута при клике на кнопку очистки

        //срабатывает в помент нажатия кнопки применения промокода
        submit_promocod: async function () {
            promocod_input.disabled = true; //блокируем инпут
            promocod_submit_button.disabled = true; //блокируем кнопку
            promocod_submit_button.textContent = 'Ожидайте...'; //меняем текст кнокпи

            let promocod_price = await this.get_promokod_data(); //пытаемся получить цену промокода для текущего заказа из базы

            promocod_submit_button.textContent = 'Применить'; //меняем текст кнокпи
            promocod_input.disabled = false; //разблокируем инпут

            //если для данных товаров промокод не найден
            if (!promocod_price) {
                promocod_input.classList.add('custom-text-input--error'); //меняем цвет бордера у инпута
                promocod_clean_button.style.display = 'block'; //показываем кнопку очистки промокода
                promocod_error_message.style.display = 'block'; //показываем сообщение ошибки
                return; //прерываем функцию
            }
            //если для данных товаров промокод не найден

            promocod_success_message.style.display = 'block'; //показываем сообщение что прмокод успешно применён
            promocod_input.classList.add('custom-text-input--success'); //меняем цвет бордера у инпута помечаем что промокод применён успешно
        },
        //срабатывает в помент нажатия кнопки применения промокода
        
        //обновляет данные в блоке с отправкой заказа
        update_submit_block: function () {
            let cart_data = localStorage.getItem('cart-data');

            //если корзина пуста
            if (!cart_data || cart_data == '{}') {
                button.disabled = true; //блокируем кнопку
                finall_order_price.textContent = 0;
                return;
            }
            //если корзина пуста

        },
        //обновляет данные в блоке с отправкой заказа
    };

CONTROLER.init();

export default CONTROLER;
