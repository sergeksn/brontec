import { Header, Header_Hidden } from '@header-main-js';
import { wait, request_to_server, set_localStorage, anime, show, hide } from '@js-libs/func-kit';
import Product_Small_Info_Block from '@product-small-info-block-main-js';
import { add_in_observe, dellete_from_observe } from '@images-main-js';

let header = qs('header'),
    header_hidden_menu = qs('.header-hidden__menu'),
    header_hidden_phone = qs('.header-hidden__phone'),
    search_input_wrap = qs('.header-search__input'),
    search_input = qs('.header-search input'),
    clean_input_button = qs('.header-search__input-control-icons>button'),
    results_wrap = qs('.header-search__results-wrap'),
    results_loader = qs('.header-search__loader'),
    results_data = qs('.header-search__results-data'),
    results_any_links = qs('.header-search__results-any-links'),
    CONTROLLER = {
        //pending to close - в процессе закрытия окна
        //close - окно закрыто
        //pending to open - в процессе открытия окна
        //open - окно открыто
        status: 'close',

        search_type: 'all', //тип поиска, поределяет то что ищем, возможные значения:
        //all - ищем всё и целые комплекты и их составные детали
        //komplekts - только полные комплекты
        //parts - только части комплекта

        where_add_instructon: 'all', //указываем где добавляем инструкции, возможные варианты:
        //all - для всех и для частей и для целых комплектов
        //komplekts - только для комплектов
        //parts - только для частей комплекта
        //never - не добавлять инстукции ни к одному продукту

        input_delay: 500, //задержка переде началом поиска после того как пользователь ввёл последний раз символ

        //открываем окно для отображения результатов поиска
        open_results_block: async function () {
            this.status = 'pending to open'; //статус открытия окна

            //если размер экрана менее 640px или 40rem то сначало дожидаемся сокрытия пунктов мобильного меню
            if (GDS.win.width_rem < 40) {
                await anime({
                    targets: [header_hidden_menu, header_hidden_phone],
                    opacity: 0,
                }).finished;
            }
            //если размер экрана менее 640px то сначало дожидаемся сокрытия пунктов мобильного меню

            //если высота хедера меньше высоты окна браузера то мы дожидаемся пока хедер увеличится на всю высоту окна
            if (Header.get_header_h({ header_poster: true, header_visible: true, header_hidden: true }) < GDS.win.height) {
                await anime({
                    //опускаем блок с результатами поиска да низа окна браузера
                    targets: header,
                    height: GDS.win.height,
                }).finished;
            }
            //если высота хедера меньше высоты окна браузера то мы дожидаемся пока хедер увеличится на всю высоту окна

            [header_hidden_menu, header_hidden_phone].forEach(el => (el.style.display = 'none')); //скрываем меню и телефон

            results_wrap.classList.add('--open-search-results-block'); //устанавливаем минимальную высоту для болока с результатами поиска чтоб всегда было видно лоадер

            //Примечание: можно добавить await чтоб лоадер точно был замечен пользователем
            show({ el: results_loader, display: 'block' }); //отображаем лоадер в документе

            this.status = 'open'; //статус открытия окна
        },
        //открываем окно для отображения результатов поиска

        //закрываем окно для отображения результатов поиска
        //fust_close - указывает на то что закрывается весь скрытый блок и в этом случае после скрытия блок с результатами поиска не отображаем меню а сразу скрываем оставшийся инпут
        close_results_block: async function (fust_close = false) {
            if (this.status !== 'open') return; //если окно с результатами поиска не польностью открыто то завершаем функцию

            this.status = 'pending to close'; //статус открытия окна

            if (!fust_close) [header_hidden_menu, header_hidden_phone].forEach(el => (el.style.display = '')); //возвращаем в документ блоки

            hide({ el: results_any_links, display: 'none' }); //плавно скрываем блок со ссылкам

            //если результаты поиска пусты и ещё не заполнены ни чем
            if (results_data.innerHTML === '') {
                hide({ el: results_loader, display: 'none' }); //плавно скрываем лоадер
            }
            //если результаты поиска пусты и ещё не заполнены ни чем

            //если есть какие-то отображённые результаты поиска
            else {
                dellete_from_observe(qsa('[data-img-type]', results_data)); //удаляем из отслеживания старые картинкинки

                await hide({ el: results_data }); //дожидаемся пока станет прозрачным блок с результатами поиска

                results_data.innerHTML = ''; //очищаем содержимое блока с результатами поиска
            }
            //если есть какие-то отображённые результаты поиска

            results_wrap.classList.remove('--open-search-results-block'); //убираем минимальную высоту для болока с результатами поиска чтоб он могу корректно скрыться

            let hh = fust_close ? Header.get_header_h({ header_poster: true, header_visible: true }) + parseFloat(w.getComputedStyle(search_input_wrap).height) : Header.get_header_h({ header_poster: true, header_visible: true, header_hidden: true }); //если скрываем быстро то нужно учитывать из скрытой части только инпут, если обычное скрытие то берём высоту хедера полностью вместе с меню и номером

            await anime({
                //уменьшаем высоту хедера так чтоб его низ был на уровне конца инпута для поиска
                targets: header,
                height: hh,
            }).finished;

            //дожидаемся отображения меню и телефона на маленьких экранах, если не нужно быстрое скрытие
            if (GDS.win.width_rem < 40 && !fust_close) {
                await anime({
                    targets: [header_hidden_menu, header_hidden_phone],
                    opacity: 1,
                }).finished;
            }
            //дожидаемся отображения меню и телефона на маленьких экранах, если не нужно быстрое скрытие

            this.status = 'close'; //статус открытия окна
            //ПРИМЕЧАНИЕ: должно быть раньше size_recalculate чтоб всё работало корректно

            Header_Hidden.size_recalculate(); //пересчитываем новые размеры хедера
        },
        //закрываем окно для отображения результатов поиска

        //клик по крестику в окне поиска
        click_clean_input_button: function () {
            if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

            this.clean_input(); //удаляем данные запроса пользователя в инпуте и хранилище

            let action = GDS.win.width_rem < 40 ? true : this.is_render_now; //если экран меньше 640 пикселей то это значи что у нас только одна конопка закрытия поиска и в этом случае мы не просто чистим запрос но и закрываем блок с результатами поиска иначе пользователь его ни как сне скроет без переоткрытия меню, а если экран больше то закрываем только если ейчас происходит запрос т.е. крутится лоадер

            this.chenge_in_search_input(action); //вызываем событие изменения в инпуте и если сейчас происходит рендер закрываем блок с результатами поиска, иначе оставляем блок с со всем содержимым на месте а только чистим инпут и хранилище
        },
        //клик по крестику в окне поиска

        //начинаем поиск после ввода символов
        //close_results_block - разрешает/запрещает скрывать блок с результатами поиска
        chenge_in_search_input: function (close_results_block = true) {
            clearTimeout(this.input_timerid); //удаляем таймер

            search_input.value.length > 0 ? search_input.classList.add('started-inputed') : search_input.classList.remove('started-inputed'); //если введён хотяб один символ в поле поиска меняем стили инпута

            //создаём таймер задержки ввода
            this.input_timerid = setTimeout(async () => {
                if (this.abort_controller) this.abort_controller.abort(); //прерываем предидущий поисковой запрос если он есть

                let search_text = search_input.value; //поисковой запрос

                localStorage.removeItem('search-result'); //так же чистим прежние результаты поиска из кеша объекта поиска

                if (!set_localStorage('search-text', search_text.slice(0, 100))) return; //если локальное хранилище доступно сохраняем в него поисковой запрос пользователя для того чтоб запомнить его на следующих страницах, сохраняем не более 100 символов

                if (Header_Hidden.status !== 'open') return; //если вдруг мы закрыли скрытый блок во время начала поиска, то мы просто записываем в хранилище поисковой запрос и прерываем дальнейшие дествия

                //если ввели 2 и блоее символов начинаем поиск
                if (search_text.length > 1) {
                    //если закрыт блок с результатами поиска
                    if (this.status === 'close') {
                        Header.active_elements.lock(); //блокируем активные элементы в хедере
                        await this.open_results_block(); //пытеамся открыть блок для результатов поиска
                        Header.active_elements.unlock(); //разблокируем активные элементы в хедере

                        this.render_results(search_text); //выводим результаты поиска
                    }
                    //если закрыт блок с результатами поиска

                    //если открыт блок с результатами поиска
                    else if (this.status === 'open') {
                        this.render_results(search_text); //выводим результаты поиска
                    }
                    //если открыт блок с результатами поиска

                    //если блок с результатами поиска в процессе закрытия, а мы ввели какой-то текст
                    else if (this.status === 'pending to close') {
                        await wait(() => this.status, 'close'); //дожидаемся полного закрытия блока

                        Header.active_elements.lock(); //блокируем активные элементы в хедере
                        await this.open_results_block(); //после того как блок полностью закрылся снова открываем его
                        Header.active_elements.unlock(); //разблокируем активные элементы в хедере

                        this.render_results(search_text); //выводим результаты поиска
                    }
                    //если блок с результатами поиска в процессе закрытия, а мы ввели какой-то текст

                    //если блок с результатами поиска в процессе открытия, а мы ввели какой-то текст
                    else if (this.status === 'pending to open') {
                        await wait(() => this.status, 'open'); //дожидаемся полного открытия блока

                        this.render_results(search_text); //выводим результаты поиска
                    }
                    //если блок с результатами поиска в процессе открытия, а мы ввели какой-то текст
                }
                //если ввели 2 и блоее символов начинаем поиск

                //если количество символов удалили до нуля и можно закрыть блок с результатми поиска то сворачиваем блок с результатами поиска
                if (search_text.length === 0 && close_results_block) {
                    Header.active_elements.lock(); //блокируем активные элементы в хедере

                    this.render_abort = true; //прерываем отображение возможных результатов поиска
                    await this.close_results_block(); //удаляем результаты поиска и закрываем его окно

                    Header.active_elements.unlock(); //разблокируем активные элементы в хедере
                }
                //если количество символов удалили до нуля и можно закрыть блок с результатми поиска то сворачиваем блок с результатами поиска
            }, this.input_delay);
            //создаём таймер задержки ввода
        },
        //начинаем поиск после ввода символов

        //удаляем данные запроса пользователя в инпуте и хранилище
        clean_input: function () {
            search_input.value = ''; //удаляем содержимое инпута для поиска

            search_input.classList.remove('started-inputed'); //убираем класс уведомляющий о том что поле заполнено текстом поиска

            localStorage.removeItem('search-text'); //чистим локальное хранилище от текста поиска

            localStorage.removeItem('search-result'); //так же чистим прежние результаты поиска из локального хранилища
        },
        //удаляем данные запроса пользователя в инпуте и хранилище

        //раскрываем окно с результатами поиска и отображает результаты поиска в блоке для результатов
        render_results: async function (search_text) {
            this.is_render_now = true; //в начале рендера помечаем что начат рендер
            this.render_abort = false; //в начале рендера помечаем что рендер не нужно прерывать

            let check_abort_render = () => {
                    if (this.status !== 'open' || search_input.value !== search_text) {
                        if (this.render_abort) {
                            this.close_results_block(); //если нужно прервать рендер то закрываем и блок с результатами поиска
                            this.is_render_now = false; //помечаем что рендер завершён
                        }
                        return true;
                    }
                }, //функции проверяет нужно ли прервать дальнейший рендер результатов поиска, например если окно начали закрывать или уже закрыли или если в поле вода поиска уже введён другой текст отичный от того результаты поиска которого мы рендерим, нужно проверять после каждой асинхронной операции черех await
                //вставляет переданные код html в блок с результатами поиска и плавно показывает его
                show_results = async result_html => {
                    await hide({ el: results_loader, display: 'none' }); //дожидаемся скрытия лоадера

                    if (check_abort_render()) return; //проверяем нужно ли продолжать рендер

                    results_data.innerHTML = result_html; //записываем результаты в блок с результатами поиска

                    await show({ el: results_data }); //плавно показываем блок с результатами

                    if (check_abort_render()) return; //проверяем нужно ли продолжать рендер

                    show({ el: results_any_links, display: 'flex' }); //плавно показываем блок со ссылками

                    add_in_observe(qsa('[data-img-type]', results_data)); //добавляем отслеживание видимости картинок в окне поиска

                    this.is_render_now = false; //по завершению рендера помечаем что рендер завершён
                };
            //вставляет переданные код html в блок с результатами поиска и плавно показывает его

            if (check_abort_render()) return; //проверяем нужно ли продолжать ренде

            //если мы уже ищем не первый раз то блок с результатами поиска нужно очистить перед выводом новых результатов
            if (results_data.innerHTML !== '') {
                dellete_from_observe(qsa('[data-img-type]', results_data)); //удаляем из отслеживания старые картинкинки

                await Promise.all([
                    hide({ el: results_any_links, display: 'none' }), //скрываем блок со ссылками
                    hide({ el: results_data }), //дожидаемся пока результаты поиска станут прозрачными
                ]); //дожидаемся пока скроются дополнительные ссылки снизу а так же результаты поиска

                if (check_abort_render()) return; //проверяем нужно ли продолжать рендер

                results_data.innerHTML = ''; //удаляем всё содержимое блока с результатами поиска

                show({ el: results_loader, display: 'block' }); //показываем лоадер
            }
            //если мы уже ищем не первый раз то блок с результатами поиска нужно очистить перед выводом новых результатов

            let saved_results = localStorage.getItem('search-result'); //пытаемся получить результаты предидущего поиска, если они есть то можно взять их, т.к. это значит что поисковой запрос не менялся,  апользователь вероятнее всего обновил страницу или переоткрыл блок поиска без изменений искомого текта

            if (saved_results) return await show_results(saved_results); //вставляет переданные код html в блок с результатами поиска и плавно показывает его, а так же прерываем дальнейшие выполнение функции

            //ищем search_text - текст введённый в поле поиска в базе, после того как получили ответ выводим его на экран
            await this.load_results(search_text)
                .then(async data => {
                    //только если поиск НЕ был прерван
                    let html_code = data.error || data; //определяем HTML код для вставки

                    if (check_abort_render()) return; //проверяем нужно ли продолжать рендер

                    await show_results(html_code); //вставляет переданные код html в блок с результатами поиска и плавно показывает его

                    if (check_abort_render()) return; //проверяем нужно ли продолжать рендер

                    !data.error && !set_localStorage('search-result', html_code); //если это не ошибка и если локальное хранилище доступно сохраняем в него результат поиска, для быстрого рендера при повторном открытии окна, если оно было просто закрыто
                    //ПРИМЕЧАНИЕ: сохранять в хранилище ошибки не тоит т.к. ошибки быстро пофиксятся, а то чего раньше не было в каталоге может добавится и нужна постоянно актуальная информация, так её мы не запоминаем что постоянно проверять заново
                })
                .catch(_ => {}); //этот блок catch может сработать только из-за прерывания поиска AbortError или при ошибке в коде или исключении внутри then
            //ищем search_text - текст введённый в поле поиска в базе, после того как получили ответ выводим его на экран
        },
        //раскрываем окно с результатами поиска и отображает результаты поиска в блоке для результатов

        //начинает асинхранную задачу по поиску и возвращает промис содержащий в себе HTML для вставки
        load_results: function (search_text) {
            return new Promise(async (resolve, reject) => {
                this.abort_controller = new AbortController(); //сохраняем новый прерыватель запроса на поиск

                let request_data = {
                    //запрос на сервер
                    method: 'POST',
                    signal: this.abort_controller.signal, //ставим отслеживание для прерывания запроса
                    headers: { 'Content-Type': 'application/json;charset=utf-8' },
                    body: JSON.stringify({
                        //данные для отправки на сервер преобразованный в строку
                        action: 'search',
                        search_text: search_text,
                        search_type: this.search_type,
                        where_add_instructon: this.where_add_instructon,
                    }),
                };

                // отправляем запрос на сервер для поиска и получаем ответ
                await request_to_server(request_data)
                    //если не было ошибок и исключений
                    .then(response => {
                        let output_html = ''; //сюда будем записывать HTML для отображения на странице

                        if (response.nothing_found) return resolve({ error: `<div class="header-search__fail">По Вашему запросу <span>"${search_text}"</span> ничего не найдено =(</div>` }); //если вернулась nothing_found завершаем функцию, значит ничего не найдено по текущему запросу

                        //перебираем все данные из ответа и создаём на их основе HTML контент
                        response.forEach(item => {
                            item.search_text = search_text; //дополянем объект данными о введённом тексте

                            let render = new Product_Small_Info_Block(item); //создаём экземпляр с данными для рендера

                            output_html += render.render_product_block(); //дописываем html код блока предварительного просмотри товара

                            output_html += render.render_instruction_block(); //дописываем html код блока инструкций для этго товара
                        });
                        //перебираем все данные из ответа и создаём на их основе HTML контент

                        return resolve(output_html); //завершаем промис передав в него итоговый HTML
                    })
                    .catch(e => {
                        if (typeof e.ksn_message === 'undefined') return console.error(e); //если ошибка не наша выводим её в консоль

                        if (e.ksn_message === 'AbortError') return reject(); //если поиск был прерван то отклоняем промис

                        if (e.ksn_message === 'Failed to fetch') return resolve({ error: `<div class="header-search__fail">Не удалось подключиться к ресурсу ${GDS.ajax_url}</div>` }); //выводим сообщение

                        if (e.ksn_message === 'server-error') return resolve({ erroe: `<div class="header-search__fail">На стороне сервера возникла ошибка, код ошибки ${e.status}\n Приносим извинения за доставленые неудобства, мы уже исправляем проблему!\n Будьте всегда на позитиве =)</div>` }); //выводим сообщение
                    });
            });
        },
        //начинает асинхранную задачу по поиску и возвращает промис содержащий в себе HTML для вставки

        //функция пересчитывает размеры в окне с результатами поиска про ресайзе
        size_recalculate: function () {
            if (this.status === 'close' || this.status === 'pending to close') return; //если окно поиска закрыто или в процессе закрытия то завершаем функцию

            //функция для обновления параметров блока
            let update_size_params = () => {
                header.style.height = GDS.win.height + 'px';

                [header_hidden_menu, header_hidden_phone].forEach(el => {
                    //убираем стили у меню и телефона
                    el.style.display = '';
                    el.style.opacity = '';
                });

                if (GDS.win.width_rem < 40) [header_hidden_menu, header_hidden_phone].forEach(el => (el.style.display = 'none')); //скрываем меню и телефон т.к. открыт блок поиска
            };
            //функция для обновления параметров блока

            if (this.status === 'pending to open') return wait(() => this.status, 'open').then(() => update_size_params()); //если откно с результатами поиска в прецессе открытия то сначало дажидаемся его открытия, а потом пересчитываем все параметры

            update_size_params(); //если окно с результатами открыто обновляем данные блока
        },
        //функция пересчитывает размеры в окне с результатами поиска про ресайзе

        init: function () {
            clean_input_button._on('click', _ => this.click_clean_input_button()); //клик по крестику в в инпуте для очистки инпута и хранилища

            search_input._on('input', _ => this.chenge_in_search_input()); //начинаем поиск после ввода символов

            w._on('resize_optimize', _ => this.size_recalculate()); //выполяем перерисвку при ресайзе
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
