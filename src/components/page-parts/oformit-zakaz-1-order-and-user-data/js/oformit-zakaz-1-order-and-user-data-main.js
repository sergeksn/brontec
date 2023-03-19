import { Header, Header_Cart } from '@header-main-js';
import { base_spoiler_fade } from '@js-moduls/spoiler';
import Fade from '@js-moduls/fade';

let form = qs('#user-data'),
    fio_input = qs('#fio'),
    email_input = qs('#email'),
    tel_input = qs('#tel'),
    policy_checkbox = qs('#polici-konf-checkbox'),
    button = qs('.oformit-zakaz-4__pay-run-button'),
    button_text,
    order_spoiler_title = qs('.oformit-zakaz-1__you-order h2'),
    order_spoiler_content_wrap = qs('.oformit-zakaz-1__you-order-spoiler-wrap'),
    order_spoiler_content = qs('.oformit-zakaz-1__you-order-spoiler-wrap-content'),
    order_loader = qs('.oformit-zakaz-1__you-order-loader'), //лоадер блока заказа которые показываемтся в моменты обновляений и синхронизаций
    order_product_amount_area = qs('.oformit-zakaz-1__you-order-info-amount'), //поле с количеством комплектов в заказе
    order_common_price_area = qs('.oformit-zakaz-1__you-order-info-price'), //поле с общей ценой товаров в заказе
    order_empty_cart_message = qs('.oformit-zakaz-1__you-order-empty-cart'), //блок сообщения что корзина пустая
    order_zero_cart_price_message = qs('.oformit-zakaz-1__you-order-zero-cart-price'), //блок сообщения что цена товарво в корзине равна нулю
    order_zero_cart_price_message_button = qs('.oformit-zakaz-1__you-order-zero-cart-price button'), //нопка перехода в корзину в блоке сообщения что цена товаров в корзине равна нулю
    CONTROLER = {
        init: function () {
            if (!form) return; //если нет такой формы то прерываем инициализацию

            button_text = button.textContent; //записываем исходный текст кнопки

            this.area_fio = qs('.oformit-zakaz-4__contact-info-fio');
            this.area_email = qs('.oformit-zakaz-4__contact-info-email');
            this.area_tel = qs('.oformit-zakaz-4__contact-info-tel');

            form._on('submit', this.form_submit.bind(this), { passive: false }); //при отправлке формы перехватываем управление

            button._on('click', this.click_submit_button.bind(this)); //при клике на кнопку отправки

            [fio_input, email_input, tel_input].forEach(input => input._on('input', this.inputed_event.bind(this))); //при каждом взаимодействии с инпутом проверяем его валидность и записываем текст в соответствующие поле внизу страницы
            policy_checkbox._on('input', this.check_validation.bind(null, { policy: true })); //при каждом взаимодействии с инпутом проверяем его валидность

            let rotate_arrow = () => order_spoiler_title.classList.toggle('open-order-title');

            //создайм спойлер с прозрачный появленяием товаров в заказе
            base_spoiler_fade({
                spoiler_content_wrap: order_spoiler_content_wrap,
                spoiler_content: order_spoiler_content,
                spoiler_toggle_button: order_spoiler_title,
                dependency_func: () => !(GDS.win.width_rem >= 40), //разрешаем работу спойлера заказа только на экранах меньше 640px
                open_start_func: () => rotate_arrow(),
                close_start_func: () => rotate_arrow(),
            });
            //создайм спойлер с прозрачный появленяием товаров в заказе

            //создаём контролеры видимости для следующих блоков
            new Fade(order_loader);
            new Fade(order_empty_cart_message);
            new Fade(order_zero_cart_price_message);
            //создаём контролеры видимости для следующих блоков

            order_zero_cart_price_message_button._on('click', Header_Cart.toggle_cart.bind(Header_Cart)); //делаем открытие корзины при клике на данную кнопку
            order_zero_cart_price_message_button.disabled = false; //теперь можно разблокировать кнопку, т.к. она теперь имеет действие

            let chenge_visible_action = () => qs('.order__product-toggle-composition').classList.toggle('order__product-toggle-composition--open');

            //создайм спойлер с прозрачный появленяием контента
            // base_spoiler_fade({
            //     spoiler_content_wrap: qs('.order__product-spoiler-wrap'),
            //     spoiler_content: qs('.order__product-spoiler-wrap-content'),
            //     spoiler_toggle_button: qs('.order__product-toggle-composition'),
            //     open_start_func: () => chenge_visible_action(),
            //     close_start_func: () => chenge_visible_action(),
            // });
            //создайм спойлер с прозрачный появленяием контента
        },

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
    };

CONTROLER.init();
