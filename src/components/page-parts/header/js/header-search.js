import { Header, Header_Hidden } from '@header-main-js';
import { wait, request_to_server, set_localStorage, anime } from '@js-libs/func-kit';

import Product_Small_Info_Block from '@product-small-info-block-main-js';

import { Img_Loader } from '@images-main-js';

export default new (class {
    //иницализируем все функции и слушатели для работы поиска
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.header = d.getElementsByTagName('header')[0];
        this.header_visible_search_button = d.querySelector('.header-visible__search-button');
        this.header_hidden = d.querySelector('.header-hidden');
        this.header_hidden_menu = d.querySelector('.header-hidden__menu');
        this.header_hidden_phone = d.querySelector('.header-hidden__phone');
        this.header_search = d.querySelector('.header-search');
        this.search_input_wrap = d.querySelector('.header-search__input');
        this.search_input = d.querySelector('.header-search input');
        this.close_button = d.querySelector('.header-search__close-button');
        this.results_wrap = d.querySelector('.header-search__results-wrap');
        this.results_loader = d.querySelector('.header-search__loader');
        this.results_data = d.querySelector('.header-search__results-data');
        this.results_any_links = d.querySelector('.header-search__results-any-links');
        //записываем все неоходимые переменные для удобства доступа

        //pending to close - в процессе закрытия окна
        //close - окно закрыто
        //pending to open - в процессе открытия окна
        //open - окно открыто
        this.status = 'close';

        this.search_type = 'all'; //тип поиска, поределяет то что ищем, возможные значения:
        //all - ищем всё и целые комплекты и их составные детали
        //komplekts - только полные комплекты
        //parts - только части комплекта

        this.where_add_instructon = 'all'; //указываем где добавляем инструкции, возможные варианты:
        //all - для всех и для частей и для целых комплектов
        //komplekts - только для комплектов
        //parts - только для частей комплекта
        //never - не добавлять инстукции ни к одному продукту

        this.close_button._on('click', () => this.click_close_search_button()); //клик по крестику в окне поиска

        this.search_input._on('input', () => this.chenge_in_search_input()); //начинаем поиск после ввода символов

        w._on('resize_optimize', () => this.size_recalculate()); //выполяем перерисвку при ресайзе
    }
    //иницализируем все функции и слушатели для работы поиска

    //получаем минимальную высоту которую должен занимать блок с результатми поиска
    search_results_block_height() {
        let height = GDS.win.height - Header.get_header_h({ header_poster: Header.has_header_poster, header_visible: true }) - w.getComputedStyle(this.search_input_wrap).height.replace('px', ''); //получаем минимальную высоту которую должен занимать блок с результатми поиска

        return height >= 100 ? height : 100; //минимальная высота анимации раскрытия блока поиска
    }
    //получаем минимальную высоту которую должен занимать блок с результатми поиска

    //открываем окно для отображения результатов поиска
    async open_results_block() {
        this.status = 'pending to open'; //статус открытия окна

        //если размер экрана менее 640px или 40rem то сначало дожидаемся сокрытия пунктов мобильного меню
        if (GDS.win.width_rem < 40) {
            await anime({
                targets: [this.header_hidden_menu, this.header_hidden_phone],
                opacity: 0,
            }).finished;
        }
        //если размер экрана менее 640px то сначало дожидаемся сокрытия пунктов мобильного меню

        let srb_height = this.search_results_block_height();

        await anime({
            //опускаем блок с результатами поиска да низа окна браузера
            targets: this.results_wrap,
            height: srb_height,
        }).finished;

        [this.header_hidden_menu, this.header_hidden_phone].forEach(el => (el.style.display = 'none')); //скрываем меню и телефон

        this.results_wrap.style.minHeight = srb_height + 'px'; //устанавливаем минимальную высоту для болока с результатами поиска чтоб даже при малом колическте ответов или при их отсутствии блок выглядел нормально

        this.results_loader.style.display = 'block'; //отображаем лоадер в документе

        //Примечание: можно добавить await чтоб лоадер точно был замечен пользователем
        anime({
            //показываем лоадер после откытия блока с результатами поиска
            targets: this.results_loader,
            opacity: 1,
        }).finished;

        this.results_wrap.style.height = ''; //убираем высоту у блока с результатми вывода чтоб не было полосы теней на результатах

        this.header.style.overflow = ''; //возвращем прокрутку в хедер

        this.status = 'open'; //статус открытия окна
    }
    //открываем окно для отображения результатов поиска

    //закрываем окно для отображения результатов поиска
    //fust_close - указывает на то что закрывается весь скрытый блок и в этом случае после скрытия блок с результатами поиска не отображаем меню а сразу скрываем оставшийся инпут
    async close_results_block(fust_close = false) {
        if (this.status !== 'open') return; //если окно с результатами поиска не польностью открыто то завершаем функцию

        this.status = 'pending to close'; //статус открытия окна

        this.header.style.height = ''; //убираем высоту у хедера чтоб его можно было свернуть

        if (!fust_close) [this.header_hidden_menu, this.header_hidden_phone].forEach(el => (el.style.display = '')); //возвращаем в документ блоки

        this.results_wrap.style.height = this.search_results_block_height() + 'px'; //задаём высоту блоку с результатами поиска

        //скрываем блок со ссылками
        anime({
            targets: this.results_any_links,
            opacity: 0,
            complete: () => (this.results_any_links.style.display = ''),
        });
        //скрываем блок со ссылками

        //если результаты поиска пусты и ещё не заполнены ни чем
        if (this.results_data.innerHTML === '') {
            //плавно скрываем лоадер
            await anime({
                targets: this.results_loader,
                opacity: 0,
            }).finished;
        }
        //если результаты поиска пусты и ещё не заполнены ни чем

        //если есть какие-то отображённые результаты поиска
        else {
            Img_Loader.dellete_from_observe(this.results_data.querySelectorAll('[data-img-type]')); //удаляем из отслеживания старые картинкинки

            await anime({
                //дожидаемся пока станет прозрачным блок с результатами поиска
                targets: this.results_data,
                opacity: 0,
            }).finished;

            this.results_data.innerHTML = ''; //очищаем содержимое блока с результатами поиска
        }
        //если есть какие-то отображённые результаты поиска

        this.results_loader.style.display = ''; //скрываем лоадер в документе

        this.results_wrap.style.minHeight = ''; //чистим вспомогательные стили

        this.header.style.overflow = 'visible'; //нужно добавить чтоб была видна полоса тени в момент сворачивания скрытого блока

        await anime({
            //уменьшаем высоту блок с результатами поиска для его скрытия
            targets: this.results_wrap,
            height: 0,
        }).finished;

        //дожидаемся отображения меню и телефона на маленьких экранах
        if (GDS.win.width_rem < 40 && !fust_close) {
            let show_menu_mobile = anime({
                    targets: this.header_hidden_menu,
                    opacity: 1,
                }).finished,
                show_phone_mobile = anime({
                    targets: this.header_hidden_phone,
                    opacity: 1,
                }).finished;

            await Promise.all([show_menu_mobile, show_phone_mobile]);
        }
        //дожидаемся отображения меню и телефона на маленьких экранах

        this.status = 'close'; //статус открытия окна
        //ПРИМЕЧАНИЕ: должно быть раньше size_recalculate чтоб всё работало корректно

        Header_Hidden.size_recalculate(); //пересчитываем новые размеры меню добавляем высоту хедеру и прокрутку если нужно
    }
    //закрываем окно для отображения результатов поиска

    //клик по крестику в окне поиска
    async click_close_search_button() {
        if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

        Header.active_elements.lock(); //блокируем активные элементы в хедере

        if (this.status === 'open') {
            //если окно срезультатами поиска открыто, то после его закрытиея чистим инпут с поисковым запросом
            await this.close_results_block();
            this.clean_input();
        } else {
            this.search_input.value !== '' ? this.clean_input() : await Header_Hidden.close(); //если же окно с результатами поиска было закрыто, то значит оно уже было закрыто, тогда если в поле инпута был какой то текст просто чистим его, значит мы просто нажали на крестик в тот момент когда запрос на сервер ещё не отправился, если поле ввода пусто то значит можно закрывать окно поиска
        }

        Header.active_elements.unlock(); //разблокируем активные элементы в хедере
    }
    //клик по крестику в окне поиска

    //начинаем поиск после ввода символов
    chenge_in_search_input() {
        clearTimeout(this.input_timerid); //удаляем таймер

        this.search_input.value.length > 0 ? this.search_input.classList.add('started-inputed') : this.search_input.classList.remove('started-inputed'); //если введён хотяб один символ в поле поиска меняем стили инпута

        //создаём таймер задержки ввода
        this.input_timerid = setTimeout(async () => {
            if (this.abort_controller) this.abort_controller.abort(); //прерываем предидущий поисковой запрос если он есть

            let search_text = this.search_input.value; //поисковой запрос

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

            //если количество символов удалили до нуля то сворачиваем блок с результатами поиска
            if (search_text.length === 0) {
                Header.active_elements.lock(); //блокируем активные элементы в хедере
                await this.close_results_block(); //удаляем результаты поиска и закрываем его окно
                Header.active_elements.unlock(); //разблокируем активные элементы в хедере
            }
            //если количество символов удалили до нуля то сворачиваем блок с результатами поиска
        }, 500);
        //создаём таймер задержки ввода
    }
    //начинаем поиск после ввода символов

    //удаляем данные запроса пользователя в инпуте и хранилище
    clean_input() {
        this.search_input.value = ''; //удаляем содержимое инпута для поиска

        this.search_input.classList.remove('started-inputed'); //убираем класс уведомляющий о том что поле заполнено текстом поиска

        localStorage.removeItem('search-text'); //чистим локальное хранилище от текста поиска

        localStorage.removeItem('search-result'); //так же чистим прежние результаты поиска из локального хранилища
    }
    //удаляем данные запроса пользователя в инпуте и хранилище

    //раскрываем окно с результатами поиска и отображает результаты поиска в блоке для результатов
    async render_results(search_text) {
        let check_abort_render = () => this.status !== 'open' || this.search_input.value !== search_text, //функции проверяет нужно ли прервать дальнейший рендер результатов поиска, например если окно начали закрывать или уже закрыли или если в поле вода поиска уже введён другой текст отичный от того результаты поиска которого мы рендерим, нужно проверять после каждой асинхронной операции черех await
            //вставляет переданные код html в блок с результатами поиска и плавно показывает его
            show_results = async result_html => {
                await anime({
                    //дожидаемся скрытия лоадера
                    targets: this.results_loader,
                    opacity: 0,
                }).finished;

                if (check_abort_render()) return; //проверяем нужно ли продолжать ренде

                this.results_data.innerHTML = result_html; //записываем результаты в блок с результатами поиска

                await anime({
                    //плавно показываем блок с результатами
                    targets: this.results_data,
                    opacity: 1,
                }).finished;

                if (check_abort_render()) return; //проверяем нужно ли продолжать ренде

                //показываем блок со ссылками
                this.results_any_links.style.opacity = '';
                this.results_any_links.style.display = 'flex';
                anime({
                    //плавно показываем блок с результатами
                    targets: this.results_any_links,
                    opacity: 1,
                });
                //показываем блок со ссылками

                Img_Loader.add_in_observe(this.results_data.querySelectorAll('[data-img-type]')); //добавляем отслеживание видимости картинок в окне поиска
            };
        //вставляет переданные код html в блок с результатами поиска и плавно показывает его

        if (check_abort_render()) return; //проверяем нужно ли продолжать ренде

        //если мы уже ищем не первый раз то блок с результатами поиска нужно очистить перед выводом новых результатов
        if (this.results_data.innerHTML !== '') {
            Img_Loader.dellete_from_observe(this.results_data.querySelectorAll('[data-img-type]')); //удаляем из отслеживания старые картинкинки

            //скрываем блок со ссылками
            let hide_any_links = anime({
                    targets: this.results_any_links,
                    opacity: 0,
                    complete: () => (this.results_any_links.style.display = ''),
                }).finished,
                hide_results_data = anime({
                    //дожидаемся пока результаты поиска станут прозрачными
                    targets: this.results_data,
                    opacity: 0,
                }).finished;

            await Promise.all([hide_any_links, hide_results_data]); //дожидаемся пока скроются дополнительные ссылки снизу а так же результаты поиска

            if (check_abort_render()) return; //проверяем нужно ли продолжать ренде

            this.results_data.innerHTML = ''; //удаляем всё содержимое блока с результатами поиска

            anime({
                //показываем лоадер
                targets: this.results_loader,
                opacity: 1,
            });
        }
        //если мы уже ищем не первый раз то блок с результатами поиска нужно очистить перед выводом новых результатов

        let saved_results = localStorage.getItem('search-result'); //пытаемся получить результаты предидущего поиска, если они есть то можно взять их, т.к. это значит что поисковой запрос не менялся,  апользователь вероятнее всего обновил страницу или переоткрыл блок поиска без изменений искомого текта

        if (saved_results) return await show_results(saved_results); //вставляет переданные код html в блок с результатами поиска и плавно показывает его, а так же прерываем дальнейшие выполнение функции

        //ищем search_text - текст введённый в поле поиска в базе, после того как получили ответ выводим его на экран
        await this.load_results(search_text)
            .then(async data => {
                //только если поиск НЕ был прерван
                let html_code = data.error || data; //определяем HTML код для вставки

                if (check_abort_render()) return; //проверяем нужно ли продолжать ренде

                await show_results(html_code); //вставляет переданные код html в блок с результатами поиска и плавно показывает его

                if (check_abort_render()) return; //проверяем нужно ли продолжать ренде

                if (!data.error && !set_localStorage('search-result', html_code)) return; //если это не ошибка и если локальное хранилище доступно сохраняем в него результат поиска, для быстрого рендера при повторном открытии окна, если оно было просто закрыто
                //ПРИМЕЧАНИЕ: сохранять в хранилище ошибки не тоит т.к. ошибки быстро пофиксятся, а то чего раньше не было в каталоге может добавится и нужна постоянно актуальная информация, так её мы не запоминаем что постоянно проверять заново
            })
            .catch(e => {}); //этот блок catch может сработать только из-за прерывания поиска AbortError или при ошибке в коде или исключении внутри then
        //ищем search_text - текст введённый в поле поиска в базе, после того как получили ответ выводим его на экран
    }
    //раскрываем окно с результатами поиска и отображает результаты поиска в блоке для результатов

    //начинает асинхранную задачу по поиску и возвращает промис содержащий в себе HTML для вставки
    load_results(search_text) {
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
    }
    //начинает асинхранную задачу по поиску и возвращает промис содержащий в себе HTML для вставки

    //функция пересчитывает размеры в окне с результатами поиска про ресайзе
    size_recalculate() {
        if (this.status === 'close' || this.status === 'pending to close') return; //если окно поиска закрыто или в процессе закрытия то завершаем функцию

        //функция для обновления параметров блока
        let update_size_params = () => {
            this.header.style.height = GDS.win.height + 'px';

            [this.header_hidden_menu, this.header_hidden_phone].forEach(el => {
                //убираем стили у меню и телефона
                el.style.display = '';
                el.style.opacity = '';
            });

            if (GDS.win.width_rem < 40) [this.header_hidden_menu, this.header_hidden_phone].forEach(el => (el.style.display = 'none')); //скрываем меню и телефон

            this.results_wrap.style.minHeight = this.search_results_block_height() + 'px'; //устанавливаем минимальную высоту для болока с результатами поиска чтоб даже при малом колическте ответов или при их отсутствии блок выглядел нормально
        };
        //функция для обновления параметров блока

        if (this.status === 'open') return update_size_params(); //если окно с результатами открыто обновляем данные блока

        if (this.status === 'pending to open') return wait(() => this.status, 'open').then(() => update_size_params()); //если откно с результатами поиска в прецессе открытия то сначало дажидаемся его открытия, а потом пересчитываем все параметры
    }
    //функция пересчитывает размеры в окне с результатами поиска про ресайзе
})();
