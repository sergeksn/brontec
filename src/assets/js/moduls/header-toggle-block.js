import Header from "./header.js";
import Header_Search_Block from "./header-search.js";
import Scroll_To_Top from "./scroll-to-top.js";
import { Header_Overlay } from "./overlays.js";
import { wait } from "./../base-func/func-kit.js";
import anime from "./../base-func/anime.js";

export default new class {
    //pending to close - в процессе закрытия меню
    //close - меню закрыто
    //pending to open - в процессе открытия меню
    //open - меню открыто
    status = "close" //статус открытия меню

    //определяет какую часть экрана занимает блок после открытия
    //part - после открытия занимает часть экрана, т.е. высота меню + высота открытого блока меньше высоты окна раузера
    //full - после открытия занимает всё окно браузера, т.е. высота меню + высота открытого блока больше или равноа высоте окна раузера
    size = undefined

    //инициализируем все скрипты для работы открывающиегося блока в хедере
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.body = $("body");
        this.header = $("header");
        this.header_menu_wrapper = $(".header_menu_wrapper"); //верхнее меню
        this.visible_header_part = $(".visible_header_part"); //постоянно видимая часть меню
        this.hidden_header_part = $(".hidden_header_part"); //скрытая часть меню с поиском и мобильным меню
        this.header_burger_button_wrap = $(".header_burger_button_wrap"); //кнопка бургер меню
        //записываем все неоходимые переменные для удобства доступа

        $(window).on({
            events: "resize_optimize",
            callback: this.size_recalculate.bind(this)
        }); //выполяем нужные действия при ресайзе
    }
    //инициализируем все скрипты для работы открывающиегося блока в хедере

    //функция устанавливает параметр size в зависимости от размера открытого блок
    set_size_status() {
        this.size = Header.get_header_h() >= GDS.win_height ? "full" : "part"; //если высота хедера с банером + выоста скрытого блока больше или равна высоте окна браузера full, если же высота хедера с банером + выоста скрытого блока меньше высоты окна браузера part
        //если высота хедера с банером + выоста скрытого блока больше или равна высоте окна браузера
    }
    //функция устанавливает параметр size в зависимости от размера открытого блок

    //функция будет выполянять нужные действия в зависимости от размеров экрана
    size_recalculate() {
        if (Header_Search_Block.status === "pending to open" || Header_Search_Block.status === "open") return; //если окно с результатами поиска открыто или в процессе открытия то заверашем данную функцию

        let update_size = () => {
            this.header.css("height", ""); //у хедеар могла быть задана высота если высота окна была меньше восоты скрытого блока меню, чистим её

            this.set_size_status(); //получаем новые размеры

            if (this.size === "full") this.header.css("height", GDS.win_height + "px"); //если размер открытого блока больше или равен высоте окна задаём хедеру высоту окна чтоб хедер имел прокуту и стал чем-то вроде нового документа
        };

        if (Header_Search_Block.status === "pending to close") return wait(() => this.status, "close").then(() => update_size()); //если блок с результатами поиска в процессе закрытия дожидаемся закрытия блока с результатами поиска и перестичитываем парметры хедера

        if (this.status === "open") return update_size(); //если скрытый блок открыт обновляем значения размеров и прокрутки хедера

        if (this.status === "pending to open") return wait(() => this.status, "open").then(() => update_size()); //если скрытый блок в процессе открытия дожидаемся открытия блока и перестичитываем парметры хедера
    }
    //функция будет выполянять нужные действия в зависимости от размеров экрана 

    //открываем меню
    async open_block() {
        if (this.status !== "close") return false;; //если попытались открыть блок когда он не полностью закрыт прерываем функцию

        this.status = "pending to open"; //помечаем что началось открытие блока

        this.header_burger_button_wrap.addClass("open"); //начинаем трансформировтаь бургер кнопку в крестик

        this.header.addClass("disable_scrollbar_actions"); //блокируем 

        //задаём стили перед началом открытия блока
        //делаем блок сначало видимым, далее задём ему явную высоту и отступ от перха родительского блока, для дальнейшего осуществления анимации
        this.hidden_header_part.css({
            "visibility": "visible", //делаем скрытый блок видимым
            "height": this.hidden_header_part.height() + "px", //явно задём высоту скрытому блоку чтоб он открывался нормально с тенью
            "top": "-" + (this.hidden_header_part.height() - this.header_menu_wrapper.height()) + "px" //задём стартовое позиционирование
        });
        //задаём стили перед началом открытия блока

        let anim_open_hidden_header_part = anime({
            targets: this.hidden_header_part[0],
            top: this.header_menu_wrapper.height(),
            duration: GDS.anim_time,
            easing: GDS.anim_tf
        }).finished; //опускаем весь скрытый блок на высоту видимого меню

        //ждём завершение открытия
        await Promise.all([
            anim_open_hidden_header_part, //опускаем весь скрытый блок на высоту видимого меню

            Scroll_To_Top.hide(), //плавно скрываем кнопку скрола вверх

            this.body[0].custom_scroll.hide(), //убираем прокуртку и скролбар в body

            Header_Overlay.show() //показываем подложку и ждём завершения её появления
        ]);
        //ждём завершение открытия

        //меняем стили после открытия блока
        this.hidden_header_part.css({
            "position": "relative", //меняем позиционирование блока
            "height": "", //убираем вспомогательные стили которые нужны были для анимации
            "top": "" //убираем вспомогательные стили которые нужны были для анимации
        });
        //меняем стили после открытия блока

        this.set_size_status(); //проверяем какой размер имеет открытый блок вместе с меню

        if (this.size === "full") this.header.css("height", GDS.win_height + "px"); //если высота скрытого блока меню вместе с высотой хедера больше чем высота экрана устройства задаём хедеру высоту окна чтоб хедер имел прокуту и стал чем-то вроде нового документа

        this.status = "open"; //помечеам что блок открыт

        this.header[0].custom_scroll.show(); // чтоб показать скролбар если нужен

        return true;
    }
    //открываем меню

    //закрываем меню
    async close_block() {
        if (this.status !== "open") return false; //если попытались закрыть блок когда он не полностью открыт прерываем функцию

        this.status = "pending to close"; //статус откряытия блока

        this.header_burger_button_wrap.removeClass("open"); //начинаем трансформировтаь крестик в бургер кнопку

        this.header.addClass("disable_scrollbar_actions"); //нужно чтоб в момент измения размеров хедера не срабатывали пересчёты для скроллбара и блок плавно скрылся

        this.header[0].custom_scroll.hide(); //скрываем скролбар в хедере

        //меняем стили до закрытия блока
        this.hidden_header_part.css({
            "position": "", //меняем позиционирование блока на абсолютное
            "top": this.visible_header_part.height({ type: "outerHeight" }) + "px",
            "height": this.hidden_header_part.height() + "px" //явно задём высоту скрытому блоку

        });
        //меняем стили до закрытия блока

        this.header.css("height", ""); //у хедеар могла быть задана высота, чистим её

        //для того чтоб при скрытии блок полоса прокрутки хедера не просто скрывалась прозрачностью но ещё и уменьшала свою высоту до высоту хедера (это высота банера, если он есть, плюс высота всегда видимого блока меню)
        let header_scrollbar_height_lower = anime({
                targets: this.header[0].custom_scroll.scroll_slider[0],
                height: Header.get_header_h(),
                duration: GDS.anim_time,
                easing: GDS.anim_tf
            }).finished,

            up_hidden_header_part = anime({ //скрываем открывающийся блок хедера понимая его вверх
                targets: this.hidden_header_part[0],
                top: "-"+(this.hidden_header_part.height() - this.header_menu_wrapper.height()),
                duration: GDS.anim_time,
                easing: GDS.anim_tf
            }).finished;

        await Promise.all([Header_Overlay.hide(), header_scrollbar_height_lower, up_hidden_header_part]); //плавно скрываем блок меню и подложку, а так же меняем высоту скролбара хедера

        //меняем стили после полного скрытия блока
        this.hidden_header_part.css({
            "visibility": "", //убиваем видимость у скрытого блока
            "top": "", //убираем вспомогательные стили которые нужны были для анимации
            "height": "", //убираем вспомогательные стили которые нужны были для анимации
        });
        //меняем стили после полного скрытия блока

        this.status = "close"; //помечеам что меню закрыто

        this.body[0].custom_scroll.show(); //возвращаем прокуртку и скролбар в body
        this.header[0].custom_scroll.show(); //нужно чтоб восттановить скролбар хедера после скрытия

        Scroll_To_Top.toggle_show_button(); //показываем кнопку скрола если нужно

        return true;
    }
    //закрываем меню
}