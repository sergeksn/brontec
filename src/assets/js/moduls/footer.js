new (class {
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.footer_item_first = d.querySelector(".footer_item:first-child");
        this.foter_decoration = d.querySelector(".foter_decoration");
        //записываем все неоходимые переменные для удобства доступа

        this.footer_decoration_modification_on_mobile(); //управляет размерами синей декорации

        w._on("resize_optimize", this.footer_decoration_modification_on_mobile.bind(this)); //перестраиваем в зависимости от разера экрана
    }

    //при размере экрана меньше 639 px синяя декорация в футере должа менть свою высоту
    footer_decoration_modification_on_mobile() {
        if (GDS.win.width <= 639) this.foter_decoration.style.height = Number(w.getComputedStyle(this.footer_item_first).height.replace("px", "")) + 55 + "px"; //задаём декорации явную высоту для того чтоб он захватывал по высоте только первый блок  сменю
        //55 - это верхний отступ
    }
    //при размере экрана меньше 639 px синяя декорация в футере должа менть свою высоту
})();
