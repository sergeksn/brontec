import { set_local_storage } from '@js-libs/func-kit';
import { Header_Cart } from '@header-main-js';

let title = qs('.check-payment h1'),
    description = qs('.check-payment__description'),
    to_order_button = qs('.check-payment__buttons-to-order'),
    to_shop_button = qs('.check-payment__buttons-to-shop'),
    payment_id,
    CONTROLLER = {
        init: function () {
            if (!title) return; //если не той странице

            payment_id = localStorage.getItem('payment-id'); //получаем идентификатор платежа

            if (payment_id && payment_id != '') {
                this.send_request(); //если есть идентификатор платежа получаем данные, если иденьтификатора нет то сообщаем об этом
            } else {
                title.textContent = 'Платёж не обнаружен!';
                description.textContent = 'Мы не нашли Вашего платежа, если Вы его всё же совершали обратитись в техподдержку нашего сайта';
            }
        },

        //делаем запрос на пулучение статуса платежа
        send_request: function () {
            let request_data = {
                //запрос на сервер
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
                body: JSON.stringify({
                    action: 'get_order_payment_status',
                    data: payment_id,
                }),
            };

            fetch(GDS.ajax_url, request_data)
                .then(response => response.json()) //считываем переданные данные
                .then(result => {
                    //если произошла ошибка на стороне юкассы
                    if (result.error) {
                        title.textContent = 'Ошибка';
                        description.textContent = 'Произошла ошибка на стороне платёжного шлюза, попробуйте проверить статус позже';
                        to_order_button.style.display = 'flex';
                        to_shop_button.classlist.add('button-main--transparent');
                        return;
                    }
                    //если произошла ошибка на стороне юкассы

                    let status = result.status;

                    if (status == 'succeeded') {
                        title.textContent = 'Спасибо за покупку!';
                        description.textContent = 'Ваш заказ успешно оплачен!';

                        set_local_storage('cart-data', '{}');//после успешной оплаты платежа чистим корзину
                        Header_Cart.set_cart_counter();//убираем счётчик корзины
                    } else if (status == 'pending') {
                        title.textContent = 'Платёж в ожидании';
                        description.textContent = 'Платёж ожидает подтвержения с Вашей стороны или стороны Вашего банка';
                    } else if (status == 'canceled') {
                        title.textContent = 'Платёж отменён';
                        description.textContent = 'Платёж был отменён или во время его выполнения произошла ошибка, не волнуйтесь Ваш заказ сохранён в корзине';
                        to_order_button.style.display = 'flex';
                        to_shop_button.classlist.add('button-main--transparent');
                    }
                })
                .catch(e => console.error(e));
        },
        //делаем запрос на пулучение статуса платежа
    };

CONTROLLER.init();
