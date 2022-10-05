import anime from "./../base_func/anime.js";


//обработчик кастомного скролбара
class Custom_Scrollbar {

    anim_tf = "linear" //временная функция для анимаций прокрутки после клика на дорожку скрола по умолчанию

    anim_time = 200 //время выполнения анимации после клика на дорожку скрола

    //скрывает указанный скролбар и запрещает скриптам скрола взаимодейстовать с этим блоком пока у не есть класс disable_scrollbar_actions
    async hide() {
        this.element.addClass("disable_scrollbar_actions"); //помечаем что не нужно пересчитывать скролбар для данного блока при изменении его размеров

        await anime({
            targets: this.vertical_scroll[0],
            opacity: 0,
            easing: GDS.anim_tf,
            duration: GDS.anim_time
        }).finished; //скрываем скролбар

        this.vertical_scroll.css("display", "none"); //убираем его из потока
    }
    //скрывает указанный скролбар и запрещает скриптам скрола взаимодейстовать с этим блоком пока у не есть класс disable_scrollbar_actions

    //разрешает взаимодействие скриптам скролбара с данным элементом и отображает скролбар если он необходим
    show() {
        this.element.removeClass("disable_scrollbar_actions"); //помечаем для блока снова можно пересчитыва скролбар при изменении размеров блока

        this.size_recalculete(); //пересчитываем скролбар
    }
    //разрешает взаимодействие скриптам скролбара с данным элементом и отображает скролбар если он необходим

