import { wait } from '@js-libs/func-kit';

export default new (class {
    //инициализатор загрузки картинок
    constructor() {
        let options_observer = {
            threshold: 0.1, //показываем только когда элемент виден минимум на n процентов от своего размера
        };

        this.img_visible_observer = new IntersectionObserver(this.img_upload_manager.bind(this), options_observer); //создаём наблюдатель за видимостью элементов на экране

        this.add_in_observe(document.querySelectorAll('[data-img-type]')); //добаляем все нужные элементы на отслеживание видимости

        let premision = true;

        //пре ресайзе с тротлингом выводим более качественные картинки
        //ПРИМЕЧАНИЕ: не использую resize_throttle т.к. если где-то будет задан более меньший интервал то это событие будет выполняться чащем чем мы тут установим
        window.addEventListener('resize', () => {
            if (!premision) return;

            premision = false;

            setTimeout(() => {
                let temporary = new IntersectionObserver(entries => {
                    this.img_upload_manager.bind(this)(entries); //выполянем проверку на видимые изображения
                    temporary.disconnect(); // после того как пробежались по все картинкам для отслеживания отключаем временный IntersectionObserver
                }, options_observer); //создаём временный наблюдатель за видимостью элементов на экране

                document.querySelectorAll(`[data-img-type]:not([data-current-size="original"])`).forEach(el => temporary.observe(el)); //добавляем все элементы на отслеживания видимости во временный IntersectionObserver, ВАЖНО добавляем именно те элементы которые ещё не загружены и не начали загрузку для текущей ориентации, а так же исключая те которые не нужно загружать для текущей ориентации, например в случае если уже загружена картинка более лучего качества в другой ориентации

                premision = true;
            }, 500);
        });
    }
    //инициализатор загрузки картинок

    //добаляем все нужные элементы на отслеживание видимости
    add_in_observe(elems) {
        elems.forEach(el => this.img_visible_observer.observe(el));
    }
    //добаляем все нужные элементы на отслеживание видимости

    //удаляем элементы из отслеживания видимости
    dellete_from_observe(elems) {
        elems.forEach(el => this.img_visible_observer.unobserve(el));
    }
    //удаляем элементы из отслеживания видимости

    //определяет какой загрузчик нужен для данного блока картинки
    img_upload_manager(entries) {
        //перебираем массив с объектами отслеживаемых элементов
        //ПРИМЕЧАНИЕ: при первой инициализации в этом массиве будут все элементы которые мы добавили к данному наблюдателю, а далее только те видимость которых будет изменяться
        entries.forEach(entrie => {
            //из всех элементов берём только те которые пересекаются с экраном
            if (entrie.isIntersecting) {
                //загружаем картинки только если её блок был на экране минимум 100 мс
                entrie.target.start_intersecting_timeout_id = setTimeout(() => {
                    switch (
                        entrie.target.getAttribute('data-img-type') //для каждого типа блока картинки вызываем свой обработчик для загрузки
                    ) {
                        case 'img': //для обычных блоков img с одной картинкой вставленной через тег img
                            this.common_img_render(entrie.target, 'img'); //инициализируем загрузку и отображение картинки
                            break;
                        case 'bg': //для обычных блоков div с одной картинкой вставленной через css background-image
                            this.common_img_render(entrie.target, 'bg'); //инициализируем загрузку и отображение картинки
                            break;
                        case 'kit':
                            this.svg_kit_render(entrie.target);
                            break;
                    }
                }, 100); //записываем id данного таймаута в свойства элемента entrie.target чтоб потом можно было его отключить если элемент слишком быстро пропал с экрана
            }
            //из всех элементов берём только те которые пересекаются с экраном

            //если пересечние перешло в состояние не пересечения, т.е. элемент либо был за пределами root или в процессе вышел за его пределы, в нашем случае ушёл за границы видимой части экрана
            else {
                if (entrie.target.start_intersecting_timeout_id) {
                    clearTimeout(entrie.target.start_intersecting_timeout_id);
                    delete entrie.target.start_intersecting_timeout_id;
                }
            }
            //если пересечние перешло в состояние не пересечения
        });
        //перебираем массив с объектами отслеживаемых элементов
    }
    //определяет какой загрузчик нужен для данного блока картинки

    //получаем адрес миниатюры картинки с учётом ширины картинки на сайте
    //img - картинка или блок фоном которого является картинка
    get_img_size_url(img) {
        let data_src = img.getAttribute('data-src'), //путь к оригиналу картинки
            ext = data_src.match(/\.{1}([a-zA-Z]+)$/)[0], //расширение картинки в вормате .jpg С ТОЧКОЙ !!!
            url_bez_ext = data_src.replace(ext, ''), //адрес картинки без расширения файла и точки перед ним
            original_w = +img.getAttribute('data-original-w'), //ширина оригинальной картинки в px
            original_h = +img.getAttribute('data-original-h'), //высота оригинальной картинки в px
            width = +window.getComputedStyle(img).width.replace('px', ''), //целочисленно значение ширины отведённое под картинку
            height = +window.getComputedStyle(img).height.replace('px', ''), //целочисленно значение высоты отведённое под картинку
            dpr_width = width * GDS.device.dpr, //требуемая ширина картинки для качественного отображения, с учётом плотности пиксилей
            dpr_height = height * GDS.device.dpr, //требуемая высота картинки для качественного отображения, с учётом плотности пиксилей
            //ПРИМЕЧАНИЕ: может быть такая ситуация что высота картинки которая нужна больше то высоты которая будет определена на основе ширины блока картинки, это может возникнуть если мы используем картинку с таким позиционированием что она занимает определённую высоту, а ширина которая не поместилась просто остаётся за пределами экран или блока, т.е. в этом случае нам нужно отталкивать уже от высоты блока картинки чтоб получить подходящую по качеству миниатюру, а не от ширины как мы делаем при стандартном подходе
            need_dpr_width = Math.round(height) > Math.round((original_h * width) / original_w) ? (original_w * dpr_height) / original_h : dpr_width, //если высота блока картинки больше высоты которая будет у самой картинки, при условии что ширина картинки берётся как у ширины блока, то это значит что основой вычислений будет именно высота блока, т.к. нужно загрузить качественную картинку (простым примером может служить слоайдер на главной екб, там высота блока картинки приоритетнее, т.к. нужно загрузить изображение наилучего качества опираясь на высоту, а лишняя ширина будет за пределаи блока или экрана)
            //(original_w * dpr_height) / original_h это необходимая ширина картинки с учётом dpr чтоб качественно выглядеть при такой высоте и плотности пикселей
            miniatura_width, //сюда будет записана требуемая ширина миниатюры из списка заданных
            miniatur_sizes = GDS.media.img.miniatur_sizes; // это все возможные значения ширины у миниатюр

        //проверяем условия для полчени нужного размера картинки
        switch (true) {
            case need_dpr_width <= miniatur_sizes[1]: //в случае если требуемая ширина картинки меньше наименьшего доступного размера миниатюры, например нужна картинка шириной в 230px с учётом dpr, в этом члучае мы отдаём картинку миниатюры с наименьшим размером в 300px
                miniatura_width = miniatur_sizes[1]; //запрашиваем наименьшую миниатюру
                break;
            case need_dpr_width > miniatur_sizes[miniatur_sizes.length - 1]: //если требуемая ширина картинки больше самой большой миниатюры из списка доступных
                miniatura_width = 'original'; //запрашиваем оригинал картинки
                break;
            default:
                //перебираем массив с доступными ширинами миниатюр miniatur_sizes, чтоб определить какая миниатюра будет оптимальная для данной картинки
                for (let i = 0; i < miniatur_sizes.length - 1; i++) {
                    //ПРИМЕЧАНИЕ: need_dpr_width * 0.97 это 3% погрешности, т.е. мы подбираем зарегистрированные большие ширины миниатюры для картинки на 3% уже той что у нас есть, это сделано чтоб избежать того что когда наш need_dpr_width = 2519, к примеру, мы подставляем миниатюру из miniatur_sizes в 3000, а с погрешностью мы подставим 2500, для пользователя качество не заметна, а вот размер загружаемого файла уменьшиться
                    //когда нашли размер миниатюры удовлетворяющий нашему условиию
                    if (need_dpr_width > miniatur_sizes[i] && need_dpr_width * 0.97 <= miniatur_sizes[i + 1]) {
                        miniatura_width = miniatur_sizes[i + 1]; //ширина оптимальной миниатюры
                        break; //прерываем цикл когда нашли подходящую ширину миниатюры
                    }
                }
            //перебираем массив с доступными ширинами миниатюр miniatur_sizes, чтоб определить какая миниатюра будет оптимальная для данной картинки
        }
        //проверяем условия для полчени нужного размера картинки

        //ВАЖНО: удалять картинку из отслеживания если для текущего размера экрана устройства она не может быть больше ,т.е. сделать привязку к device.width, так же не забыть изменить условие в верху при смене ориентации чтоб добавлялись только нужные картинки на отслеживание, думаю лучшим тригером будет калсс по типу max-uploaded вместо отрибута [data-current-size="original"]

        if (miniatura_width >= original_w || miniatura_width === 'original') {
            //если ширина запрашиваемой миниатюры больше или равна ширине оригинальной картинки сообщаем о том что требуется оригинал
            img.setAttribute('data-current-size', 'original'); //помечаем что текущая картинка оригинал
            return {
                url: img.getAttribute('data-src'),
                size: 'original',
            };
        }

        let current_size = img.getAttribute('data-current-size'); //атрибут инфурмирующий о том какой наилучший размер (ширина) картинки был ранее загружен

        if (+current_size >= miniatura_width) return 'no need to update'; //если размер текущей картинку меньше её оригинал, или текущий размер миниатюры такой же как и тот что мы хотим сейчас установить то завершаем функцию

        img.setAttribute('data-current-size', miniatura_width); //если запрошенная миниатюра больше текущей то записываем для данной картинки её текущий размер

        let data_miniatura_height = Math.round((original_h * miniatura_width) / original_w); //используя пропорцию получаем высоту запрашиваемой миниатюры

        return {
            //url: img.getAttribute('data-src'), //для тестов пока нет миниатюр
            url: url_bez_ext + '-' + miniatura_width + 'x' + data_miniatura_height + ext, //возвращаем расчитаный url для миниатюры wp-content/uploads/2021/03/1-2-2000x702.jpg к примеру
            size: miniatura_width,
        };
    }
    //получаем адрес миниатюры картинки с учётом ширины картинки на сайте

    //получает на вход url картинки, после чего он создаёт новый объект изображения и мониторит его загрузку или ошибку загрузки в случае если картинка не найдена
    download_img_tracker(target_img, url) {
        return new Promise((resolve, reject) => {
            //если не поддерживается технология прерывания запросов, просто испльзуем технологиию через загрузку как изображение без возможности прервать
            if (!GDS.supports_technology.AbortController) {
                let img = new Image();

                img.onload = () => resolve();

                img.onerror = () => reject();

                img.src = url;
                return;
            }
            //если не поддерживается технология прерывания запросов, просто испльзуем технологиию через загрузку как изображение без возможности прервать

            let controller = new AbortController();
            setTimeout(() => controller.abort(), 7000);

            fetch(url, {
                //запрос на сервер
                method: 'GET',
                signal: controller.signal,
            })
                .then(resp => {
                    resp.blob()
                        .then(data => {
                            console.log(data);
                        })
                        .catch(error => {
                            if (error.name == 'AbortError') {
                                // обработать ошибку от вызова abort()
                                console.log('Прервано blob!');
                            }
                        });
                })
                .catch(error => {
                    if (error.name == 'AbortError') {
                        // обработать ошибку от вызова abort()
                        console.log('Прервано!');
                    }
                });
        });
    }
    //получает на вход url картинки, после чего он создаёт новый объект изображения и мониторит его загрузку или ошибку загрузки в случае если картинка не найдена

    //функция начинает загрузку картинки img и верёнет промис о результатах загрузки
    common_img_loader(img) {
        return new Promise((resolve, reject) => {
            let loader = img.parentNode.querySelector('.loader'); //лоадер

            //если есть лоадер и ещё не была загружена ни одна из миниатюр картинки
            if (loader && !img.classList.contains('uploaded')) {
                setTimeout(() => {
                    //делаем проверку через малый интервал времени, если картинка всё ещё не загружена после старта её загрузки, то скорее всего картинка берётся не из кеша и пользователю нужно показать лоадер, если картинка загрузилась очень быстро то лоадер показывать не зачем
                    if (!img.classList.contains('uploaded')) loader.style.display = 'flex'; //показываем лоадер мгновенно
                }, GDS.media.img.loader_delay_time);
            }
            //если есть лоадер и ещё не была загружена ни одна из миниатюр картинки

            let is_svg = img.getAttribute('data-src').match(/\.{1}([a-zA-Z]+)$/)[1] === 'svg', //указывает svg картинка или нет
                size, //запишем сюда размер миниатюры
                url; //сюда будет записан сгенерированный адрес на миниатюру картинки или на саму картинку в случае с svg

            if (is_svg) {
                url = img.getAttribute('data-src');
            } else {
                let result = this.get_img_size_url(img); //результат определения подходящей миниатюры

                if (result === 'no need to update') return reject('no need to update'); //если при попытки получить новые размеры миниатюры под эту ширину экрана мы получить в ответ no need to update, то это значит что сейчас используется уже такая же или более лучшая миниатюра чем нужно для текущего размера экрана, так что мы завершаем функцию и сообщаем что уже загружена более лучшая картинка или такая же

                size = result.size;
                url = result.url;
            }

            //ждйм завершения загрузки картинки по url
            this.download_img_tracker(img, url)
                .then(() => {
                    if (is_svg) {
                        img.classList.add('uploaded'); //помечам что картинка загружена
                        img.setAttribute('data-current-size', 'original'); //добавляем чтоб эта картинка больше не отслеживалась при ресайзах
                        this.img_visible_observer.unobserve(img); //т.к. svg картинка одна для всех размеров экрана мы можем убрать её из отслеживания
                    } else {
                        img.classList.add('uploaded'); //если ещё нет пометки о том что картинка загружена помечаем что как минимум одна миниатюра картинки загружена

                        if (size === 'original') {
                            this.img_visible_observer.unobserve(img); //удаляем данный блок картинки из отслеживания т.к. загружен её оригинал
                            img.setAttribute('data-current-size', 'original'); //добавляем чтоб эта картинка больше не отслеживалась при ресайзах
                        }
                    }

                    resolve(url); //успешно загружена для текущей ориентации
                })
                .catch(() => {
                    //ТУТ Я ПЛАНИРУЮ ВТАВЛЯТЬ SVG ИЗ ИКОНОЧНОГО ШРИФТА КОТОРАЯ СООБЩИТ ОБ ОШИБКЕ
                    console.log(`не удалось загрузить url ${url}`);
                    reject('error loading'); //ошибка загрузки
                });
            //ждйм завершения загрузки картинки по url
        });
    }
    //функция начинает загрузку картинки img и верёнет промис о результатах загрузки

    //в случае ошибки загрузки вставляем блок с ошибкой который покажент картинку ошибки загрузки
    async error_img_load(e, img) {
        let loader = img.parentNode.querySelector('.loader');

        if (e === 'error loading') {
            if (loader) {
                //если есть лоадер то ждём пока он не скроется
                loader.style.opacity = '0';
                let sl = window.getComputedStyle(loader);
                await wait(() => sl.opacity, '0');
                loader.remove();
            }

            let div = document.createElement('div');
            div.classList.add('media-load-error');
            img.parentNode.append(div);
            setTimeout(() => (div.style.opacity = '1'), 100); //показываем с небольшой задержкой чтоб блок успел отрендерится
        }
    }
    //в случае ошибки загрузки вставляем блок с ошибкой который покажент картинку ошибки загрузки

    //функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image или через тег img
    //img -  в данном случае это блок div с data-img-type="bg" или теш img с data-img-type="img"
    //type - тип блока картинки img или bg
    async common_img_render(img, type) {
        await this.common_img_loader(img)
            .then(async url => {
                let loader = img.parentNode.querySelector('.loader');

                if (loader) {
                    //если есть лоадер то ждём пока он не скроется
                    loader.style.opacity = '0';
                    let sl = window.getComputedStyle(loader);
                    await wait(() => sl.opacity, '0');
                    loader.remove();
                }

                type === 'bg' ? (img.style.backgroundImage = `url(${url})`) : (img.src = url);

                img.style.opacity = '1';
            })
            .catch(async e => this.error_img_load(e, img)); //в случае ошибки загрузки вставляем блок с ошибкой который покажент картинку ошибки загрузки
    }
    //функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image

    //встваяет svg картинки из svg набора в документ
    async svg_kit_render(img) {
        await this.common_img_loader(img)
            .then(async data => {
                let svg_wrap = document.createElement('div'),
                    nead_id = img.getAttribute('data-kit-nead-id').split(/\s+/); //нужные к выводу части комплекта

                svg_wrap.classList.add('svg-kit-wrap');

                img.getAttribute('data-kit-all-id')
                    .split(/\s+/) //в качестве разделителя берём пробел, который может повторятся от 1 до сколько угодно раз, на случай если мы случайно поставили 2-3 пробеда вместо одного
                    .forEach(id => {
                        let svgNS = 'http://www.w3.org/2000/svg',
                            svg = document.createElementNS(svgNS, 'svg'),
                            use = document.createElementNS(svgNS, 'use');

                        svg.append(use);
                        svg.setAttribute('data-id', id);

                        nead_id.forEach(data_id => {
                            if (data_id === id) svg.style.fill = 'rgba(0, 73, 255, .5)'; //выделяем нужные svg блоки
                        });

                        use.setAttribute('href', data.url + '#' + id);
                        svg_wrap.append(svg);
                    });

                img.parentNode.appendChild(svg_wrap); //вставляем набор нужных svg картинок

                await wait(() => window.getComputedStyle(svg_wrap).display === 'block', true); //ждём пока все динамичсески вставленные svg добавятся в документ т.к. есть микроскопическая задержка

                if (img.parentNode.querySelector('.loader')) await wait(() => img.parentNode.querySelector('.loader'), null); //если есть лоадер дожидаемся пока он не скроется

                if (!img.parentNode.querySelector('.media-load-error')) svg_wrap.style.opacity = '1'; //если в блоке не ошибок то отображаем набор
            })
            .catch(async e => this.error_img_load(e, img)); //в случае ошибки загрузки вставляем блок с ошибкой который покажент картинку ошибки загрузки
    }
    //встваяет svg картинки из svg набора в документ
})();
