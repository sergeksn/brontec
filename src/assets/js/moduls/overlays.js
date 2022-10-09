import anime from "./../base-func/anime.js";

class Overlay_Controller {
    //показывыаем подложку
    async show() {
        if (this.status === "show" || this.status === "pending to show") return; //если видна или в процессе показа то не нужно снова начинать показывать

        let _this = this,
            animation = anime({
                targets: this.overlay[0],
                opacity: .9,
                easing: GDS.anim_tf,
                duration: GDS.anim_time,
                begin: function(anim) {
                    _this.status = "pending to show";
                    _this.overlay.css("display", "block"); //добаляем в документ
                },
                update: function(anim) {
                    if (_this.status !== "pending to show") anim.remove();
                },
                complete: function(anim) {
                    if (_this.status === "pending to show") _this.status = "show";
                }
            });

        await animation.finished; //дожидаемся завершения анимации появления
    }
    //показывыаем подложку

    //скрываем подложку
    async hide() {
        if (this.status === "hide" || this.status === "pending to hide") return; //если скрыта или в процессе скрытия то не нужно пытаться скрывать снова

        let _this = this,
            animation = anime({
                targets: this.overlay[0],
                opacity: 0,
                easing: GDS.anim_tf,
                duration: GDS.anim_time,
                begin: function(anim) {
                    _this.status = "pending to hide"; //вначале анимации задём статус что стрелка в процессе скрытия
                },
                update: function(anim) {
                    if (_this.status !== "pending to hide") anim.remove(); //сли в процессе анимации мы замечаем что статус не в процесе скрытия мы завершаем анимацию
                },
                complete: function(anim) {
                    if (_this.status === "pending to hide") { //после завершения анимации мы смотрим какой был статус стрелки в момент завершения анимации и если он был в процессе сокрытия то убираем стрелку из  документа и ставим её статус скрыта
                        _this.overlay.css("display", "");
                        _this.status = "hide";
                    }
                }
            });

        await animation.finished; //дожидаемся завершения анимации появления
    }
    //скрываем подложку
}

//хранит объект подложки для хеднера
const Header_Overlay = new class {
    //pending to hide - в процессе скрытия
    //hide - скрыто
    //pending to show - в процессе появления
    //show - видно
    status = "hide"

    overlay = $("#header_overlay") //полупрозрачная бела подложка для хедера

    constructor() {
        let teplate = new Overlay_Controller; //объект с функция управления для подложек

        //записываем в методы этого класса нужные методы классаконтролера
        this.show = teplate.show.bind(this);
        this.hide = teplate.hide.bind(this);
    }
}
//хранит объект подложки для хеднера

//хранит объект подложки для корзины
const Cart_Overlay = new class {
    //pending to hide - в процессе скрытия
    //hide - скрыто
    //pending to show - в процессе появления
    //show - видно
    status = "hide"

    overlay = $("#cart_overlay") //полупрозрачная бела подложка для корзины

    constructor() {
        let teplate = new Overlay_Controller; //объект с функция управления для подложек

        //записываем в методы этого класса нужные методы классаконтролера
        this.show = teplate.show.bind(this);
        this.hide = teplate.hide.bind(this);

        this.overlay.css("height", GDS.win_height + "px"); //задаём высоту подложке равную высоте экрана

        $(window).on({
            events: "resize_optimize",
            callback: () => this.overlay.css("height", GDS.win_height + "px")
        }); //при ресайзах пересчитываем и задаём высоту по новой
    }
}
//хранит объект подложки для корзины

//хранит объект подложки для картинок открых в полный экран в галереи
const Galery_Overlay = new class {

}
//хранит объект подложки для картинок открых в полный экран в галереи

//хранит объект подложки для окна предпросмотра отдельной детали комплекта
const Product_Part_Previwe_Overlay = new class {

}
//хранит объект подложки для окна предпросмотра отдельной детали комплекта


export { Header_Overlay, Cart_Overlay, Galery_Overlay, Product_Part_Previwe_Overlay };