import { Header } from '@header-main-js';

let form = qs('#user-data'),
    order_block = qs('.oformit-zakaz-1__you-order'), //блок с товарами заказа
    fio_input = qs('#fio'),
    email_input = qs('#email'),
    tel_input = qs('#tel'),
    policy_checkbox = qs('#polici-konf-checkbox'),
    button = qs('.oformit-zakaz-4__pay-run-button'), //кнопка отправки заказа
    button_text, //текст кнопки отправки заказа
    CONTROLLER = {
        //запускает все необходиме функции для работы формы отправки заказа
        init: function () {
            button_text = button.textContent; //записываем исходный текст кнопки

            //нужно записать в свойства текущего объекта дял корректной рабоыт функции inputed_event
            this.area_fio = qs('.oformit-zakaz-4__contact-info-fio');
            this.area_email = qs('.oformit-zakaz-4__contact-info-email');
            this.area_tel = qs('.oformit-zakaz-4__contact-info-tel');

            form._on('submit', this.form_submit.bind(this), { passive: false }); //при отправлке формы перехватываем управление

            button._on('click', this.click_submit_button.bind(this)); //при клике на кнопку отправки

            this.init_inputs(); //подключает все необходимые события для работы инпутов

            this.set_submit_button_status(); //блокируем кнопку отплаты заказ если корзина пуста или цена товаров в корзине равна нулю, разблокируем если добавлен хоть один товар
        },
        //запускает все необходиме функции для работы формы отправки заказа

        //блокируем кнопку отплаты заказ если корзина пуста или цена товаров в корзине равна нулю, разблокируем если добавлен хоть один товар
        set_submit_button_status: function () {
            order_block._on('rerender-order-list', () => (button.disabled = false));
            order_block._on('zero-cart-price', () => (button.disabled = true));
            order_block._on('empty-order', () => (button.disabled = true));

            let common_price = w.ksn_order_controler.calculate_common_order_prise(); //общая цена товаров в корзине

            if (common_price > 0) button.disabled = false; //разблокируем кнопку оплаты заказа
        },
        //блокируем кнопку отплаты заказ если корзина пуста или цена товаров в корзине равна нулю, разблокируем если добавлен хоть один товар

        //при отправлке формы перехватываем управление
        form_submit: async function (e) {
            e.preventDefault(); //предотвращаем отправку формы стандартным образом

            button.setAttribute('disabled', 'disabled'); //блокируем кнопку
            button.textContent = 'Ожидайте ...';
            console.log(456);
            button.removeAttribute('disabled'); //блокируем кнопку
            button.textContent = button_text;
        },
        //при отправлке формы перехватываем управление

        //подключает все необходимые события для работы инпутов
        init_inputs: function () {
            [fio_input, email_input, tel_input].forEach(input => {
                let id = input.id;
                this['area_' + id].textContent = input.value; //для каждого инпута в хранилище уже могли быть сохранены данные так что мы их сразу и вставляем

                input.addEventListener('invalid', e => Header.hide_and_lock_on_time()); //скрываем хедер скрываем и блокируем показ хедера на секунду чтоб он не закрывал часть экрана, при услови что инпут был невалидным

                input._on('input', this.inputed_event.bind(this)); //при каждом взаимодействии с инпутом проверяем его валидность и записываем текст в соответствующие поле внизу страницы
            });

            policy_checkbox._on('input', this.premision_pometka_invalid_inputs.bind(null, { policy: true })); //при каждом взаимодействии с инпутом проверяем его валидность

            policy_checkbox.addEventListener('invalid', e => Header.hide_and_lock_on_time()); //скрываем хедер скрываем и блокируем показ хедера на секунду чтоб он не закрывал часть экрана, при услови что инпут был невалидным
        },
        //подключает все необходимые события для работы инпутов

        //записывает содержимое инпутов в соотвествующие поля внизу страницы оформленяи заказа
        inputed_event: function (e) {
            let input = e.target,
                id = input.id;

            this['area_' + id].textContent = input.value;

            this.premision_pometka_invalid_inputs({ [id]: true }); //помечает что можно меянть стили у невалидных полей
        },
        //записывает содержимое инпутов в соотвествующие поля внизу страницы оформленяи заказа

        //помечает что можно меянть стили у невалидных полей
        //settings - объект с настрйоками какие поля проверять на валидность в данной проверке
        premision_pometka_invalid_inputs: function (settings = {}) {
            let default_setings = { fio: false, email: false, tel: false, policy: false }; //по умолчанию мы не проверяем ни какие поля
            settings = { ...default_setings, ...settings }; //вписываем наши настройки заменяя настройки по умолчанию

            if (settings.fio) fio_input.classList.add('custom-text-input--check-valid'); //делает пометку что нужно провеять валидность и применять соответствующие стили для инпута ФИО

            if (settings.email) email_input.classList.add('custom-text-input--check-valid'); //делает пометку что нужно провеять валидность и применять соответствующие стили для инпута почты

            if (settings.tel) tel_input.classList.add('custom-text-input--check-valid'); //делает пометку что нужно провеять валидность и применять соответствующие стили для инпута телефона

            if (settings.policy) policy_checkbox.parentNode.classList.add('custom-checbox--check-valid'); //делает пометку что нужно провеять активен ли чекбокс политики конфиденциальности и в соответствии с этим применять соответствующие стили
        },
        //помечает что можно меянть стили у невалидных полей

        //при клике на кнопку отправки
        click_submit_button: function () {
            this.premision_pometka_invalid_inputs({ fio: true, email: true, tel: true, policy: true }); //помечает все невалидные поля красным бордером
        },
        //при клике на кнопку отправки
    };

export default CONTROLLER;
