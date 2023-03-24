let order_block = qs('.oformit-zakaz-1__you-order'), //блок с товарами заказа
    promocod_block = qs('.oformit-zakaz-3__promocod'), //блок с промокодом
    promocod_input = qs('#promocod'), //инпут промокода
    promocod_submit_button = qs('.oformit-zakaz-3__promocod-submit'), //кнопка применения промокода
    promocod_block_full_price_area = qs('.oformit-zakaz-3__promocod-prices-full'), //полная цена заказа без учёта промокода в блоке промокода
    promocod_block_discont_price_area = qs('.oformit-zakaz-3__promocod-prices-promocod-discont'), //скидка промокода, т.е. сколько съэкономил этот промокод в руб
    promocod_block_delivery_price_area = qs('.oformit-zakaz-3__promocod-prices-delivery'), //стоимость доставки без учёта промокода
    finall_price = qs('.oformit-zakaz-4__pay-final-price'), //финальная цена заказа с учтом скидки промокода и цены доставки
    CONTROLLER = {
        init: function () {
            order_block._on('rerender-order-list', this.upadate_prices); //пересчитываем цены после того как обновится список товаров заказа, или обвновится данные товаров заказа в базе

            order_block._on('empty-order zero-cart-price', this.clean_prices); //обнуляем все поля цен если корзина пуста или цена товаров в корзине равна нулю

            this.upadate_prices(); //после инициализации подуля сразу задаём цены в полях
        },

        //обнуляем все поля цен если корзина пуста или цена товаров в корзине равна нулю
        clean_prices: function () {
            [promocod_block_full_price_area, promocod_block_discont_price_area, promocod_block_delivery_price_area, finall_price].forEach(el => (el.textContent = 0));
        },
        //обнуляем все поля цен если корзина пуста или цена товаров в корзине равна нулю

        //обновляет все цены на странице заказа, кроме тех что в блоке со списком товаров в заказе, а именно цену без промокода, скидку промокода, цену доставки и финальную цену
        upadate_prices: function () {
            let order_full_price = w.ksn_order_controler.calculate_common_order_prise(), //полная цена заказа бе учёта промокода и доставки
                delivery_price, //получаем цену доставки опираясь на порогове значения для бесплатной доставки и цену заказа с учётом промокода прмокода
                promocod_price; //стоимость товаров в заказе с учётом промокода

            promocod_block_full_price_area.textContent = order_full_price.toLocaleString('ru'); //полняа цена заказа в блоке прмокода

            //если цена товаров в корзине равна нулю или корзина пуста то общая цена заказа будет рана нулю
            if (order_full_price == 0) {
                promocod_price = 0; // в этом случае мы даже не пытаемся проверять промокод даже если он есть и просто ставим цену с учётом промокода равную нулю
            }
            //если цена товаров в корзине равна нулю или корзина пуста то общая цена заказа будет рана нулю

            //если же цена товаров в заказе не нулевая
            else {
                let data_promo_price = promocod_block_discont_price_area.dataset.promocodPrice; //пытаемся получить значение атрибута у поля скидки промокода, в которой должна хранится цена заказа с учётом промокода

                //если такой атрибут есть
                if (data_promo_price) {
                    promocod_price = +data_promo_price; //берём значение этого атрибута
                }
                //если такой атрибут есть

                //если атрибута нет
                else {
                    //если в поле промокода ничего не введено
                    if (promocod_input.value == '') {
                        promocod_price = order_full_price; //в этом случае эту цену мы ставим такую же как и без промокода
                    }
                    //если в поле промокода ничего не введено

                    //если есть какой-то промокод
                    else {
                        //если кнопка отправки промокода сообщает об ожидании
                        if (promocod_submit_button.textContent == 'Ожидайте...') {
                            [promocod_block_discont_price_area, promocod_block_delivery_price_area, finall_price].forEach(el => (el.textContent = 'ожидание...')); //помечаем поля сообщениями что нужно ожидать завершенияполучения цены с учётом промокода
                            return; //прерываем дальнейшие выыполнения
                        }
                        //если кнопка отправки промокода сообщает об ожидании

                        //если кнопка не в ожидании значит промокод уже проверен, но т.к. нет атрибута то значит промокод не подошёл
                        else {
                            promocod_price = order_full_price; //в этом случае эту цену мы ставим такую же как и без промокода
                        }
                        //если кнопка не в ожидании значит промокод уже проверен, но т.к. нет атрибута то значит промокод не подошёл
                    }
                    //если есть какой-то промокод
                }
                //если атрибута нет
            }
            //если же цена товаров в заказе не нулевая

            delivery_price = order_full_price == 0 ? 0 : promocod_price >= GDS.delivery.border ? 0 : GDS.delivery.price; //получаем цену доставки опираясь на порогове значения для бесплатной доставки и цену заказа с учётом промокода прмокода

            promocod_block_delivery_price_area.textContent = delivery_price.toLocaleString('ru'); //записываем цену доставки

            promocod_block_discont_price_area.textContent = (promocod_price - order_full_price).toLocaleString('ru').replace('-', '- '); //получаем скидку промокода, и делаем знак минус с небольшим отступом для красоты

            finall_price.textContent = (promocod_price + delivery_price).toLocaleString('ru'); //записываем итоговую цену к оплате
        },
        //обновляет все цены на странице заказа, кроме тех что в блоке со списком товаров в заказе, а именно цену без промокода, скидку промокода, цену доставки и финальную цену
    };

export default CONTROLLER;
