import { set_local_storage } from '@js-libs/func-kit';

let cart = qs('.cart'), //корзина
    order_block = qs('.oformit-zakaz-1__you-order'), //блок с товарами заказа
    promocod_block = qs('.oformit-zakaz-3__promocod'), //блок с промокодом
    promocod_input = qs('#promocod'), //инпут промокода
    promocod_clean_button = qs('.oformit-zakaz-3__promocod-input-wrap-clean-input'), //кнопка очистки поля промокода
    promocod_submit_button = qs('.oformit-zakaz-3__promocod-submit'), //кнопка применения промокода
    promocod_success_message = qs('.oformit-zakaz-3__promocod-success'), //сообщение что промокод успешно применён
    promocod_error_message = qs('.oformit-zakaz-3__promocod-error'), //сообщение что неверный промокод
    promocod_price_area = qs('.oformit-zakaz-3__promocod-prices-promocod-discont'), //поле с ценой скидки промокода
    promocod_applied = new CustomEvent('promocod-applied'), //события применени промокода
    CONTROLLER = {
        init: function () {
            promocod_input._on('input', this.input_promocod_event.bind(this)); //срабатывает при вводе в поле промокода

            promocod_clean_button._on('click', this.clean_promocod_input.bind(this)); //очищает поле инпута при клике на кнопку очистки

            promocod_submit_button._on('click', this.submit_promocod.bind(this)); //проверяем актуальность промокода после нажатия кнопки применить промокод

            promocod_input.value = localStorage.getItem('promocod'); //записываем промокод в инпут если он сеть

            let cart_data = localStorage.getItem('cart-data'), //данные корзины
                empty_or_zero_cart = !cart_data || cart_data == '{}' || w.ksn_order_controler.calculate_common_order_prise() == 0; //проверяем пустая корзина или цена товаров в корзине равна нулю

            if (empty_or_zero_cart) {
                this.disable_promocod_block(); //если корзина пуста или цена товаров в ней равна нулю блокринум инпут и кнопку
            } else {
                promocod_input.disabled = false; //разблокируем инпут
            }

            order_block._on('rerender-order-list', () => {
                promocod_input.disabled = false; //разблокируем инпут
                this.submit_promocod();
            }); //пересчитываем цену промокода каждый раз при обновлении данных заказа

            order_block._on('empty-order zero-cart-price', this.disable_promocod_block); //блокируем инпут и кнопку применения промокода если корзина пуста или цена товаров в корзине равна нулю

            if (!empty_or_zero_cart) this.submit_promocod(); //срабатывает в момент нажатия кнопки применения промокода ли перендера блока заказа
        },

        //блокирует инпут и кнопку применения промокода
        disable_promocod_block: function () {
            promocod_input.disabled = true;
            promocod_submit_button.disabled = true;
            promocod_clean_button.style.display = ''; //скрывам кнопку очистки промокода
        },
        //блокирует инпут и кнопку применения промокода

        //получаем промокод и если он есть получаем цену заказа с учётом помокода
        get_promokod_data: async function (promocod) {
            let promocode_price, //сюда будет записана цена с учётом промокода
                request_data = {
                    //запрос на сервер
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'check_promocod_price',
                        data: JSON.stringify(GDS.prepare_cart_data_for_order),
                        promocod: promocod,
                    }),
                };

            //отправляем запрос на сервер что отправить сообщение и выводим соответсвующие всплывающие окна

            await fetch(GDS.ajax_url, request_data)
                .then(response => response.json()) //считываем переданные данные
                .then(result => {
                    promocode_price = result;
                })
                .catch(e => console.error(e));

            return promocode_price;
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

            set_local_storage('promocod', promocod_input.value); //записываем промокод в хранилище
        },
        //срабатывает при вводе в поле промокода

        //очищает поле инпута при клике на кнопку очистки
        clean_promocod_input: function () {
            promocod_input.value = ''; //чистим поле промокода
            promocod_clean_button.style.display = ''; //скрывам кнопку очистки промокода
            promocod_submit_button.disabled = true; //блокируем кнопку
            promocod_input.classList.remove('custom-text-input--error'); //удаляему инпута пометку что была ошибка при неправильном промокоде
            promocod_error_message.style.display = ''; //скрываем сообщение ошибки
            set_local_storage('promocod', ''); //удаляем промокод из хранилища
        },
        //очищает поле инпута при клике на кнопку очистки

        //срабатывает в момент нажатия кнопки применения промокода ли перендера блока заказа
        submit_promocod: async function () {
            let promocod = promocod_input.value; //введённый промокод

            if (promocod == '') return; //если поле промокода пустое прерываем функцию

            promocod_clean_button.style.display = ''; //скрывам кнопку очистки промокода
            promocod_input.disabled = true; //блокируем инпут
            promocod_submit_button.disabled = true; //блокируем кнопку
            promocod_submit_button.textContent = 'Ожидайте...'; //меняем текст кнокпи

            let promocod_price = await this.get_promokod_data(promocod); //пытаемся получить цену промокода для текущего заказа из базы

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

            promocod_price_area.dataset.promocodPrice = promocod_price; //записываем цену с учётом промокода в дата атрибут для дальнейшего использования ей в расчётах цен
            promocod_success_message.style.display = 'block'; //показываем сообщение что прмокод успешно применён
            promocod_input.classList.add('custom-text-input--success'); //меняем цвет бордера у инпута помечаем что промокод применён успешно
            promocod_block.dispatchEvent(promocod_applied); //вызываем событие примененяи промокода чтоб обновились цены
        },
        //срабатывает в момент нажатия кнопки применения промокода ли перендера блока заказа
    };

export default CONTROLLER;
