import { Header, Header_Hidden, Header_Search } from '@header-main-js';
import { wait, set_localStorage, anime, hide } from '@js-libs/func-kit';

export default new (class {
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.header_poster = d.querySelector('.header-poster');
        if (!this.header_poster) return; //если нет банера

        this.header = d.getElementsByTagName('header')[0]; //хедер
        this.poster_close_button = d.querySelector('.header-poster__close>button'); //кнопка закрытия банера в хедере

        this.lock = false;
        this.swipe_lock = false;
        this.status = 'show';
        this.close_button_lock = false;

        this.top_poster_swipe(); //добавляет слушатель для скрытия банера свайпом
    }

    //скрываем банер
    //forever - указывает скрывать банер навсегда или до следующей перезагрузки страницы
    async hide(forever = true) {
        this.swipe_lock = true; //блокируем возможность свайпать

        let poster_id = this.header_poster.id,
            poster_parent = this.header_poster.parentNode, //узел родительского элемента банера
            poster_height = Header.get_header_h({ header_poster: true }), //высота блока банера
            header_background = d.getElementById('header-background'); //фон хедера

        //если открыт блок поиска
        if (Header_Search.status === 'open') {
            this.header.style.height = parseFloat(w.getComputedStyle(this.header).height) + poster_height + 'px'; //увеличиваем высоту хедера чтоб не появлялось пустое место снизу
            Header_Search.results_wrap.style.minHeight = Header_Search.search_results_block_height() + poster_height + 'px'; //меняем минимальную высоту блок с результатами поиска
        }
        //если открыт блок поиска

        //если скрытый блок открыт и его размер на всю высоту окна но окно поиска закрыто
        else if (Header_Hidden.status === 'open' && Header_Hidden.size === 'full') {
            //если высота хедера без учёта банера больше или равно высоте окна
            if (Header.get_header_h({ header_visible: true, header_hidden: true }) - poster_height >= GDS.win.height) {
                this.header.style.height = parseFloat(w.getComputedStyle(this.header).height) + poster_height + 'px'; //увеличиваем высоту хедера чтоб не появлялось пустое место снизу
            }
            //если высота хедера без учёта банера больше или равно высоте окна
            else {
                this.header.style.overflow = 'visible'; //нужно чтоб хедер лищился полосы прокуртки и просто поднялся при этом будет видна тень блока
                this.header.style.height = ''; //убираем явно заданную высоту у хедера чтоб при сокрытии банера хедер просто поднялся вверх
            }
        }
        //если скрытый блок открыт и его размер на всю высоту окна но окно поиска закрыто

        let up_header = anime({
                //поднимаем хедер чтоб скрыть банер за пределами видимой части экрана
                targets: this.header,
                translateY: -poster_height,
            }).finished,
            up_header_background = anime({
                //поднимаем фон хедера
                targets: header_background,
                height: '-=' + poster_height,
            }).finished;

        //this.cart.animate({ height: '+=' + poster_height + 'px' }, GDS.anim_time, GDS.anim_tf), //увеличиываем высоту корзины на высоту банера чтоб она заняла всё освободившееся по вертикали место

        await Promise.all([up_header, up_header_background]); //поднимаем хедер и уменщаем высоту его подложки

        this.header_poster.style.display = 'none'; //скрываем банер из документа
        this.header.style.transform = 'translateY(0)'; //попутно быстро меняем верхнюю позицию для хедера сразу после удаленяи банераоткрытии всех окон и ресазах
        //this.cart.css('top', ''); //попуткно поднимаем корзину к верху

        //если нужно скрыть данный рекламный банер навсегда
        if (forever) {
            let full_posters_data = JSON.parse(w.localStorage.getItem('advertising-posters')) || {}; //получаем из локального хранилища объект с даннми рекламных банеров

            full_posters_data.header_poster = {
                [poster_id]: 'hide',
            }; //помечаем что банер в хедере с таким id нужно скрыть

            set_localStorage('advertising-posters', JSON.stringify(full_posters_data)); //записываем новые данные в локальное хранилище
        }
        //если нужно скрыть данный рекламный банер навсегда

        Header_Hidden.size_recalculate(); //пересчитываем размеры хереда

        if (Header_Search.status === 'open') this.header.style.height = GDS.win.height + 'px'; //если постер скрыли в момент когда открыто окно с результатами поиска то мы после скрытия задаём хереду высоту окна

        poster_parent.removeChild(this.header_poster); //удаляем из тела документа банер
        poster_parent.removeChild(d.getElementById('header-poster__script')); //удаляем из тела документа скрипт банера

        await Promise.all([wait(() => d.querySelector('.header-poster'), null), wait(() => d.getElementById('header-poster__script'), null)]); //дожидаемся пока элементы удаляться из DOM

        Header.has_header_poster = false; //помечаем что банера в хедере больше нет
    }
    //скрываем банер

    //отслеживанием свайп на банере
    top_poster_swipe() {
        this.header_poster._on(
            'swipe',
            async e => {
                if (this.swipe_lock) return; //проверяем не заблокирован ли свайп

                await Header.show().catch(e => {}); //пытаем показать хедер, т.к. клик мог произойти в момент когда хедер в движении после скрола, в этом случае мы дождёмся пока хедер полностью не покажется, сели же он уже ыбл полностью виден этот пункт завершится мгновенно
                //ПРИМЕЧАНИЕ: catch(e=>{}) НЕЛЬЗЯ убирать т.к. при попытке закрыть блоки получим исключение в виде того что невозможно показать хедер т.к. он заблокирован

                let data = e.target.swipe_event_data,
                    s = data.settings,
                    el_width = parseFloat(w.getComputedStyle(data.el).width),
                    cb = this.poster_close_button;

                if (s.start_terget_el === cb || s.start_terget_el === cb.querySelector('.icon--close') || s.start_terget_el === cb.querySelector('.icon--close-bold')) return; //если свайп начался на крестике банера прерываем свайп

                this.close_button_lock = true; //блокируем кнопку закрытия

                await hide.call(this, {
                    //скрываем банер уводя в соответсвующую начальному направлению свайпа сорону
                    el: data.el,
                    property: 'translateX',
                    value: s.direction === 'left' ? -el_width : el_width,
                    started_value: 0,
                    display: null,
                });

                await this.hide(false); //скоываем место после банера
            },
            {},
            {
                permission_directions: {
                    top: false,
                    right: true,
                    bottom: false,
                    left: true,
                }, //направления в которых нужно учитывать свайп
                min_percent_dist_x: 10, //минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп в % от ширины экрана
                max_time: 2000, //максимальное время, за которое должен быть совершен свайп (ms)

                callback_start: () => Header.active_elements.lock(), //блокируем активные элементы в хедере
                callback_finally: () => Header.active_elements.unlock(), //разблокируем активные элементы в хедере
                //двигаем банер за указателем
                callback_move: data => {
                    let s = data.settings,
                        cb = this.poster_close_button;

                    //console.log(s.start_direction);

                    if (s.start_terget_el === cb || s.start_terget_el === cb.querySelector('.icon--close') || s.start_terget_el === cb.querySelector('.icon--close-bold')) return (s.abort_swipe_fail = true); //если свайп начался на крестике банера прерываем свайп

                    if (s.start_direction === 'right' || s.start_direction === 'left') data.el.style.transform = `translateX(${s.x - s.start_x}px)`; //перемещаем банер за указателем
                },
                //двигаем банер за указателем

                //в случае неудачного свайпа возвращаем банер в исходное положение
                callback_faill: async data => {
                    let s = data.settings,
                        cb = this.poster_close_button;

                    // если клик был по кнопке закрытия
                    //ПРИМЕЧАНИЕ: если тока нажатия и тачка отпускания указателя была на кнопке закрытия
                    if ((s.start_terget_el === cb || s.start_terget_el === cb.querySelector('.icon--close') || s.start_terget_el === cb.querySelector('.icon--close-bold')) && (s.finall_target_el === cb || s.finall_target_el === cb.querySelector('.icon--close') || s.finall_target_el === cb.querySelector('.icon--close-bold'))) {
                        if (this.close_button_lock) return; //проверяем разрешено ли нажимать на кнопку

                        await Header.show().catch(e => {}); //пытаем показать хедер, т.к. клик мог произойти в момент когда хедер в движении после скрола, в этом случае мы дождёмся пока хедер полностью не покажется, сели же он уже ыбл полностью виден этот пункт завершится мгновенно
                        //ПРИМЕЧАНИЕ: catch(e=>{}) НЕЛЬЗЯ убирать т.к. при попытке закрыть блоки получим исключение в виде того что невозможно показать хедер т.к. он заблокирован

                        await this.hide(false); //скрываем банер

                        return;
                    }
                    // если клик был по кнопке закрытия

                    if (s.x_dist <= 15 && s.y_dist <= 15) d.location.href = data.el.querySelector('a').href; //если было очень маленькое смещение то мы переходим по ссылке банера

                    //возвращаем банер в исходное положение
                    await anime({
                        targets: data.el,
                        translateX: 0,
                    }).finished;
                },
                //в случае неудачного свайпа возвращаем банер в исходное положение
            },
        );
    }
    //отслеживанием свайп на банере
})();
