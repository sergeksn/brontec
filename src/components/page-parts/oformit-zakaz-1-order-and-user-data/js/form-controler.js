import { Header, Header_Cart } from '@header-main-js';
import Pop_Up_Message from '@pop-up-messages-main-js';
import { set_local_storage } from '@js-libs/func-kit';
import user_info_save from '@js-moduls/user-info-save';

let form = qs('#user-data'),
    order_block = qs('.oformit-zakaz-1__you-order'), //блок с товарами заказа
    fio_input = qs('#fio'),
    email_input = qs('#email'),
    tel_input = qs('#tel'),
    comment_message = qs('#message'),
    policy_checkbox = qs('#polici-konf-checkbox'),
    button = qs('.oformit-zakaz-4__pay-run-button'), //кнопка отправки заказа
    CONTROLLER = {
        //запускает все необходиме функции для работы формы отправки заказа
        init: function () {
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

            if (!Header_Cart.check_cart_limits()) return; //прерываем если превышен лимит в 100 уникальных товаров корзине

            button.setAttribute('disabled', 'disabled'); //блокируем кнопку
            button.textContent = 'Ожидайте ...';

            let promocod = localStorage.getItem('promocod') ?? '', //если промокода не существует передаём пустую строку
                request_data = {
                    //запрос на сервер
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'get_order_check_write_order_in_bd_and_go_to_pay',
                        data: JSON.stringify(w.ksn_order_controler.get_unique_products_list()),
                        delivery: JSON.stringify({
                            city_name: GDS.delivery.city_name,
                            pvz_or_postomat_id: GDS.delivery.pvz_or_postomat_id,
                            price: GDS.delivery.price,
                            pvz_or_postomat_name: GDS.delivery.pvz_or_postomat_name,
                            pvz_or_postomat_address: GDS.delivery.pvz_or_postomat_address,
                        }), //данные доставки
                        user_info: JSON.stringify({
                            fio: fio_input.value,
                            email: email_input.value,
                            tel: tel_input.value.replace(/[^\d\+]/g, ''), //чистим номер от мусора
                        }),
                        comment: comment_message.value,
                        promocod: promocod, //передаём промокод если он есть
                        curent_finall_price: qs('.oformit-zakaz-3__promocod-prices-promocod-discont').getAttribute('data-promocod-price') ?? qs('.oformit-zakaz-3__promocod-prices-full').textContent.replace(' ₽', '').replace(/\s/, ''), //передаём текущую цену чтоб точно удостоверится что данная цена не отличается от той что будет получена в результате проверко цен товаров с учётом промокода если он есть
                        //если промокода нет то берём просто финальную цену
                    }),
                };

            //отправляем запрос на сервер чтоб проверить все ли товары в заказе проходят проврку в базе, если не проходят вернём собщение со сприском товаров которые изменились, если все товары прошли проверку то в юкасе создаём объект оплаты
            await fetch(GDS.ajax_url, request_data)
                .then(response => response.json()) //считываем переданные данные
                .then(result => {
                    let error = result.error;

                    //если в ответ пришла ошибка
                    if (error) {
                        //выводим сообщение в котором указываем что случилось
                        new Pop_Up_Message({
                            title: error.title,
                            message: error.message,
                            type: error['message-type'],
                        });
                        //выводим сообщение в котором указываем что случилось

                        //если пришло сообщение что данные товаров или финальная цена не актуальны то обновляем данные заказа
                        if (error['error-type'] == 'not_actual_products' || error['error-type'] == 'not_actual_finall_price') {
                            Header_Cart.check_actual_cart_data(); //обновляем все данные товаров в корзине, в заказе и данные промокода
                        }
                        //если пришло сообщение что данные товаров или финальная цена не актуальны то обновляем данные заказа

                        button.removeAttribute('disabled'); //разблокируем кнопку
                        button.textContent = 'Оплатить онлайн';

                        return; //прерываем
                    }
                    //если в ответ пришла ошибка

                    this.write_paymet_id_and_redirect_user(result); //при успешном создании платежа записываем в хранилище id платежа и перенаправляем юзера на страницу оплаты

                    if (!KSN_DEV_MODE) ym(94035861,'reachGoal','order_complete'); //если не режим разработки добавляем триггер цели яндекс метрики на отправку заказа
                })
                .catch(e => {
                    button.removeAttribute('disabled'); //разблокируем кнопку
                    button.textContent = 'Оплатить онлайн';
                    console.error(e);
                });
        },
        //при отправлке формы перехватываем управление

        //при успешном создании платежа записываем в хранилище id платежа и перенаправляем юзера на страницу оплаты
        write_paymet_id_and_redirect_user: function (result) {
            set_local_storage('payment-id', result.id); //записываем в хранилище чтоб на после возврата с платёжной системы на наш сайт знать какой платёж проверять, тут даже если юзер подменит id то он увидит тот статус который он нахакерил, но у нас всё равно проверка на вебхуках с повторонйо проверкой статуса платеже перед созданием заказа в МС

            w.location.href = result.payment_url; //перенаправляем пользователя на платёжную систему
        },
        //при успешном создании платежа записываем в хранилище id платежа и перенаправляем юзера на страницу оплаты

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

            tel_input._on('input', this.phone_input_autocompliter.bind(this)); //при каждом взаимодействии с инпутом проверяем его валидность
        },
        //подключает все необходимые события для работы инпутов

        //взял готовую функцию, если будет лагать переделаю
        //управляет автозаполнением номера
        phone_input_autocompliter: function (e) {
            let value = e.target.value.replace(/^\+7\s?/, '').replace(/[^\d]/g, ''), //чистим всё оставляя цыфры номера без кода страны
                mask = [...'+7 (___) ___-__-__'],
                result,
                last_pos; //индекс последнего найденого подчёркивани _ в маске

            //перебираем все цыфры в инпуте и вставляем их по порядку в нашу маску заменяя нижние подчёркивания
            [...value].forEach(item => {
                let position = mask.indexOf('_');
                mask[position] = item;
                last_pos = position;
            });
            //перебираем все цыфры в инпуте и вставляем их по порядку в нашу маску заменяя нижние подчёркивания

            mask.length = last_pos ? last_pos + 1 : 0;//если не задан last_pos значит передали пустое количество цыфр номера
            result = mask.join(''); //сбираем в строку безлишней части

            e.target.value = result;
            user_info_save.write_input_or_textarea_data(e.target); //сохраняем в хранилище отформатированную версию телефона
            this.area_tel.textContent = result; //записываем отформатированное значение телефона в данные заказа ниже на странице
        },
        //взял готовую функцию, если будет лагать переделаю

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