    //добавляем в разметку необходимые html элементы
    add_html_tags(element) {
        let content_wrap = document.createElement("div"),
            custom_scroll_wrap = document.createElement("div"),
            vertical_scroll = document.createElement("div"),
            scroll_slider = document.createElement("div");

        content_wrap.classList = "content_wrap";
        custom_scroll_wrap.classList = "custom_scroll_wrap";
        vertical_scroll.classList = "vertical_scroll";
        scroll_slider.classList = "scroll_slider";

        vertical_scroll.appendChild(scroll_slider);

        for (let i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].nodeType === 3) continue;
            content_wrap.appendChild(element.childNodes[i]);
        }

        custom_scroll_wrap.appendChild(content_wrap);
        custom_scroll_wrap.appendChild(vertical_scroll);
        element.appendChild(custom_scroll_wrap);
    }
    //добавляем в разметку необходимые html элементы

    //записывает для текужего element все нужные эльменты в экземпляр класса для удобства доступа
    whrite_elements_in_class(element) {
        this.element = $(element);
        this.custom_scroll_wrap = this.element.children(".custom_scroll_wrap");
        this.content_wrap = this.custom_scroll_wrap.children(".content_wrap");
        this.vertical_scroll = this.custom_scroll_wrap.children(".vertical_scroll");
        this.scroll_slider = this.vertical_scroll.children(".scroll_slider");
    }
    //записывает для текужего element все нужные эльменты в экземпляр класса для удобства доступа

    //определяем нужна ли элементу прокрутка
    check_scroll_premission() {
        this.scroll_premission = Math.round(this.element.height()) >= this.custom_scroll_wrap.height({ type: "scrollHeight" }) ? false : true; //определяем нужна ли элементу прокрутка
        return this.scroll_premission;
    }
    //определяем нужна ли элементу прокрутка

    //выполниться в момент измениния размеров блока element
    async size_recalculete() {
        if (this.element.hasClass("disable_scrollbar_actions")) return; //проверяем можно ли пересчитывать параметры скролбара для данного элемента

        this.check_scroll_premission(); //определяем нужна ли элементу прокрутка

        //если элементу не нужна прокуртка прерываем дальнейшие длействия
        if (!this.scroll_premission) {
            this.custom_scroll_wrap.css("overflow", "visible visible"); //если не нужна прокрутка делаем чтоб содержимое занимало всё доступное пространство

            await anime({
                targets: this.vertical_scroll[0],
                opacity: 0,
                easing: GDS.anim_tf,
                duration: GDS.anim_time
            }).finished; //плавно скрываем скролбар

            //проверяем ещё раз т.к. пока ждали завершение предидущей операции значение могло поменяться
            if (!this.scroll_premission) this.vertical_scroll.css({ "display": "none" }); //скрыаем скролбар из потока

            return; //прерываем функцию
        }
        //если элементу не нужна прокуртка прерываем дальнейшие длействия

        //если нужна прокрутка
        else {
            this.custom_scroll_wrap.css("overflow", "hidden auto"); //если нужна прокрутка то добавляем её в блок чтоб содержимое которое не поместилось по высоте могла быть прокручено

            this.vertical_scroll.css({ "display": "block" }); //возвращаем скролбар в поток

            anime({
                targets: this.vertical_scroll[0],
                opacity: 1,
                easing: GDS.anim_tf,
                duration: GDS.anim_time
            }); //плавно показываем скролбар
        }
        //если нужна прокрутка

        let scroll_size_pecent = (this.custom_scroll_wrap.height() / (this.custom_scroll_wrap.height({ type: "scrollHeight" }) / 100)) / 100; //вычисляем размер ползунка

        await anime({
            targets: this.scroll_slider[0],
            height: this.custom_scroll_wrap.height() * scroll_size_pecent + "px",
            easing: GDS.anim_tf,
            duration: GDS.anim_time
        }).finished; //устанавливаем размер ползунка и плавно его анимируем ОБЯЗАТЕЛЬНО дожидаемся иначе дальше бдут ошибки т.к. используется высота

        this.scroll_slider_height = this.scroll_slider.height(); //высота ползунка сакролбара

        this.scroll_slider_hod = this.vertical_scroll.height() - this.scroll_slider_height; //высота хода ползунка, т.е. размер дорожки ползунка с вычетом размера самого ползунка

        this.content_wrap_max_smeshenie = this.custom_scroll_wrap.height({ type: "scrollHeight" }) - this.custom_scroll_wrap.height(); //максимальное смещение scrollTop для элемента оболочки контента

        this.scroll_event(); //вызываем для того чтоб ползунок изначально занял нужное положение
    }
    //выполниться в момент измениния размеров блока element

    //выполниться в момент прокрутки указанного элемента
    scroll_event() {
        if (this.scroll_slider.hasClass("active_scroll")) return; //если в данный момент скролбар используют для того чтоб тягать ползунок или кликнули по дорожке скролбара и ждут пока он приедет к нужному мету. В этом случае нам не нужно разрешать эту функцию т.к. она будет конфликтовать и ползунок будет дёргаться

        let position_content = this.custom_scroll_wrap[0].scrollTop, //текущее смещение content_wrap от верха родительского элемента custom_scroll_wrap в px

            scrolling_progres = position_content / (this.content_wrap_max_smeshenie / 100) <= 100 ? position_content / (this.content_wrap_max_smeshenie / 100) : 100, //смещение от верха родительского элемента в процентах т.е. прогресс прокрутки

            scroll_slider_smeshenie = (this.scroll_slider_hod / 100) * scrolling_progres; //расстояние на которое должен сместится ползунок относительно верха родительского элемента

        this.scroll_slider.css("top", scroll_slider_smeshenie + "px"); //меняем вертикальную позицию ползунка скрола
    }
    //выполниться в момент прокрутки указанного элемента

    //собираем и инициализируем скролбар
    constructor(element) {
        if (element === window || element === document || element.nodeName === "HTML") return; //в случаее неприемлемого блока для скрода завершаем функцию;

        this.add_html_tags(element); //добавляем необходимую разметку в element для работы скролбара

        this.whrite_elements_in_class(element); //записывает для текужего element все нужные эльменты в экземпляр класса для удобства доступа

        this.custom_scroll_wrap.on({
            events: "scroll_optimize",
            callback: this.scroll_event.bind(this)
        }); //следим за прокруткой custom_scroll_wrap - это блок в которм находится контейнер со всем содержимым и блок скролла 

        let custom_scroll_wrap_height = this.custom_scroll_wrap.height(),
            custom_scroll_wrap_scrollHeight = this.custom_scroll_wrap.height({ type: "scrollHeight" });

        this.content_wrap_max_smeshenie = custom_scroll_wrap_scrollHeight - custom_scroll_wrap_height; //максимальное смещение scrollTop для элемента оболочки контента

        let scroll_size_pecent = (custom_scroll_wrap_height / (custom_scroll_wrap_scrollHeight / 100)) / 100; //вычисляем размер ползунка

        this.scroll_slider.css("height", custom_scroll_wrap_height * scroll_size_pecent + "px"); //устанавливаем размер ползунка

        this.scroll_slider_height = this.scroll_slider.height(); //высота ползунка сакролбара
        this.scroll_slider_hod = this.vertical_scroll.height() - this.scroll_slider_height; //высота хода ползунка, т.е. размер дорожки ползунка с вычетом размера самого ползунка

        this.check_scroll_premission(); //определяем нужна ли элементу прокрутка

        //если элементу нужна прокуртка исходя из его размеров и размеров содержимого
        if (this.scroll_premission) {
            this.vertical_scroll.css("display", "block"); //показываем скролбар
            this.custom_scroll_wrap.css("overflow", "hidden auto"); //делаем блок прокручиваемым
            this.scroll_event(); //вызываем для того чтоб ползунок изначально занял нужное положение
        }
        //если элементу нужна прокуртка исходя из его размеров и размеров содержимого

        $(window).on({
            events: "resize_optimize",
            callback: this.size_recalculete.bind(this)
        }); //пересчитываем размеры и состояние скролбара при ресайзе окна

        this.size_recalculete(); //вызываем функцию для изначально расчёта размеров скролбара 

        //т.к. мы поддерживаем ios 10.3+ но ResizeObserver поддерживается только в 13.4 то мы должны проверить его доступность
        if (window.ResizeObserver === undefined) {
            //чтоб быть уверенным что скролбар подстроится мы вызовем функцию пересчётка 4 раза в секунду при скроле
            this.custom_scroll_wrap.on({
                events: "scroll_throttle",
                callback: this.size_recalculete.bind(this),
                custom_settings: {
                    interval: 250
                }
            });
            //чтоб быть уверенным что скролбар подстроится мы вызовем функцию пересчётка 4 раза в секунду при скроле
        } else {
            //ПРИМЕЧАНИЕ: срабатывает при прокуртке страници из-за того что в документ динамичски добавляется кнопка скролла вверх и это вызывает observer для прямых потомком content_wrap
            let observer = new ResizeObserver(this.size_recalculete.bind(this)); //выполним при изменении размеров необходимых элементов

            observer.observe(this.element[0]); //при изменение размеров основного блока пересчитываем необходимые значения

            //при изменении блоков в контент блоке так же пересчитываем новые значения
            for (let i = 0; i < this.content_wrap[0].children.length; i++) {
                observer.observe(this.content_wrap[0].children[i]);
            }
            //при изменении блоков в контент блоке так же пересчитываем новые значения
        }

        this.vertical_scroll.on({
            events: "mousedown touchstart",
            callback: this.click_on_scrolbar.bind(this)
        }); //клик по дорожке скролбара и прокурутка к заданному месту

        this.scroll_slider.on({
            events: "mousedown touchstart",
            callback: this.move_scrollbar_slider.bind(this)
        }); //нажали на ползунок скролбара и можем водилть для перемотки

        this.element[0].setAttribute("data-custom-scrollbar", "init"); //помечаем что данный элемент обработан
    }
    //собираем и инициализируем скролбар

    //клик по дорожке скрола для перемотки к нужному месту
    //ПРИМЕЧАНИЕ: при тестировани с пк браузера и переходе из пк версии в мобильную без перезагрузки возникает ошибк апри которой срабатывают сразу два события касания и тача да так что мышь срабатывает раньше так что это баг в браузере при разработке в продакшене такого быть не должно
    async click_on_scrolbar(e) {
        if (GDS.global_interactiv_lock) return; //если в данные момент интерактивные элементы на сайте заблокированны то завершаем функцию

        if (e.target === this.scroll_slider[0]) return; //если объектом клика стал ползунок то прерываем дальнейшую обработку

        if (GDS.devise_touch && e.touches && e.touches.length > 1) return; //если это сенсорное устройство и в данный момент точек касния больше одной то завершаем выполнение. Т.к. при двух точках касания у мобильных свои события увеличение выделение и прочиеs
        //ПРИМЕЧАНИЕ: e.touches проверка нужна чтоб отсеять клики в режиме разработчика когда страбатывает событие клика мышки на сенсорном экране

        this.desable_default_events(); //убираем события по умолчанию

        this.scroll_slider.addClass("active_scroll"); //помечаем что данный скрол активен

        let scroll_slider_top, //top позиция ползунка сколбара

            pageY = GDS.devise_touch && e.touches ? e.touches[0].pageY : e.pageY, //позиция указателя относительно документа по вертикали
            click_point_y = Math.abs(this.element[0].getBoundingClientRect().top - pageY); //вертикальные координаты места нажатия на полоску скрола

        //если клик по дорожке слайдера был ниже чем высота хода ползунка
        if (click_point_y >= this.scroll_slider_hod) {
            scroll_slider_top = this.scroll_slider_hod;
        }
        //если клик по дорожке слайдера был ниже чем высота хода ползунка

        //если клик по дорожке слайдера был выше чем высота ползунка
        else if (click_point_y <= this.scroll_slider_height) {
            scroll_slider_top = 0;
        }
        //если клик по дорожке слайдера был выше чем высота ползунка
        else {
            scroll_slider_top = click_point_y - (this.scroll_slider_height / 2); //тем самым мы помещаем ползунок так чтоб его центр был на курсоре
        }

        let content_wrap_smeshenie = scroll_slider_top / (this.scroll_slider_hod / 100), //получаем процентное смещение которое нужно сделать для контент блока

            st = String(Math.ceil((this.content_wrap_max_smeshenie / 100) * content_wrap_smeshenie)); //смещение для контент блока в пикселях

        //дожидаемся пока выполянтся все преобразования
        await Promise.all([
            anime({
                targets: this.scroll_slider[0],
                top: scroll_slider_top + "px",
                easing: this.anim_tf,
                duration: this.anim_time
            }).finished, //меняем положение ползунка по вертикали

            anime({
                targets: this.custom_scroll_wrap[0],
                scrollTop: st,
                easing: this.anim_tf,
                duration: this.anim_time
            }).finished //прокуручиваем на необходимое расстояние
        ]);
        //дожидаемся пока выполянтся все преобразования

        this.scroll_slider.removeClass("active_scroll"); //убираем пометку активного скрола

        this.enable_default_events(); //возвращем события по умолчанию

    }
    //клик по дорожке скрола для перемотки к нужному месту

    //обрабатываем перетаскивание позунка
    move_scrollbar_slider(e) {
        if (GDS.global_interactiv_lock) return; //если в данные момент интерактивные элементы на сайте заблокированны то завершаем функцию

        if (GDS.devise_touch && e.touches && e.touches.length > 1) return; //если это сенсорное устройство и в данный момент точек касния больше одной то завершаем выполнение. Т.к. при двух точках касания у мобильных свои события увеличение выделение и прочие
        //ПРИМЕЧАНИЕ: e.touches проверка нужна чтоб отсеять клики в режиме разработчика когда страбатывает событие клика мышки на сенсорном экране

        let _this = this; //для доступка из внутрениих функций

        _this.desable_default_events(); //убираем события по умолчанию

        let pageY = GDS.devise_touch && e.touches ? e.touches[0].pageY : e.pageY, //позиция указателя относительно документа по вертикали

            top_point_on_slider = pageY - (_this.scroll_slider[0].getBoundingClientRect().top); //получаем точку на ползунке по которой кликнули и вычисляем разтояние от этой точки до верха ползунка

        //срабатывает при перемещении указателя
        let move_scroll_slider = function(e) {
                if (GDS.devise_touch && e.touches && e.touches.length > 1) return; //если это сенсорное устройство и в данный момент точек касния больше одной то завершаем выполнение

                _this.scroll_slider.addClass("active_scroll"); //помечаем что данный скрол активен

                let top = _this.element[0].getBoundingClientRect().top, //верхний край основного элмента относительно всего документа
                    bottom = _this.element[0].getBoundingClientRect().bottom, //нижний край основного элмента относительно всего документа
                    min = 0, //минимальное растояние на которое можно сместить слайдер по вертикали свойтсвом top
                    max = Math.abs(_this.scroll_slider_hod), //максимальное растояние на которое можно сместить слайдер по вертикали свойтсвом top
                    pageY = GDS.devise_touch && e.touches ? e.touches[0].pageY : e.pageY, //позиция указателя относительно документа по вертикали
                    slider_smeshenie = pageY - top - top_point_on_slider; //ползунок всегда будет в том же положени в котором был в момент клика относительно курсора

                //если расчётное смещение сладера выходит за пределы максимума и минимума допустимых смещений округляем к нужным занчениям
                if (slider_smeshenie > max) slider_smeshenie = max;
                if (slider_smeshenie < min) slider_smeshenie = min;

                _this.scroll_slider.css("top", slider_smeshenie + "px"); //меняем вертикально положение ползунка

                let content_wrap_smeshenie = slider_smeshenie / (_this.scroll_slider_hod / 100); //расчитываем процент смещения для прокрутки контента

                let st = (_this.content_wrap_max_smeshenie / 100) * content_wrap_smeshenie; //получаем числовое смещение контента


                _this.custom_scroll_wrap[0].scrollTop = st; //скролим контент блок к нужному значению scrolTop

            },
            //срабатывает при перемещении указателя

            //отключаем слушатели событий которые уже не нужны
            remove_events = function() {
                $(document).off({
                    events: "mousemove touchmove",
                    callback: move_scroll_slider,
                    options_event: { passive: false }
                });
                $(document).off({
                    events: "mouseup touchend",
                    callback: remove_events,
                    options_event: { passive: false }
                });

                _this.scroll_slider.removeClass("active_scroll"); //убираем пометку активного скрола

                _this.enable_default_events(); //возвращем события по умолчанию
            };
        //отключаем слушатели событий которые уже не нужны

        $(document).on({
            events: "mousemove touchmove",
            callback: move_scroll_slider,
            options_event: { passive: false }
        }); //начинаем слушать собитие движение курсора
        $(document).on({
            events: "mouseup touchend",
            callback: remove_events
        }); //как только курсор отпущен удаляем ненужные слушатели

    }
    //обрабатываем перетаскивание позунка

    //отключает действия по умолчанию для двидения мышки и кажатия с касание, нужно чтоб избежать нежелательно выделения контента в момент скрола
    desable_default_events() {
        $(document).on({
            events: "mousemove touchmove",
            callback: this.rem_def,
            options_event: { passive: false }
        });
        $(document).on({
            events: "mousedown touchstart",
            callback: this.rem_def,
            options_event: { passive: false }
        });
    }
    //отключает действия по умолчанию для двидения мышки и кажатия с касание, нужно чтоб избежать нежелательно выделения контента в момент скрола

    //возвражаем действия по умолчанию для движения мышки и касания с нажатием
    enable_default_events() {
        $(document).off({
            events: "mousemove touchmove",
            callback: this.rem_def,
            options_event: { passive: false }
        });
        $(document).off({
            events: "mousedown touchstart",
            callback: this.rem_def,
            options_event: { passive: false }
        });
    }
    //возвражаем действия по умолчанию для движения мышки и касания с нажатием

    //убирает дейтвие по умолчанию
    rem_def(e) {
        if (typeof e.cancelable !== 'boolean' || e.cancelable) e.preventDefault();
    }
    //убирает дейтвие по умолчанию
}
//обработчик кастомного скролбара

