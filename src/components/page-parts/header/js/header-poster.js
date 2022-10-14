//БАНЕР
GDS.top_baner = {
    //инициализируем все скрипты для работы с верхним банером
    init: function() {
        if (GDS.header.has_top_baner === false) return; //если блока банера нет в теле документа прерываем инициализацию модуля

        //записываем все неоходимые переменные для удобства доступа
        this.header = $("header");
        this.top_baner = $(".top_banner_wrap"); //верхний банер если нашли
        this.close_baner_button = this.top_baner.find(".close_banner_wrap"); //кнопка закрытия банера в хедере
        this.cart = $("#cart");
        //записываем все неоходимые переменные для удобства доступа

        this.close_baner_button.on({
            events: "click touchend",
            callback: this.click_close_baner_button.bind(this)
        }); //скрываем банер при клике на крестик

        this.top_baner_swipe(); //добавляет слушатель для события банера свайпом
    },
    //инициализируем все скрипты для работы с верхним банером

    //добавляет слушатель для события банера свайпом и управляет промежуточными состояниями банера
    top_baner_swipe: function() {
        let _this = this; //для доступа к текущему объекту из внутренних функций

        //скрываем банер свайпом
        this.top_baner.on({
            events: "swipe",
            custom_settings: {
                permission_directions: {
                    top: false,
                    right: true,
                    bottom: false,
                    left: true
                }, //направления в которых нужно учитывать свайп
                min_percent_dist_x: 10, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в % от ширины экрана
                max_time: 5000, //максимальное время, за которое должен быть совершен свайп (ms)

                //двигаем банер за указателем
                callback_move: function() {
                    if (GDS.global_interactiv_lock) return; // прерываем если заблокированы интерактивные элементы

                    //если свайп начался на крестике банера или на его оболочке или на любом из его элементов
                    if ($(this.start_terget_el)[0] === _this.close_baner_button[0] || $(this.start_terget_el).parents(".close_banner_wrap").length > 0) {
                        this.abort_swipe_fail = true; //прерываем свайп
                        return;
                    }
                    //если свайп начался на крестике банера или на его оболочке или на любом из его элементов

                    let el = $(this.el),
                        sdvig_x = this.x - this.start_x,
                        sdvig_y = this.y - this.start_y;

                    if (this.start_direction) {
                        switch (this.start_direction) {
                            case "left":
                                el.css(this.start_direction, sdvig_x + "px");
                                break;
                            case "right":
                                el.css(this.start_direction, "-" + sdvig_x + "px");
                                break;
                        }
                    }
                },
                //двигаем банер за указателем

                //уводим банер с нужную сторону и скрываем его
                callback_success: async function() {
                    if (GDS.global_interactiv_lock) return; // прерываем если заблокированы интерактивные элементы

                    GDS.lock_all_interactive(); //блокируем все интерактивыне элементы

                    if (GDS.header.status !== "open") await GDS.header.open(200); //если мы кликнули вмомент когда хедер не открыт, вероятнее всего он в процессе закрытия или открытия, то мы дожидаемся пока хедер не откроется

                    await $(this.el).animate({
                        [this.start_direction]: "-100%"
                    }, GDS.anim_time, GDS.anim_tf);

                    await GDS.header.top_baner.hide_baner(false);

                    GDS.unlock_all_interactive(); //разблокируем все интерактивыне элементы
                },
                //уводим банер с нужную сторону и скрываем его

                //в случае неудачного свайпа возвращаем банер в исходное положение
                callback_fail: async function() {
                    let el = $(this.el),
                        dir = this.start_direction || null;

                    if (!dir) return; //если не задано стартовое направление движения

                    await el.animate({
                        [dir]: "0px"
                    }, 400, GDS.anim_tf);

                    el.removeAttr("style");
                },
                //в случае неудачного свайпа возвращаем банер в исходное положение

                //только при малом смещении или при отсутствии смещения вовсе делаем переход по ссылке из банера
                callback_finally: function() {
                    if (GDS.global_interactiv_lock) return; // прерываем если заблокированы интерактивные элементы

                    if ($(this.start_terget_el)[0] === _this.close_baner_button[0] || $(this.start_terget_el).parents(".close_banner_wrap").length > 0) return; //если свайп начался на крестике банера или на его оболочке или на любом из его элементов

                    if (Math.abs(this.x - this.start_x) <= 10 || this.x === 0) {
                        let el = $(this.el),
                            a = el.find("a"),
                            href = a.attr("href");
                        document.location.href = href
                    }
                }
                //только при малом смещении или при отсутствии смещения вовсе делаем переход по ссылке из банера
            }
        });
        //скрываем банер свайпом
    },
    //добавляет слушатель для события банера свайпом и управляет промежуточными состояниями банера

    //выполнится при клике на кнопку закрытия банера
    click_close_baner_button: async function() {
        if (GDS.global_interactiv_lock) return; // прерываем если заблокированы интерактивные элементы

        GDS.lock_all_interactive(); //блокируем все интерактивыне элементы

        if (GDS.header.status !== "open") await GDS.header.open(200); //если мы кликнули вмомент когда хедер не открыт, вероятнее всего он в процессе закрытия или открытия, то мы дожидаемся пока хедер не откроется

        await this.hide_baner(false); //скрываем банер

        GDS.unlock_all_interactive(); //разблокируем все интерактивыне элементы

    },
    //выполнится при клике на кнопку закрытия банера

    //скрываем банер
    //cookie - указывает скрывать банер без каписи в куки или с записью
    hide_baner: async function(cookie = true) {
        let baner_id = this.top_baner.attr("id"),
            baner_parent = this.top_baner[0].parentNode, //узел родительского элемента банера
            baner_script = $("#top_banner_script"), //скрипт в коде который уже не нужен
            baner_height = this.top_baner.height(), //высота блока банера
            header_h = GDS.header.get_header_always_visible_h(), //получаем актуальную высоту блока хедера без учёта скрытой части
            header_fon_podlozka_height = header_h - baner_height; //высота для подложки хедера

        //если скрытый блок открыт и его размер на всю высоту окна или открыто окно с результатами поиска
        if ((GDS.header.toggle_block.status === "open" && GDS.header.toggle_block.size === "full") || GDS.header.search.status === "open") {
            //если высота хедера без учёта банера больше или равно высоте окна
            if (GDS.header.get_header_h() - baner_height >= GDS.win_height) {
                this.header.css("height", this.header.height() + baner_height + "px"); //увеличиваем высоту хедера чтоб не появлялось пустое место снизу
            }
            //если высота хедера без учёта банера больше или равно высоте окна
            else {
                this.header.css("height", ""); //убираем явно заданную высоту у хедера чтоб при сокрытии банера хедер просто поднялся вверх
            }
        }
        //если скрытый блок открыт и его размер на всю высоту окна или открыто окно с результатами поиска

        //поднимаем хедер и уменщаем высоту его подложки
        await Promise.all([
            (async () => {
                if ((GDS.header.toggle_block.status === "open" && GDS.header.toggle_block.size === "full") || GDS.header.search.status === "open") await GDS.scrollbar.search_neaded_object(this.header).scroll_slider.animate({ "top": "+=" + baner_height + "px" }, GDS.anim_time, GDS.anim_tf); //если скрытый блок открыт и его размер на всю высоту окна или открыто окно с результатами поиска то мы должны синхронно опускать ползунок срола на высоту банера чтоб он не скрылся за верхом экрана
            })(),
            this.header.animate({ "top": "-" + baner_height + "px" }, GDS.anim_time, GDS.anim_tf), //поднимаем хедер чтоб скрыть банер за пределами видимой части экрана
            $("#header_fon_podlozka").animate({ "height": header_fon_podlozka_height + "px" }, GDS.anim_time, GDS.anim_tf), //плавно поднимаем подложку хедера и после того как анимация закончится вызываем колбек
            this.cart.animate({ "height": "+=" + baner_height + "px" }, GDS.anim_time, GDS.anim_tf) //увеличиываем высоту корзины на высоту банера чтоб она заняла всё освободившееся по вертикали место
        ]);
        //поднимаем хедер и уменщаем высоту его подложки

        if ((GDS.header.toggle_block.status === "open" && GDS.header.toggle_block.size === "full") || GDS.header.search.status === "open") GDS.scrollbar.search_neaded_object(this.header).scroll_slider.css("top", "0"); //если скрытый блок открыт и его размер на всю высоту окна или открыто окно с результатами поиска то мы должны после завершения анимации быстро поднять ползунок сролла вверх т.к. сразу после банер будет удалён из документа и высота хедера измениться и чтоб не было такого что ползунок окажется немного ниже чем нужно мы сразу поднимаем его вверх

        this.top_baner.css("display", "none"); //скрываем банер из документа
        this.header.css("top", "0"); //попутно быстро меняем верхнюю позицию для хедера сразу после удаленяи банера
        this.cart.css("top", ""); //попуткно поднимаем корзину к верху

        //НЕ УДАЛЯТЬ СТРОКУ
        if (cookie) bf.setCookie("top_baner_hide_" + baner_id, true); //если банер нужно скрыть на всегда записываем в куки что верхний банер с таким id не показывать
        //НЕ УДАЛЯТЬ СТРОКУ

        GDS.header.toggle_block.size_recalculate(); //пересчитываем размеры хереда

        if (GDS.header.search.status === "open") this.header.css("height", GDS.win_height + "px"); //если анер скрыли в момент когда открыто окно с результатами поиска то мы послескрытия задаём хереду высоту окна

        baner_parent.removeChild(this.top_baner[0]); //удаляем из тела документа банер
        baner_parent.removeChild(baner_script[0]); //удаляем из тела документа скрипт банера

        GDS.header.has_top_baner = false; //помечаем что банера в хедере больше нет
    },
    //bf.deleteCookie("top_baner_hide_id_NKkGUF0X9DGuvct")
    //скрываем банер
};
//БАНЕР