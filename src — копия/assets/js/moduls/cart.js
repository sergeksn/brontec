
//КОРЗИНА
GDS.cart = {
    //pending to close - в процессе закрытия окна
    //close - окно закрыто
    //pending to open - в процессе открытия окна
    //open - окно открыто
    status: "close",

    init: function() {
        //записываем все неоходимые переменные для удобства доступа
        this.body = $("body");
        this.header = $("header");
        this.cart = $("#cart");
        this.top_baner = $(".top_banner_wrap");
        //записываем все неоходимые переменные для удобства доступа

        $(".header_cart .svg_img, #cart_Background").on({ events: "click", callback: this.toggle_cart_block.bind(this) });

        this.set_cart_size(); //задаёт размеры и позицию блока с корзиной

        $(window).on({ events: "resize_optimize", callback: this.set_cart_size.bind(this) }); //перечитываем размеры корзины при ресайзах
    },

    //задаёт размеры и позицию блока с корзиной
    set_cart_size: function() {
        let top = GDS.header.has_top_baner ? this.top_baner.height() : 0,
            height = GDS.header.has_top_baner ? GDS.win_height - this.top_baner.height() : GDS.win_height;

        this.cart.css({
            "top": top + "px",
            "height": height + "px"
        });

        //console.log($("#cart").css("padding-top"))


        let top_otstup = Number($(".cart_wrapper").css("border-top-width").replace("px", "")) + Number($("#cart").css("padding-top").replace("px", ""));

        //console.log(top_otstup)

        $(".cart_top_block").css({
            "height": $(".visible_header_part .header_cart").height() + "px",
            "top": "-" + top_otstup + "px"
        });








    },
    //задаёт размеры и позицию блока с корзиной

    //реагирует на клик по кнопке отрутия корзины и открывает/закрывает её
    toggle_cart_block: async function() {
        if (GDS.global_interactiv_lock) return; //если в данные момент интерактивные элементы на сайте заблокированны то завершаем функцию

        GDS.lock_all_interactive(); //блокируем все интерактивные элементы

        if (this.status === "close") {
            await this.open_cart();
        } else if (this.status === "open") {
            await this.close_cart();
        }

        GDS.unlock_all_interactive(); //разблокируем все интерактивные элементы
    },
    //реагирует на клик по кнопке отрутия корзины и открывает/закрывает её

    //скрывает/показывает скролбары в хедере и body
    //action - что нужно сделать "hide" или "show"
    toggle_scrollbars_visible: async function(action) {
        if (action === "show") {
            await Promise.all([
                (async () => {
                    if (this.body.hasClass("disable_scrollbar_actions") && GDS.header.toggle_block.status === "close") GDS.scrollbar.search_neaded_object(this.body).show(); //показываем прокуртку и скролбар в body если он был в нём отключён ранее и окно в хедере закрыто
                })(),
                (async () => {
                    if (this.header.hasClass("disable_scrollbar_actions") && GDS.header.toggle_block.status === "open") GDS.scrollbar.search_neaded_object(this.header).show(); //показываем прокуртку и скролбар в header если ранее он был в нём отключён и окно в хедере открыто
                })()
            ]);
        }

        if (action === "hide") {
            await Promise.all([
                (async () => {
                    if (!this.body.hasClass("disable_scrollbar_actions")) GDS.scrollbar.search_neaded_object(this.body).hide(); //убираем прокуртку и скролбар в body если он ещё не отключены
                })(),
                (async () => {
                    if (!this.header.hasClass("disable_scrollbar_actions")) GDS.scrollbar.search_neaded_object(this.header).hide(); //убираем прокуртку и скролбар в header если он ещё не отключены
                })()
            ]);
        }
    },
    //скрывает/показывает скролбары в хедере и body

    //открывает корзину
    open_cart: async function() {
        if (this.status !== "close") throw "open error"; //если попытались открыть блок когда он не полностью закрыт прерываем функцию

        this.status = "pending to open"; //помечаем что началось открытие блока

        this.cart.css("display", "block"); //возварщаем козину в документ

        await Promise.all([
            GDS.overlays.cart.show(), //показываем подложку корзины
            this.toggle_scrollbars_visible("hide"), //скрываем скролбары body и header если нужно
            this.cart.animate({ "right": "0px" }, GDS.anim_time, GDS.anim_tf) //плавно показываем корзину выводя её справой стороны
        ]);

        this.status = "open";
    },
    //открывает корзину

    //закрывает корзину
    close_cart: async function() {
        if (this.status !== "open") throw "close error"; //если попытались закрыть блок когда он не полностью открыт прерываем функцию

        this.status = "pending to close"; //помечаем что началось открытие блока

        await Promise.all([
            GDS.overlays.cart.hide(), //скрываем подложку корзины
            this.cart.animate({ "right": "-" + this.cart.css("width") }, GDS.anim_time, GDS.anim_tf) //плавно скрываем корзину уводя её в правую сторону за пределы видимой части экрана
        ]);

        this.cart.css("display", ""); //скрываем корзину в документе

        this.toggle_scrollbars_visible("show"); //показываем скролбары body и header если нужно, после скрытия корзины

        this.status = "close";
    }
    //закрывает корзину
};
//КОРЗИНА