export default new class {
    //инициализирует модуль, ищет и подготавливает все элементы которые помечены для кастомизации скролбара
    constructor() {
        //добавлеяем кастомный скролбар для каждого элемента в наборе
        $("[data-custom-scrollbar]").each(item => {
            item.custom_scroll = new Custom_Scrollbar(item); //инициализируем скролбар для текущего итирируемого элемента и записываем объект скролбара в свойтва элемента для удобства доступа

            if (item === $("body")[0]) GDS.body_scroll_wrap = $("body>.custom_scroll_wrap"); //записываем новую оболочку для отслеживания прокрутки

            if (item === $("header")[0]) GDS.header_scroll_wrap = $("header>.custom_scroll_wrap"); //записываем новую оболочку для отслеживания прокрутки

        });
        //добавлеяем кастомный скролбар для каждого элемента в наборе

        GDS.scroll_dir = "bottom"; //начально направление скрола
        GDS.scrollTop = 0; //отсуп от верха страницы

        //следим за скролом в body и в header
        GDS.body_scroll_wrap.add(GDS.header_scroll_wrap).on({
            events: "scroll_optimize",
            callback: this.get_scroll_direction
        });
        //следим за скролом в body и в header
    }
    //инициализирует модуль, ищет и подготавливает все элементы которые помечены для кастомизации скролбара

    //определяем направление скрола
    get_scroll_direction() {
        if (GDS.scrollTop > this.scrollTop) {
            GDS.scroll_dir = "top";
        } else if (GDS.scrollTop < this.scrollTop) {
            GDS.scroll_dir = "bottom";
        }
        GDS.scrollTop = this.scrollTop;
    }
    //определяем направление скрола
}