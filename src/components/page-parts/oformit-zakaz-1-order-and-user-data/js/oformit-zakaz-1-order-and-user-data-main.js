import Order_Form from './form-controler'; //управляет формой отправки заказа на оплату, т.е. всеми её инпутами чекбоксами и кнопкой, а так же отвечает за запись полей в хранилище
import Order_Product_List from './product-list-controler'; //отвечает за обнволение и перерендер товаров в заказе при обновлении данных товаров в базе или изменении заказа в корзине
import Order_Delivery from './delivery'; //управляет модулем доставки СДЕК
import Order_Promocod from './promocod'; //управляет промокодом, проверяем его на правильность и проверяет актуальность при каждом обновлнии страницы или изменени стостава заказа в корзине
import Order_Prices from './prices'; //управляет все ценами на странице оформленяи заказа, сюда входит цена товара без учёта промокода, скидка промокода, цена доставки и итоговая цена заказа

let form = qs('#user-data'),
    CONTROLLER = {
        init: function () {
            if (!form) return; //если нет такой формы то прерываем инициализацию

            //инициализируем все необходимые модули страницы оформленяи заказа
            Order_Form.init();
            Order_Product_List.init();
            Order_Delivery.init();
            Order_Promocod.init();
            Order_Prices.init();
            //инициализируем все необходимые модули страницы оформленяи заказа
        },
    };

CONTROLLER.init();

export { CONTROLLER as Order, Order_Form, Order_Product_List, Order_Delivery, Order_Promocod, Order_Prices };
