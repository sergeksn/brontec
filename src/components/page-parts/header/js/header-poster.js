import { Header, Header_Hidden, Header_Search, Header_Cart } from '@header-main-js';
import { wait, set_localStorage, anime, hide } from '@js-libs/func-kit';

let header = qs('header'),
    header_poster = qs('.header-poster'),
    poster_close_button = qs('.header-poster__close>button'),
    CONTROLLER = {
        lock: false,
        swipe_lock: false,
        status: 'show',
        close_button_lock: false,

        //скрываем банер
        //forever - указывает скрывать банер навсегда или до следующей перезагрузки страницы
        hide: async function (forever = true) {
            this.swipe_lock = true; //блокируем возможность свайпать

            let poster_id = header_poster.id,
                poster_parent = header_poster.parentNode, //узел родительского элемента банера
                poster_height = Header.get_header_h({ header_poster: true }), //высота блока банера
                header_background = d.getElementById('header-background'); //фон хедера

            Header.lock = true; //блокируем сворачивание хедера чтоб не скрылся при закрытии банера

            if (Header_Search.status === 'open' || Header.get_header_h({ header_poster: true, header_visible: true, header_hidden: true }) >= GDS.win.height) header.style.height = GDS.win.height + poster_height + 'px'; //если открыт блок поиска или если скрытый блок открыт и его размер на всю высоту окна увеличиваем высоту хедера чтоб не появлялось пустое место снизу
            //GDS.win.height используем т.к. высота хедера в этих случаях будет высотой окна браузера

            let up_header = anime({
                    //поднимаем хедер чтоб скрыть банер за пределами видимой части экрана
                    targets: header,
                    translateY: -poster_height,
                }).finished,
                up_header_background = anime({
                    //поднимаем фон хедера
                    targets: header_background,
                    height: '-=' + poster_height,
                }).finished,
                up_cart =
                    Header_Cart.status !== 'hide'
                        ? anime({
                              //поднимаем корзину если она открыта
                              targets: qs('.cart'),
                              top: '-=' + poster_height,
                          }).finished
                        : null,
                up_cart_overlay =
                    Header_Cart.status !== 'hide'
                        ? anime({
                              //поднимаем подложку корзины если она открыта
                              targets: qs('#cart-overlay'),
                              top: '-=' + poster_height,
                          }).finished
                        : null;

            await Promise.all([up_header, up_header_background, up_cart, up_cart_overlay]); //поднимаем хедер и уменщаем высоту его подложки

            header_poster.style.display = 'none'; //скрываем банер из документа
            header.style.transform = 'translateY(0)'; //попутно быстро меняем верхнюю позицию для хедера сразу после удаленяи банераоткрытии всех окон и ресазах

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
            Header_Search.size_recalculate(); //пересчитываем размеры хереда если результаты поиска открыты
            Header_Cart.size_recalculate(); //пересчитываем данные дял корзины

            poster_parent.removeChild(header_poster); //удаляем из тела документа банер
            poster_parent.removeChild(d.getElementById('header-poster__script')); //удаляем из тела документа скрипт банера

            await Promise.all([wait(() => qs('.header-poster'), null), wait(() => qs('#header-poster__script'), null)]); //дожидаемся пока элементы удаляться из DOM

            Header.has_header_poster = false; //помечаем что банера в хедере больше нет

            setTimeout(() => {
                Header.lock = false;//разблокируем прокрутку хедера с задержкой чтоб он не скрывался от события скрола вызванного уменьшением высоты документа после сужения подложки хедера, да-да знаю это костыль с таймаутом)
            }, 200);
        },
        //скрываем банер

        //отслеживанием свайп на банере
        top_poster_swipe: function () {
            header_poster._on(
                'swipe',
                async e => {
                    if (this.swipe_lock) return; //проверяем не заблокирован ли свайп

                    await Header.show(); //пытаем показать хедер, т.к. клик мог произойти в момент когда хедер в движении после скрола, в этом случае мы дождёмся пока хедер полностью не покажется, сели же он уже ыбл полностью виден этот пункт завершится мгновенно
                    //ПРИМЕЧАНИЕ: catch(e=>{}) НЕЛЬЗЯ убирать т.к. при попытке закрыть блоки получим исключение в виде того что невозможно показать хедер т.к. он заблокирован

                    let data = e.target.swipe_event_data,
                        s = data.settings,
                        el_width = parseFloat(w.getComputedStyle(data.el).width) + GDS.scroll.custom_page_scrollbar_width; //уводим в сторону на растояние ширины элемента + ширины кастомного скролбара, т.к. если скрол заблокирован банер уедет не полностью , а будет торчать кусочек скраю

                    this.close_button_lock = true; //блокируем кнопку закрытия

                    await hide({
                        //скрываем банер уводя в соответсвующую начальному направлению свайпа сорону
                        el: data.el,
                        instance: this,
                        property: 'translateX',
                        value: s.direction === 'left' ? -el_width : el_width,
                        started_value: 0,
                    });

                    await this.hide(false); //скрываем место после банера
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

                    exceptions_el: [poster_close_button], //не вызываем свайп если нажали на кнопку закрытия

                    callback_start: () => Header.active_elements.lock(), //блокируем активные элементы в хедере
                    callback_finally: () => Header.active_elements.unlock(), //разблокируем активные элементы в хедере
                    //двигаем банер за указателем
                    callback_move: data => {
                        let s = data.settings;

                        if (s.start_direction === 'right' || s.start_direction === 'left') data.el.style.transform = `translateX(${s.x - s.start_x}px)`; //перемещаем банер за указателем
                    },
                    //двигаем банер за указателем

                    //в случае неудачного свайпа возвращаем банер в исходное положение
                    callback_faill: async data => {
                        let s = data.settings;

                        if (s.find_exceptions_el) return; // если клик был по кнопке закрытия

                        if (s.x_dist <= 15 && s.y_dist <= 15) d.location.href = header_poster.getAttribute('data-href'); //если было очень маленькое смещение то мы переходим по ссылке из атрибута

                        //возвращаем банер в исходное положение
                        await anime({
                            targets: data.el,
                            translateX: 0,
                        }).finished;
                    },
                    //в случае неудачного свайпа возвращаем банер в исходное положение
                },
            );
        },
        //отслеживанием свайп на банере

        init: function () {
            if (!header_poster) return; //если нет банера прерываем

            poster_close_button._on('click', async _ => {
                if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

                if (this.close_button_lock) return; //проверяем разрешено ли нажимать на кнопку

                this.swipe_lock = true; //блокируем свайп

                Header.active_elements.lock();

                await Header.show(); //пытаем показать хедер, т.к. клик мог произойти в момент когда хедер в движении после скрола, в этом случае мы дождёмся пока хедер полностью не покажется, сели же он уже ыбл полностью виден этот пункт завершится мгновенно
                //ПРИМЕЧАНИЕ: catch(e=>{}) НЕЛЬЗЯ убирать т.к. при попытке закрыть блоки получим исключение в виде того что невозможно показать хедер т.к. он заблокирован

                //ВАЖНО: не забыть поменять тут на TRUE
                await this.hide(true); //скрываем банер

                Header.active_elements.unlock();
            });

            this.top_poster_swipe(); //добавляет слушатель для скрытия банера свайпом
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
