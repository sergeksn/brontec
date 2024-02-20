import { Header } from '@header-main-js';

let to_partners_map_url_string = '#partners-map',
    MAP = {
        YNDEX_MAP: null, //экземпляр карты яндекса
        clusterer: null, //кластер со всеми метками
        map_wrap: qs('.instrukczii-3__map'), //оболочка карты
        map_body: qs('.instrukczii-3__map-body'), //карта

        active_point: null,

        init: function () {
            w._on('load', this.load_ym_script.bind(this)); //после загрузки страницы зыгружаем скрипт для работы яндекс карты

            //если мы перешли на страницу целенаправлино на блок с картой партнёров
            if (location.hash == to_partners_map_url_string) {
                Header.hide_and_lock_on_time(); //скрываем хедер скрываем и блокируем показ хедера на секунду чтоб он не закрывал часть экрана
                history.pushState(null, '', location.href.replace(to_partners_map_url_string, '')); //делаем в истории браузера ссылку на эту страницу но уже без примиски #send-request-for-new-car чтоб при обновлении не перекидывало на карту, хз обязательно это или нет не тестил во всех браузерах, пусть лучше будет =)
            }
            //если мы перешли на страницу целенаправлино на блок с картой партнёров
        },

        //загружает скрипт яндекс карты и после загрузки запускает её рендер
        load_ym_script: function () {
            let script = d.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + GDS.YANDEX_MAP_API_KEY + '&lang=ru_RU';
            this.map_wrap.append(script);

            script._on('load', () => ymaps.ready(this.render_map, null, this));
        },
        //загружает скрипт яндекс карты и после загрузки запускает её рендер

        //отображает карту с начальными параметрами
        render_map: function () {
            this.YNDEX_MAP = new ymaps.Map(this.map_body, {
                bounds: GDS.partners_data[Object.keys(GDS.partners_data)[0]].bounds, //берём первую територию из списка и показываем её по умолчанию
                controls: ['zoomControl'],
            });

            this.add_claster_points_on_map(); //добавляем все точки на карту в виде кластера
        },
        //отображает карту с начальными параметрами

        //добавляем все точки на карту в виде кластера
        add_claster_points_on_map: function () {
            let all_partner_points = []; //сюда мы запишем все созданные партнёрские точки

            this.clusterer = new ymaps.Clusterer({
                clusterIconColor: '#0049FF',
            }); //создаём кластер

            //добавляем все партнёрские точки в массив в качестве геообъектов
            for (let area in GDS.partners_data) {
                for (let point in GDS.partners_data[area].points) {
                    let point_id = point,
                        point_data = GDS.partners_data[area].points[point],
                        mark = new ymaps.GeoObject(
                            {
                                geometry: { type: 'Point', coordinates: point_data.coords },
                                properties: {
                                    id: point_id,
                                },
                            },
                            {
                                // Опции.
                                // Необходимо указать данный тип макета.
                                iconLayout: 'default#image',
                                // Своё изображение иконки метки.
                                iconImageHref: GDS.host_url + '/wp-content/plugins/ksn_shop/integrations/yandex-map/img/default-marker.svg',
                                // Размеры метки.
                                iconImageSize: [38, 52],
                                // Смещение левого верхнего угла иконки относительно
                                // её "ножки" (точки привязки).
                                iconImageOffset: [-19, -47],
                            },
                        );

                    all_partner_points.push(mark);

                    GDS.partners_data[area].points[point_id].obj = mark; //записываем точку в данные чтоб можно было к ней обращатся

                    mark.events.add('click', this.click_on_mark.bind(this)); //при нажатии на любую добавленную метку
                }
            }
            //добавляем все партнёрские точки в массив в качестве геообъектов

            this.clusterer.add(all_partner_points); //добавляем все точки в кластер
            this.YNDEX_MAP.geoObjects.add(this.clusterer); //добавляем кластер на карту
        },
        //добавляем все точки на карту в виде кластера

        //при нажатии на метку
        click_on_mark: function (e) {
            let mark = e.get('target'); //метка по которой кликнули

            this.clean_active_elements(); //чистим с карты все временные, редактируемые и активные эльменты

            this.active_point = mark; //записываем ноувую активную метку
            mark.options.set('iconImageHref', GDS.host_url + '/wp-content/plugins/ksn_shop/integrations/yandex-map/img/focus-marker.svg'); //выделяем новую метку

            let point_id = this.active_point.properties.get('id'), //получаем id метки
                point_coords = e.get('target').geometry.getCoordinates(), //координаты точки
                area_name = this.check_in_areas(point_coords), //по кординатам метки узнаём в какой облати она находится
                data_mark = GDS.partners_data[area_name].points[point_id]; //получаем другие данные этой метки
            POP_UP.open(); //открываем окно с данными точки

            POP_UP.write_data(data_mark); //записшет данные точки в блоки попапа

            AREA_LIST.set_active_area(area_name); //устанавливает новую активную область выделяя её в списке и заголовке блок поиска

            this.set_point_in_center_visible_map_part(); //высчитываем нужные координаты для центрирования карты так чтоб точка былоа по центру ВИДИМОЙ части карты и центруем туда карту
        },
        //при нажатии на метку

        //высчитываем нужные координаты для центрирования карты так чтоб точка былоа по центру ВИДИМОЙ части карты и центруем туда карту
        set_point_in_center_visible_map_part: function () {
            let map_sl = w.getComputedStyle(this.map_body),
                pop_up__sl = w.getComputedStyle(POP_UP.wrap),
                map_width = +map_sl.width.replace('px', ''),
                pop_up_width = +pop_up__sl.width.replace('px', ''),
                map_height = +map_sl.height.replace('px', ''),
                pop_up_height = +pop_up__sl.height.replace('px', ''),
                area_list_height = +w.getComputedStyle(AREA_LIST.area_list_block).height.replace('px', ''),
                map_bounds,
                point = (y, x) => ({ y, x }),
                map_area,
                coords_active_point = this.active_point.geometry.getCoordinates();
            center_coords = {
                x: 0,
                y: 0,
            };

            this.YNDEX_MAP.setCenter([coords_active_point[0], coords_active_point[1]]); //быстро центруем активную метку

            map_bounds = this.YNDEX_MAP.getBounds(); //записываем границы карты при центрованной активной метке

            map_area = {
                top_left: point(map_bounds[0][0], map_bounds[0][1]),
                top_right: point(map_bounds[0][0], map_bounds[1][1]),
                bottom_right: point(map_bounds[1][0], map_bounds[1][1]),
                bottom_left: point(map_bounds[1][0], map_bounds[0][1]),
            };

            if (w.matchMedia('(min-width:40rem)').matches) {
                let visible_map_width_pecent = 100 - (pop_up_width * 100) / map_width, //процент видимой части карты
                    pol_map = ((map_area.top_right.x - map_area.top_left.x) * visible_map_width_pecent) / 100, //пловина ширины видимой карты в координатах
                    x_offset = ((map_area.top_right.x - map_area.top_left.x) * (visible_map_width_pecent - 50)) / 100; //смещение в координатах относительно искомого центра карты

                center_coords.x = pol_map / 2 - x_offset + coords_active_point[1];
                center_coords.y = coords_active_point[0];

                this.YNDEX_MAP.setCenter([center_coords.y, center_coords.x]); //центруем карту на точке
            } else {
                let visible_map_height_pecent = 100 - (pop_up_height * 100) / map_height, //процент видимой части карты
                    pol_map = ((map_area.bottom_right.y - map_area.top_right.y) * visible_map_height_pecent) / 100, //пловина ширины видимой карты в координатах
                    y_offset = ((map_area.bottom_right.y - map_area.top_right.y) * (visible_map_height_pecent - 50)) / 100, //смещение в координатах относительно искомого центра карты
                    area_list_y_offset = ((map_area.bottom_right.y - map_area.top_right.y) * ((area_list_height * 100) / map_height)) / 100; //смещение в координатах из-за высоты блока списка

                center_coords.x = coords_active_point[1];
                center_coords.y = coords_active_point[0] - (pol_map / 2 - y_offset) + area_list_y_offset;

                this.YNDEX_MAP.setCenter([center_coords.y, center_coords.x]); //центруем карту на точке
            }
        },
        //высчитываем нужные координаты для центрирования карты так чтоб точка былоа по центру ВИДИМОЙ части карты и центруем туда карту

        //чистим с карты все активные эльменты
        clean_active_elements: function () {
            if (this.active_point) this.active_point.options.set('iconImageHref', GDS.host_url + '/wp-content/plugins/ksn_shop/integrations/yandex-map/img/default-marker.svg'); //если есть активная метка то мы убираем её выделение
        },
        //чистим с карты все активные эльменты

        //проверяет попадает ли точка в какую-то из существующих областей
        check_in_areas: function (coords) {
            let serched_area; //первая найденая область

            //перебираем все области в поисках вхождения точки в них
            for (let area in GDS.partners_data) {
                if (this.in_area(coords, GDS.partners_data[area].bounds)) {
                    serched_area = area;
                    break;
                }
            }
            //перебираем все области в поисках вхождения точки в них

            return serched_area;
        },
        //проверяет попадает ли точка в какую-то из существующих областей

        //проверяет попадание координат в прямоугольник
        in_area: function (coords, bounds) {
            let point = (x, y) => ({ x, y }),
                A = point(bounds[0][0], bounds[0][1]), //верх лево
                B = point(bounds[0][0], bounds[1][1]), //верх право
                C = point(bounds[1][0], bounds[1][1]), //низ право
                D = point(bounds[1][0], bounds[0][1]), //низ лево
                E = point(coords[0], coords[1]),
                side = (a, b, p) => Math.sign((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)),
                inArea = side(A, B, E) === -1 && side(B, C, E) === -1 && side(C, D, E) === -1 && side(D, A, E) === -1;

            return inArea;
        },
        //проверяет попадание координат в прямоугольник
    },
    POP_UP = {
        wrap: qs('.instrukczii-3__map-point-pop-up'),
        close_button: qs('.instrukczii-3__map-point-pop-up-close-button'),
        info_wrap: qs('.instrukczii-3__map-point-pop-up-info'),
        name_block: qs('.instrukczii-3__map-point-pop-up-info-name'),
        description_block: qs('.instrukczii-3__map-point-pop-up-info-description'),
        address_block: qs('.instrukczii-3__map-point-pop-up-info-address'),
        site_block: qs('.instrukczii-3__map-point-pop-up-info-site'),
        phone_block: qs('.instrukczii-3__map-point-pop-up-info-phone'),

        init: function () {
            this.close_button._on('click', this.close.bind(this)); //скрываем попап при клике на крестик

            this.address_block._on('click', MAP.set_point_in_center_visible_map_part.bind(MAP)); //центруем видимую часть карту на выбраной точке при клике на адрес в попапе
        },

        //записшет данные точки в блоки попапа
        write_data: function (data) {
            this.name_block.textContent = data.name;
            this.description_block.textContent = data.description;
            this.address_block.textContent = data.address;

            this.site_block.textContent = data.site;
            this.site_block.href = data.site;

            this.phone_block.textContent = data.phone;
            this.phone_block.href = 'tel:+' + data.phone.replace(/[^0-9]/g, '');
        },
        //записшет данные точки в блоки попапа

        open: function () {
            this.wrap.style.display = 'block';
        },

        close: function () {
            this.wrap.style.display = '';

            MAP.clean_active_elements(); //чистим с карты все активные эльменты
        },
    },
    AREA_LIST = {
        status: 'close',
        area_list_nead_height: null, //нужная высота списка
        area_list_block: qs('.instrukczii-3__map-area-list'), //оболочка модуля списка територий
        search_wrap: qs('.instrukczii-3__map-area-list-search'), //оболочка блока поиска
        search_input: qs('.instrukczii-3__map-area-list-search-input'), //инпут поиска
        search_arrow: qs('.instrukczii-3__map-area-list-search-arrow'), //кнопка-стрелка разворачивания списка
        area_list: qs('.instrukczii-3__map-area-list-wrap'), //оболочка списка територий
        active_item: null, //текущший активный элемент списка
        search_title: qs('.instrukczii-3__map-area-list-search-title'), //облочка названия текущей области в блоке поиска
        search_title_text: qs('.instrukczii-3__map-area-list-search-title-text'), //название обаласти в блоке поиска
        search_title_counter: qs('.instrukczii-3__map-area-list-search-title-counter'), //количества точек в текущнй области в блоке поиска
        init: function () {
            this.all_items = qsa('.instrukczii-3__map-area-list-wrap-item', qs('.instrukczii-3__map-area-list-wrap')); //все элементы списка

            this.size_recalkulate(); //пересчитывает высоту списка територий

            w._on('resize', this.size_recalkulate.bind(this)); //пересчитывает высоту списка територий ghb htcfqpf[]

            this.search_arrow._on('click', this.toggle_list.bind(this)); //открывает закрытый список и закрывает открытый

            this.all_items.forEach(el => el._on('click', this.click_on_item.bind(this))); //подключаем слушатели ко всем элементам списка територий

            this.search_input._on('input', this.search_areas.bind(this)); //ведём поиск при вводе текст в поле поиска

            this.set_active_area(Object.keys(GDS.partners_data)[0]); //устанавливает новую активную область выделяя её в списке и заголовке блок поиска
        },

        //устанавливает новую активную область выделяя её в списке и заголовке блок поиска
        set_active_area: function (area_name) {
            if (this.active_item) this.active_item.removeAttribute('data-active'); //если был активный элемент списка снимаем выделение

            let new_active_item = [...this.all_items].find(el => qs('.instrukczii-3__map-area-list-wrap-item-title', el).textContent === area_name); //ищем элемент списка этой области

            //выделяем элемент и записываем его
            this.active_item = new_active_item;
            this.active_item.setAttribute('data-active', '');

            this.update_search_title(area_name); //обновляет данные области и количества точек в блоке поиска
        },
        //устанавливает новую активную область выделяя её в списке и заголовке блок поиска

        //обновляет данные области и количества точек в блоке поиска
        update_search_title: function (area_name) {
            this.search_title_text.textContent = area_name;
            this.search_title_counter.textContent = Object.keys(GDS.partners_data[area_name].points).length;
        },
        //обновляет данные области и количества точек в блоке поиска

        //ведём поиск при вводе текст в поле поиска
        search_areas: function (e) {
            if (this.status === 'close') this.open_list(); //если список закрыт открываем его

            this.all_items.forEach(el => (el.style.display = '')); //по умолчанию показываем все элементы

            let searched_text = e.target.value.toLowerCase(); //переводим текст поиска в нижний регипстр

            //отсеиваем те элементы которые нам не подходят
            let invalid_items = [...this.all_items].filter(el => {
                let area_name = qs('.instrukczii-3__map-area-list-wrap-item-title', el).textContent.toLowerCase(); //получаем название области элемента

                return area_name.slice(0, searched_text.length) !== searched_text; //добавляем её в списох неподходящиъ если вводимый текст не соответствует названию области
            });
            //отсеиваем те элементы которые нам не подходят

            invalid_items.forEach(el => (el.style.display = 'none')); //скрываем все неподходящие элементы
        },
        //ведём поиск при вводе текст в поле поиска

        //пересчитывает высоту списка територий
        size_recalkulate: function () {
            let map_height = +w.getComputedStyle(MAP.map_wrap).height.replace('px', ''),
                search_height = +w.getComputedStyle(this.search_wrap).height.replace('px', '');

            this.area_list_nead_height = map_height - search_height + 'px';

            this.area_list.style.maxHeight = this.area_list_nead_height;
        },
        //пересчитывает высоту списка територий

        //открывает закрытый список и закрывает открытый
        toggle_list: function () {
            this.status == 'close' ? this.open_list() : this.close_list();
        },
        //открывает закрытый список и закрывает открытый

        open_list: function () {
            this.area_list.style.display = 'block';
            this.search_input.style.display = 'block';
            this.search_title.style.display = 'none';
            this.status = 'open';
            this.search_arrow.dataset.status = 'open';
        },

        close_list: function () {
            this.area_list.style.display = '';
            this.search_input.style.display = '';
            this.search_title.style.display = '';
            this.status = 'close';
            this.search_arrow.dataset.status = 'close';

            this.search_input.value = '';

            this.all_items.forEach(el => (el.style.display = '')); //показываем все элементы
        },

        //срабатывает при клике на элемент списка
        click_on_item: function (e) {
            let target = e.composedPath().find(el => el.classList?.contains('instrukczii-3__map-area-list-wrap-item')); //ищем именно оболочку элемента

            if (this.active_item) this.active_item.removeAttribute('data-active'); //если был активный элемент списка снимаем выделение

            this.active_item = target; //записываем новый активный элемент

            target.setAttribute('data-active', ''); //добавляем атрибут активного элемента

            let area_name = qs('.instrukczii-3__map-area-list-wrap-item-title', target).textContent; //получеам имя региона выделенного элемента

            this.update_search_title(area_name); //обновляет данные области и количества точек в блоке поиска

            MAP.YNDEX_MAP.setBounds(GDS.partners_data[area_name].bounds); //позиционируем карту на нужной области

            MAP.clean_active_elements(); //чистим с карты все временные, редактируемые и активные эльменты

            this.close_list(); //закрываем список
        },
        //срабатывает при клике на элемент списка
    };

(() => {
    let map_wrap = qs('.instrukczii-3__map'); //оболочка карты

    if (!map_wrap) return; //прерываем если на странице нет карты

    if (map_wrap.dataset.admin == 'yes') return; //прерываем если мы в админке

    MAP.init();
    POP_UP.init();
    AREA_LIST.init();
})();
