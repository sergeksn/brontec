let delivery_input = qs('.oformit-zakaz-2 input'),
    delivery_addres = qs('.oformit-zakaz-4__delivery-info-address'),
    delivery_term = qs('.oformit-zakaz-4__delivery-info-term'),
    CONTROLLER = {
        init: function () {
            var widjet = new ISDEKWidjet({
                //defaultCity: 'auto',
                cityFrom: 'Екатеринбург',
                link: 'sdekmap',
                path: GDS.host_url + '/wp-content/plugins/ksn_shop/integrations/sdek/widget/scripts/',
                servicepath: GDS.host_url + '/wp-content/plugins/ksn_shop/integrations/sdek/widget/scripts/service.php', //ссылка на файл service.php на вашем сайте
                mode: 'pvz',
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
            console.log(data);

            GDS.delivery.city_name = data.cityName;
            GDS.delivery.id = data.id;
            GDS.delivery.price = data.price;
            GDS.delivery.price = data.term;
            GDS.delivery.pvz_name = data.PVZ.Name;
            GDS.delivery.pvz_address = data.PVZ.Address;

            delivery_input.value = data.id; //записываем id  в инпут чтоб он перестал быть пустым

            //записываем данные в блоке с итоговой информацией о доставке и цене
            delivery_addres.textContent = data.cityName + ' ' + data.PVZ.Address;
            delivery_term.textContent = data.term + ' дней';
        },
        //срабытывает при выборе пвз или постомата на карте и нажатию кнопки выбрать
    };

CONTROLLER.init();

export default CONTROLLER;
