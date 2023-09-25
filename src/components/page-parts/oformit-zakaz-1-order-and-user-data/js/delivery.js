import { Order_Prices } from '@oformit-zakaz-1-order-and-user-data-main-js';

let delivery_input = qs('.oformit-zakaz-2 input'),
    delivery_addres = qs('.oformit-zakaz-4__delivery-info-address'),
    delivery_term = qs('.oformit-zakaz-4__delivery-info-term'),
    CONTROLLER = {
        init: function () {
            if (!delivery_input) return; //если не на той странице

            GDS.delivery.price = 0; //цена доставки по умолчанию нулевая

            new ISDEKWidjet({
                defaultCity: 'Москва', //defaultCity: 'auto',
                cityFrom: 'Екатеринбург',
                link: 'sdekmap',
                path: GDS.host_url + '/wp-content/plugins/ksn_shop/integrations/sdek/widget/scripts/',
                servicepath: GDS.host_url + '/wp-content/plugins/ksn_shop/integrations/sdek/widget/scripts/service.php', //ссылка на файл service.php на вашем сайте
                //mode: 'pvz',
                apikey: GDS.delivery.yandex_map_api_key, //ключ от яндекс карт
                hidedress: true, //скрывает фильтр пунктов выдачи заказов с опцией примерки
                hidecash: true, //скрывает фильтр ПВЗ с возможностью расчета картой
                hidedelt: true, //скрывается панель, на которой отображены варианты доставки
                //region: true,//отображаются пункты выдачи заказов для всего региона
                goods: [
                    {
                        length: 77,
                        width: 11,
                        height: 11,
                        weight: 1,
                    },
                ],
                onChoose: this.select_pvz_or_postomat,
            });
        },

        //срабытывает при выборе пвз или постомата на карте и нажатию кнопки выбрать
        select_pvz_or_postomat: function (data) {
            //задаём текст и стили кнопки после выбора текущего пвз
            let button = qs('.CDEK-widget__panel-details__block .CDEK-widget__choose'),
                old_width = w.getComputedStyle(button).width;

            button.textContent = 'Выбран';
            button.style.width = old_width;
            button.style.color = '#fff';
            button.style.textAlign = 'center';
            button.style.borderColor = 'rgba(80, 166, 49, 0.6)';
            button.style.backgroundColor = 'rgba(80, 166, 49, 0.6)';
            //задаём текст и стили кнопки после выбора текущего пвз

            GDS.delivery.city_name = data.cityName;
            GDS.delivery.pvz_or_postomat_id = data.id;
            GDS.delivery.price = +data.price;
            GDS.delivery.term = data.term;
            GDS.delivery.pvz_or_postomat_name = data.PVZ.Name;
            GDS.delivery.pvz_or_postomat_address = data.PVZ.Address.replace('Нет приема и выдачи груза','');

            delivery_input.value = data.id; //записываем id  в инпут чтоб он перестал быть пустым

            //записываем данные в блоке с итоговой информацией о доставке и цене
            delivery_addres.textContent = data.cityName + ' ' + GDS.delivery.pvz_or_postomat_address;
            delivery_term.textContent = data.term + ' дней';

            Order_Prices.upadate_prices(); //вызываем для обнволяения знченйи цен в полях
        },
        //срабытывает при выборе пвз или постомата на карте и нажатию кнопки выбрать
    };

export default CONTROLLER;
