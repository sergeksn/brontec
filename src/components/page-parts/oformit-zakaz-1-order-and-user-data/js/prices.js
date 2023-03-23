let order_block = qs('.oformit-zakaz-1__you-order'), //блок с товарами заказа
    promocod_block = qs('.oformit-zakaz-3__promocod'), //блок с промокодом
    promocod_block_full_price_area = qs('.oformit-zakaz-3__promocod-prices-full'), //полная цена заказа без учёта промокода в блоке промокода
    promocod_block_discont_price_area = qs('.oformit-zakaz-3__promocod-prices-promocod-discont'), //скидка промокода, т.е. сколько съэкономил этот промокод в руб
    promocod_block_delivery_price_area = qs('.oformit-zakaz-3__promocod-prices-delivery'), //стоимость доставки без учёта промокода
    finall_price = qs('.oformit-zakaz-4__pay-final-price'), //финальная цена заказа с учтом скидки промокода и цены доставки
    CONTROLLER = {
        init: function () {
            order_block._on('rerender-order-list', this.upadate_prices); //пересчитываем цены после того как обновится список товаров заказа, или обвновится данные товаров заказа в базе
            promocod_block._on('promocod-applied', this.upadate_prices); //пересчитываем цены после того как применится промокод, или обновятся данные промокода в базе

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
                promocod_price = order_full_price == 0 ? 0 : +(promocod_block_discont_price_area.dataset.promocodPrice ?? order_full_price), //цена промокода если она не записана в дата атрибуте то берём полную цену, соответственно скидка промокода будет 0
                delivery_price = order_full_price == 0 ? 0 : order_full_price >= GDS.delivery.border ? 0 : GDS.delivery.price; //получаем цену доставки опираясь на порогове значения для бесплатной доставки и цену заказа без учёта прмокода

            promocod_block_full_price_area.textContent = order_full_price.toLocaleString('ru'); //полняа цена заказа в блоке прмокода

            promocod_block_discont_price_area.textContent = (promocod_price - order_full_price).toLocaleString('ru').replace('-', '- '); //получаем скидку промокода, и делаем знак минус с небольшим отступом для красоты

            promocod_block_delivery_price_area.textContent = delivery_price.toLocaleString('ru'); //записываем цену доставки

            finall_price.textContent = (promocod_price + delivery_price).toLocaleString('ru'); //записываем итоговую цену к оплате
        },
        //обновляет все цены на странице заказа, кроме тех что в блоке со списком товаров в заказе, а именно цену без промокода, скидку промокода, цену доставки и финальную цену
    };

export default CONTROLLER;
