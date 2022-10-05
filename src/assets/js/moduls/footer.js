new class {
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.footer_item_first = $($("footer .footer_item")[0]);
        this.foter_decoration = $("footer .foter_decoration");
        //записываем все неоходимые переменные для удобства доступа

        //управляет размерами синей декорации в зависимости от разера экрана
        this.footer_decoration_modification_on_mobile();

        $(window).on({
            events: "resize_optimize",
            callback: this.footer_decoration_modification_on_mobile.bind(this)
        });
        //управляет размерами синей декорации в зависимости от разера экрана
    }

    //при размере экрана меньше 639 px синяя декорация в футере должа менть свою высоту
    footer_decoration_modification_on_mobile() {
        if (GDS.win_width <= 639) this.foter_decoration.css("height", this.footer_item_first.height({ type: "outerHeight" }) + 55 + "px"); //задаём декорации явную высоту для того чтоб он захватывал по высоте только первый блок  сменю
        //55 - это верхний отступ
    }
    //при размере экрана меньше 639 px синяя декорация в футере должа менть свою высоту
}