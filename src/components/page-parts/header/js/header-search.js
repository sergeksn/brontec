import { Header } from "./header-main";
import { wait, request_to_server } from "@js-libs/func-kit";
import { set_cookie, get_cookie, delete_cookie } from "@js-libs/cookie";
import Header_Toggle_Block from "./header-toggle-block";
//import Small_Product_Previv_Block from "./small_product_previv_block.js";
import { Img_Loader } from "@js-moduls/media";
import anime from "@js-libs/anime";

export default new (class {
    //pending to close - в процессе закрытия окна
    //close - окно закрыто
    //pending to open - в процессе открытия окна
    //open - окно открыто
    status = "close";

    cached_result = null; //сохранеям в данный объект результаты последнего поиска чтоб можно было их быстро использовать для повторного открытия окна поиска если не было очищено поле ввода

    input_timerid = null; //id таймера для задержки ввода

    //иницализируем все функции и слушатели для работы поиска
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.win = $(window);
        this.header = $("header");
        this.search_wrapper = $(".search_wrapper");
        this.search_input = this.search_wrapper.find("input");
        this.close_search_button = this.search_wrapper.find(".close_search");
        this.search_loader = $(".search_loader");
        this.results_wrapper = $(".results_wrapper");
        this.header_menu_mobile = $(".header_menu_mobile");
        this.header_phone_mobile = $(".header_phone_mobile");
        this.search_results = $(".search_results");
        //записываем все неоходимые переменные для удобства доступа

        $(".header_search_button_wrap, .header_search_bold_button_wrap, .header_burger_button_wrap").on({
            events: "click tochend",
            callback: this.click_header_search_button_wrap_or_burger_button.bind(this),
        }); //клик по кнопке поиска в меню или по кнопке бургер меню

        $("#header_overlay").on({
            events: "click tochend",
            callback: this.click_header_overlay.bind(this),
        }); //скрываем окно поиска по клику на полупрозрачную подложку

        this.close_search_button.on({
            events: "click tochend",
            callback: this.click_close_search_button.bind(this),
        }); //клик по крестику в окне поиска

        this.search_input.on({
            events: "input",
            callback: this.chenge_in_search_input.bind(this),
        }); //начинаем поиск после ввода символов

        this.win.on({
            events: "resize_optimize",
            callback: this.size_recalculate.bind(this),
        }); //выполяем нужные действия при ресайзе
    }
    //иницализируем все функции и слушатели для работы поиска

    //функция выполнится по нажатию на кнопку поиска в меню или на бургер кнопку
    async click_header_search_button_wrap_or_burger_button() {
        if (GDS.global_interactiv_lock) return; //если в данные момент интерактивные элементы на сайте заблокированны то завершаем функцию

        GDS.lock_all_interactive(); //блокируем все интерактивные элементы в хедере

        if (Header.status !== "open") await Header.open(200); //если мы кликнули вмомент когда хедер не открыт, вероятнее всего он в процессе закрытия или открытия, то мы дожидаемся пока хедер не откроется

        //if (GDS.cart.status === "open") await GDS.cart.close_cart(); //если открыта корзина то перед открытием или закрытием блока дожидаемся скрытия корзины

        let search_data = get_cookie("search_data"), //получаем последнее что пользователь вводил для поиска
            search_data_cookie_status = search_data !== undefined && search_data.length > 1 ? true : false; //проверяем соответствует ли запись в куки условию

        //если в куки есть поисковой запрос и он блоше чем один символ
        if (search_data_cookie_status) {
            this.search_input[0].value = search_data; //записываем текст поиска в инпут
            this.search_input.addClass("nachat_vvod"); //помечаем что в инпуте есть текст
        }
        //если в куки есть поисковой запрос и он блоше чем один символ

        //только если блок полностью закрыт
        if (Header_Toggle_Block.status === "close") {
            await Header_Toggle_Block.open_block(); //открываем блок

            if (!GDS.devise_touch) this.search_input[0].focus({ preventScroll: true }); //ставим курсор на наше поле ввода НЕ на сенсорных экранах

            //если в куки есть поисковой запрос и он блоше чем один символ, начинаем вывод результатов поиска и ждём его окончания
            if (search_data_cookie_status) {
                await this.open_results_block(); //открываем блок для выдачи результатов поиска

                this.render_results(search_data); //не ждём т.к. нам нужно чтоб пользователь мог закрыть окно до того как загрузятся результаты
            }
            //если в куки есть поисковой запрос и он блоше чем один символ, начинаем вывод результатов поиска и ждём его окончания
        }
        //только если блок полностью закрыт

        //только если блок полностью открыт
        else if (Header_Toggle_Block.status === "open") {
            if (this.status === "open") await this.close_results_block(true); //если блок с результатами поиска открыт дожидаемся его закрытия

            await Header_Toggle_Block.close_block(); //дожидаемся сворачивания скрытого блока

            this.header_menu_mobile.add(this.header_phone_mobile).css({ display: "", opacity: "" }); //убераем стили после полного скрытия скрытого блока чтоб при новор=м открытия они не мешали правильной визуализации
        }
        //только если блок полностью открыт

        GDS.unlock_all_interactive(); //разблокируем все интерактивные элементы в хедере
    }
    //функция выполнится по нажатию на кнопку поиска в меню или на бургер кнопку

    //открываем окно для отображения результатов поиска
    async open_results_block() {
        if (this.status !== "close") return false; //если окно с результатами поиска не до конца закрыто то завершаем промис неудачей

        this.status = "pending to open"; //статус открытия окна

        this.header[0].custom_scroll.hide(); //скрываем скролбар в хедере перед открытием блока

        let search_results_block_height = GDS.win_height - Header.get_header_always_visible_h() - this.search_wrapper.height(); //получаем минимальную высоту которую должен занимать блок с результатми поиска

        search_results_block_height = search_results_block_height >= 100 ? search_results_block_height : 100; //задаём минимальную высота для блока с выводом результатов и лоадера в 100 пикселей

        //если размер экрана менее 640px то сначало дожидаемся сокрытия пунктов мобильного меню
        if (GDS.win_width < 640) {
            await anime({
                targets: [this.header_menu_mobile[0], this.header_phone_mobile[0]],
                opacity: 0,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished;
        }
        //если размер экрана менее 640px то сначало дожидаемся сокрытия пунктов мобильного меню

        let lower_header = anime({
                //опускаем хедер до низа окна бразуера
                targets: this.header[0],
                height: GDS.win_height,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished,
            lower_search_results_block = anime({
                //опускаем блок с результатами поиска да низа окна браузера
                targets: this.search_results[0],
                height: search_results_block_height,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished;

        await Promise.all([lower_header, lower_search_results_block]);

        this.header_menu_mobile.add(this.header_phone_mobile).css("display", "none"); //скрываем меню и телефон

        this.search_results.css("min-height", search_results_block_height + "px"); //устанавливаем минимальную высоту для болока с результатами поиска чтоб даже при малом колическте ответов или при их отсутствии блок выглядел нормально

        this.search_loader.css("display", "block"); //отображаем лоадер в документе

        //Примечание: можно добавить await чтоб лоадер точно был замечен пользователем
        anime({
            //показываем лоадер после откытия блока с результатами поиска
            targets: this.search_loader[0],
            opacity: 1,
            duration: GDS.anim_time,
            easing: GDS.anim_tf,
        }).finished;

        this.search_results.css("height", ""); //убираем высоту у блока с результатми вывода чтоб не ыбло полосы теней на результатах

        this.header[0].custom_scroll.show(); //показываем скролбар в хедере если нужно

        this.status = "open"; //статус открытия окна

        return true;
    }
    //открываем окно для отображения результатов поиска

    //закрываем окно для отображения результатов поиска
    //full_close - указывает на то что закрывается весь скрытый блко и в этом случае после скрытия блок с результатами поиска не отображаем меню а сразу скрываем оставшийся инпут
    async close_results_block(full_close = false) {
        if (this.status !== "open") return false; //если окно с результатами поиска не польностью открыто то завершаем промис неудачей

        this.status = "pending to close"; //статус открытия окна

        this.header[0].custom_scroll.hide(); //скрываем скролбар в хедере перед закрытием блока

        this.header.css("height", ""); //убираем высоту у хедера чтоб его можно было свернуть

        if (!full_close) this.header_menu_mobile.add(this.header_phone_mobile).css("display", ""); //возвращаем в документ блоки

        let search_results_block_height = GDS.win_height - this.search_results[0].getBoundingClientRect().top; //получаем растояние от верха экрана до верха блока для отображение результатов поиска

        search_results_block_height = search_results_block_height > 0 ? search_results_block_height : 0; //получаем растояние от верха экрана до верха блока для отображение результатов поиска и получаем высоту которую дожен будет занять блок чтоб покрыть всю высоту экрана

        this.search_results.css("height", search_results_block_height + "px"); //задаём высоту блоку с результатами поиска

        //если результаты поиска пусты и ещё не заполнены ни чем
        if (this.results_wrapper[0].innerHTML === "") {
            //плавно скрываем лоадер
            await anime({
                targets: this.search_loader[0],
                opacity: 0,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished;
        }
        //если результаты поиска пусты и ещё не заполнены ни чем

        //если есть какие-то отображённые результаты поиска
        else {
            this.search_loader.css("opacity", "0"); //скрываем лоадер

            await anime({
                //дожидаемся пока станет прозрачным блок с результатами поиска
                targets: this.results_wrapper[0],
                opacity: 0,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished;

            this.results_wrapper[0].innerHTML = ""; //очищаем содержимое блока с результатами поиска
        }
        //если есть какие-то отображённые результаты поиска

        this.search_loader.css("display", ""); //скрываем лоадер в документе

        this.search_results.css("min-height", ""); //чистим вспомогательные стили

        await anime({
            //уменьшаем высоту блок с результатами поиска для его скрытия
            targets: this.search_results[0],
            height: 0,
            duration: GDS.anim_time,
            easing: GDS.anim_tf,
        }).finished;

        //дожидаемся отображения меню и телефона на маленьких экранах
        if (GDS.win_width < 640 && !full_close) {
            let show_menu_mobile = anime({
                    targets: this.header_menu_mobile[0],
                    opacity: 1,
                    duration: GDS.anim_time,
                    easing: GDS.anim_tf,
                }).finished,
                show_phone_mobile = anime({
                    targets: this.header_phone_mobile[0],
                    opacity: 1,
                    duration: GDS.anim_time,
                    easing: GDS.anim_tf,
                }).finished;

            await Promise.all([show_menu_mobile, show_phone_mobile]);
        }
        //дожидаемся отображения меню и телефона на маленьких экранах

        this.status = "close"; //статус открытия окна

        Header_Toggle_Block.size_recalculate(); //пересчитываем новые размеры меню добавляем высоту хедеру и прокрутку если нужно

        this.header[0].custom_scroll.show(); //показываем скролбар в хедере если нужно

        Img_Loader.update_img_set_and_init(); //после того как мы закрыли блок с результатами поиска и вернулись к обычной странице мы должны обновить набор картинок чтоб не проверять те которые уже не нужны (картинке из результатов поиска)

        return true;
    }
    //закрываем окно для отображения результатов поиска

    //клик по крестику в окне поиска
    async click_close_search_button() {
        if (GDS.global_interactiv_lock) return; //если в данный момент кнопка заблокирована просто прерываем функцию

        GDS.lock_all_interactive(); //блокируем все интерактивные элементы в хедере

        let tried = await this.close_results_block(); //пытаемся закрыть окно для результатов поиска

        if (tried) this.clean_input(); //если окно срезультатами поиска удалось закрыть, т.е. оно было открыто, то после его закрытиея чистим инпут с поисковым запросом

        if (!tried) this.search_input[0].value !== "" ? this.clean_input() : await Header_Toggle_Block.close_block(); //если же нам не удалозь закрыть окно поиска, то значит оно уже было закрыто, тогда если в поле инпута был какой то текст просто чистим его, значит мы просто нажали на крестик в тот момент когда запрос на сервер ещё не отправился, если поле ввода пусто то значит можно закрывать окно поиска

        GDS.unlock_all_interactive(); //разблокируем все интерактивные элементы в хедере
    }
    //клик по крестику в окне поиска

    //скрываем окно поиска по клику на полупрозрачную подложку
    async click_header_overlay() {
        if (GDS.global_interactiv_lock) return; //если в данные момент кнопки хедера заблокированны то завершаем функцию

        GDS.lock_all_interactive(); //блокируем все интерактивные элементы в хедере

        this.clean_input(); //чистим данные поля ввода

        await Header_Toggle_Block.close_block(); //закрываем окно поиска

        GDS.unlock_all_interactive(); //разблокируем все интерактивные элементы в хедере
    }
    //скрываем окно поиска по клику на полупрозрачную подложку

    //начинаем поиск после ввода символов
    chenge_in_search_input() {
        clearTimeout(this.input_timerid); //удаляем таймер

        this.search_input[0].value.length > 0 ? this.search_input.addClass("nachat_vvod") : this.search_input.removeClass("nachat_vvod"); //если введён хотяб один символ в поле поиска меняем стили инпута

        //создаём таймер задержки ввода
        this.input_timerid = setTimeout(async () => {
            let search_text = this.search_input[0].value; //поисковой запрос

            GDS.lock_all_interactive(); //блокируем все интерактивные элементы в хедере

            this.cached_result = null; //так же чистим прежние результаты поиска из кеша объекта поиска

            set_cookie("search_data", search_text.slice(0, 100), { expires: "Tue, 19 Jan 2099 03:14:07 GMT" }); //записываем в куки то что ввёл пользователь

            //если ввели 2 и блоее символов начинаем поиск
            if (search_text.length > 1) {
                //если закрыт блок с результатами поиска
                if (this.status === "close") {
                    await this.open_results_block(); //пытеамся открыть блок для результатов поиска

                    this.render_results(search_text); //выводим результаты поиска
                }
                //если закрыт блок с результатами поиска

                //если открыт блок с результатами поиска
                else if (this.status === "open") {
                    this.render_results(search_text); //выводим результаты поиска
                }
                //если открыт блок с результатами поиска

                //если блок с результатами поиска в процессе закрытия, а мы ввели какой-то текст
                else if (this.status === "pending to close") {
                    await wait(() => this.status, "close"); //дожидаемся полного закрытия блока

                    await this.open_results_block(); //после того как блок полностью закрылся снова открываем его

                    this.render_results(search_text); //выводим результаты поиска
                }
                //если блок с результатами поиска в процессе закрытия, а мы ввели какой-то текст

                //если блок с результатами поиска в процессе открытия, а мы ввели какой-то текст
                else if (this.status === "pending to open") {
                    await wait(() => this.status, "open"); //дожидаемся полного открытия блока

                    this.render_results(search_text); //выводим результаты поиска
                }
                //если блок с результатами поиска в процессе открытия, а мы ввели какой-то текст
            }
            //если ввели 2 и блоее символов начинаем поиск

            //если количество символов удалили до нуля то сворачиваем блок с результатами поиска
            if (search_text.length === 0) {
                await this.close_results_block(); //удаляем результаты поиска и закрываем его окно
            }
            //если количество символов удалили до нуля то сворачиваем блок с результатами поиска

            GDS.unlock_all_interactive(); //разблокируем все интерактивные элементы в хедере
        }, 500);
        //создаём таймер задержки ввода
    }
    //начинаем поиск после ввода символов

    //удаляем данные запроса пользователя в инпуте и куках
    clean_input() {
        this.search_input.removeClass("nachat_vvod"); //убираем класс уведомляющий о том что поле заполнено текстом поиска

        this.search_input[0].value = ""; //удаляем содержимое инпута для поиска

        delete_cookie("search_data"); //чистим куки от текста поиска

        this.cached_result = null; //так же чистим прежние результаты поиска из кеша объекта поиска
    }
    //удаляем данные запроса пользователя в инпуте и куках

    //раскрываем окно с результатами поиска и отображает результаты поиска в блоке для результатов
    async render_results(search_text) {
        if (this.status !== "open" || this.search_input[0].value !== search_text) return; //если мы в процессе рендера ответа поиска обнаружили что окно с результатами поиска не имеет статус открытого то прерываем дальнейшие операции, возможно мы закрыли окно в процессе рендера ответа поиска. Или если за время поиска пользователь успел поменять содержимое инпута, то мы ничего не выводим и начнётся новый поиск

        //если мы уже ищем не первый раз то блок с результатами поиска нужно очистить перед выводом новых результатов
        if (this.results_wrapper[0].innerHTML !== "") {
            await anime({
                //дожидаемся пока результаты поиска станут прозрачными
                targets: this.results_wrapper[0],
                opacity: 0,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished;

            if (this.status !== "open" || this.search_input[0].value !== search_text) return; //если мы в процессе рендера ответа поиска обнаружили что окно с результатами поиска не имеет статус открытого то прерываем дальнейшие операции, возможно мы закрыли окно в процессе рендера ответа поиска. Или если за время поиска пользователь успел поменять содержимое инпута, то мы ничего не выводим и начнётся новый поиск

            this.results_wrapper[0].innerHTML = ""; //удаляем всё содержимое блока с результатами поиска

            anime({
                //показываем лоадер
                targets: this.search_loader[0],
                opacity: 0,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            });
        }
        //если мы уже ищем не первый раз то блок с результатами поиска нужно очистить перед выводом новых результатов

        //вставляет переданные код html в блок с результатами поиска и плавно показывает его
        let show_results = async result_html => {
            if (this.status !== "open" || this.search_input[0].value !== search_text) return; //если мы в процессе рендера ответа поиска обнаружили что окно с результатами поиска не имеет статус открытого то прерываем дальнейшие операции, возможно мы закрыли окно в процессе рендера ответа поиска. Или если за время поиска пользователь успел поменять содержимое инпута, то мы ничего не выводим и начнётся новый поиск

            await anime({
                //дожидаемся скрытия лоадера
                targets: this.search_loader[0],
                opacity: 0,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished;

            if (this.status !== "open" || this.search_input[0].value !== search_text) return; //если мы в процессе рендера ответа поиска обнаружили что окно с результатами поиска не имеет статус открытого то прерываем дальнейшие операции, возможно мы закрыли окно в процессе рендера ответа поиска. Или если за время поиска пользователь успел поменять содержимое инпута, то мы ничего не выводим и начнётся новый поиск

            this.results_wrapper[0].innerHTML = result_html; //записываем результаты в блок с результатами поиска

            this.search_results.css("height", ""); //убираем высоту у блока с результатами поиска чтоб она автоматически установилась после заполнения результатами

            await anime({
                //плавно показываем блок с результатами
                targets: this.results_wrapper[0],
                opacity: 1,
                duration: GDS.anim_time,
                easing: GDS.anim_tf,
            }).finished;

            if (this.status !== "open" || this.search_input[0].value !== search_text) return; //если мы в процессе рендера ответа поиска обнаружили что окно с результатами поиска не имеет статус открытого то прерываем дальнейшие операции, возможно мы закрыли окно в процессе рендера ответа поиска. Или если за время поиска пользователь успел поменять содержимое инпута, то мы ничего не выводим и начнётся новый поиск

            Img_Loader.update_img_set_and_init(); //после того как мы вставили результамы поиска в DOM мы должны обновить набор картинок в модуле Img_Loader и так же сразу его запустить чтоб проверить видны ли картинки в данный момент и настроить высоты блоков
        };
        //вставляет переданные код html в блок с результатами поиска и плавно показывает его

        //если в данном объекте есть запись с прежнеми результатами поиска значит окно было просто свёрнуто и мы не должны делать запрос на сервер, а просто выведем данные из кеша объекта
        if (this.cached_result) return await show_results(this.cached_result); //вставляет переданные код html в блок с результатами поиска и плавно показывает его, а так же прерываем дальнейшие выполнение функции

        let result_html = await this.load_results(search_text); //ищем search_text - текст введённый в поле поиска в базе, после того как получили ответ выводим его на экран

        if (this.status !== "open" || this.search_input[0].value !== search_text) return; //если мы в процессе рендера ответа поиска обнаружили что окно с результатами поиска не имеет статус открытого то прерываем дальнейшие операции, возможно мы закрыли окно в процессе рендера ответа поиска. Или если за время поиска пользователь успел поменять содержимое инпута, то мы ничего не выводим и начнётся новый поиск

        await show_results(result_html); //вставляет переданные код html в блок с результатами поиска и плавно показывает его

        if (this.status !== "open" || this.search_input[0].value !== search_text) return; //если мы в процессе рендера ответа поиска обнаружили что окно с результатами поиска не имеет статус открытого то прерываем дальнейшие операции, возможно мы закрыли окно в процессе рендера ответа поиска. Или если за время поиска пользователь успел поменять содержимое инпута, то мы ничего не выводим и начнётся новый поиск

        this.cached_result = result_html; //сохранеям результаты поиска в кеш объекта поиска

        this.header[0].custom_scroll.show(); //показываем скролбар в хедере сели нужна прокрутка
    }
    //раскрываем окно с результатами поиска и отображает результаты поиска в блоке для результатов

    //начинает асинхранную задачу по поиску и возвращает результат
    async load_results(search_text) {
        let error, //сюда будет записана ошибка если появится
            output_html = "", //сюда будем записывать HTML для отображения на странице
            dop_html = '<div class="search_results_links"><a href="#"><div>Не нашли Ваш авто?</div></a><a href="#"><div>Консультация</div></a></div>', // дополнительные html блоки с сылками
            data = {
                //данные для отправки на сервер
                action: "search",
                search_text: search_text,
            },
            result = await request_to_server({
                data_to_send: data,
                error_dop_html: dop_html,
            }).catch(error_data => (error = error_data));

        if (error) return error; //если во время запроса возникла критическая ошибка например сайт недоступен или у пользователя пропал интернет то мы выводим ошибку

        if (result.nothing_found) return '<div class="search_fail">По Вашему запросу <span>"' + search_text + '"</span> ничего не найдено =(</div>' + dop_html; //если вернулась nothing_found, значит ничего не найдено по текущему запросу

        //перебираем все данные из ответа и создаём на их основе HTML контент
        for (let i = 0; i < result.length; i++) {
            result[i]["search_text"] = search_text; //дополянем объект данными о введённом тексте

            let render = new Small_Product_Previv_Block(result[i]); //создаём экземпляр с данными для рендера

            output_html += '<div class="result_item">' + render.render_product_block() + "</div>"; //дописываем html код блока предварительного просмотри товара

            output_html += '<div class="result_item">' + render.render_instruction_block() + "</div>"; //дописываем html код блока инструкций для этго товара
        }
        //перебираем все данные из ответа и создаём на их основе HTML контент

        output_html += dop_html; //дописываем дополнительные html блоки

        return output_html;
    }
    //начинает асинхранную задачу по поиску и возвращает результат

    //функция пересчитывает размеры в окне с результатами поиска про ресайзе
    size_recalculate() {
        if (this.status === "close" || this.status === "pending to close") return; //если окно поиска закрыто или  в процессе закрытия то завершаем функцию

        //функция для обновления параметров блока
        let update_size_params = () => {
            this.header.css("height", GDS.win_height + "px");

            this.header_menu_mobile.add(this.header_phone_mobile).css("display", ""); //убираем стили у меню и телефона
            this.header_menu_mobile.add(this.header_phone_mobile).css("opacity", "");

            if (GDS.win_width < 640) this.header_menu_mobile.add(this.header_phone_mobile).css("display", "none"); //для мальньких экранов скрываем меню и телефон

            let search_results_block_height = GDS.win_height - GDS.header.get_header_always_visible_h() - this.search_wrapper.height(); //получаем минимальную высоту которую должен занимать блок с результатми поиска

            search_results_block_height = search_results_block_height >= 100 ? search_results_block_height : 100; //задаём минимальню высота для блока с выводом результатов и лоадера в 100 пикселей

            this.search_results.css("min-height", search_results_block_height + "px"); //устанавливаем минимальную высоту для болока с результатами поиска чтоб даже при малом колическте ответов или при их отсутствии блок выглядел нормально
        };
        //функция для обновления параметров блока

        if (this.status === "open") update_size_params(); //если окно с результатами открыто обновляем данные блока

        if (this.status === "pending to open") wait(() => this.status, "open").then(() => update_size_params()); //если откно с результатами поиска в прецессе открытия то сначало дажидаемся его открытия, а потом пересчитываем все параметры
    }
    //функция пересчитывает размеры в окне с результатами поиска про ресайзе
})();
