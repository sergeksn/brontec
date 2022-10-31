import { wait } from '@js-libs/func-kit';
import 'intersection-observer'; //полифил IntersectionObserver и IntersectionObserverEntry

const Img_Loader = new (class {
    //инициализатор загрузки картинок
    constructor() {
        let options_observer = {
            threshold: 0.1, //показываем только когда элемент виден минимум на n процентов от своего размера
        };

        this.img_visible_observer = new IntersectionObserver(this.img_upload_manager.bind(this), options_observer); //создаём наблюдатель за видимостью элементов на экране

        this.add_in_observe(document.querySelectorAll('[data-img-type]')); //добаляем все нужные элементы на отслеживание видимости

        //проверяем видимость картинок при смене ориентации
        //ПРИМЕЧАНИЕ: IntersectionObserver срабатывает при смене ориентации если в инструментах разработчика явно установить мобильную марку, так что на всякий случай сделаем кастомную проверку при смене ориентации в дополнее к имеющейся
        //проблема в том что при смене ориентации само по себе событие в IntersectionObserver не срабатывает даже если после смены ориентации стали видны картинки которые ранее были скрыты, так что мы делам так, мы занем что в момент инициализации объекта IntersectionObserver он сразу же проверяет какие из переданных блоков видны, тем самым мы инициализирыем временный IntersectionObserver, а после того как он пробежится по всем элемента удаляем его
        window._on('orientation_chenge', async () => {
            let temporary = new IntersectionObserver(entries => {
                this.img_upload_manager.bind(this)(entries); //выполянем проверку на видимые изображения
                temporary.disconnect(); // после того как пробежались по все картинкам для отслеживания отключаем временный IntersectionObserver
            }, options_observer); //создаём временный наблюдатель за видимостью элементов на экране

            let current_orientation = GDS.device.orientation;

            document.querySelectorAll(`[data-img-type]:not(.${current_orientation}-started-loaded):not(.${current_orientation}-uploaded):not(.${current_orientation}-no-nead-loaded):not(.started-loaded):not(.uploaded)`).forEach(el => temporary.observe(el)); //добавляем все элементы на отслеживания видимости во временный IntersectionObserver, ВАЖНО добавляем именно те элементы которые ещё не загружены и не начали загрузку для текущей ориентации, а так же исключая те которые не нужно загружать для текущей ориентации, например в случае если уже загружена картинка более лучего качества в другой ориентации
        }); //проверяем видимость картинок при смене ориентации
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

        if (miniatura_width >= original_w) miniatura_width = 'original'; //если ширина запрашиваемой миниатюры больше или равно ширине оригинальной картинки

        let current_size = img.getAttribute('data-current-size'); //атрибут инфурмирующий о том какой размер (ширина) был задан дял картинки в иной ориентации

        //если размер для противоположной ориентации уже был задан
        //мы должны сравнить больше или меньше текущий предлагаемый размер картинки чтоб в случае если нужно более лучшее качество загрузить его, а если нужно меньше то оставить текущую картинку
        if (current_size === 'original' || +current_size >= miniatura_width) return 'no need to update'; //если размер текущей картинку меньше её оригинал, или текущий размер миниатюры такой же как и тот что мы хотим сейчас установить то завершаем функцию

        img.setAttribute('data-current-size', miniatura_width); //записываем для данной картинки её текущий размер

        if (miniatura_width === 'original')
            return {
                url: data_src, //если требуемая картинка оригинал то мы возвращаем ссылку на нё
                size: miniatura_width,
            };

        let data_miniatura_height = Math.round((original_h * miniatura_width) / original_w); //используя пропорцию получаем высоту запрашиваемой миниатюры

        return {
            url: img.getAttribute('data-src'), //для тестов пока нет миниатюр
            //url: url_bez_ext + '-' + miniatura_width + 'x' + data_miniatura_height + ext, //возвращаем расчитаный url для миниатюры wp-content/uploads/2021/03/1-2-2000x702.jpg к примеру
            size: miniatura_width,
        };
    }
    //получаем адрес миниатюры картинки с учётом ширины картинки на сайте

    //получает на вход url картинки, после чего он создаёт новый объект изображения и мониторит его загрузку или ошибку загрузки в случае если картинка не найдена
    download_img_tracker(url) {
        return new Promise((resolve, reject) => {
            let img = new Image();

            img.onload = () => resolve();

            img.onerror = () => reject();

            img.src = url;
        });
    }
    //получает на вход url картинки, после чего он создаёт новый объект изображения и мониторит его загрузку или ошибку загрузки в случае если картинка не найдена

    //функция начинает загрузку картинки img и верёнет промис о результатах загрузки
    common_img_loader(img) {
        return new Promise((resolve, reject) => {
            let current_orientation = GDS.device.orientation, //ориетация устройства в момент начала загрузки
                search_classes = [`${current_orientation}-started-loaded`, `${current_orientation}-uploaded`, `${current_orientation}-no-nead-loaded`, 'started-loaded', 'uploaded']; //список классов которые сигнализируют о том что дальнейшие операции нужно прервать так какртинка уже загружена или впроцессе загрузки, в случае НЕ SVG загружена для текущей ориентации

            if ([...img.classList].some(className => search_classes.includes(className))) return reject('no nead'); //проверяем если среди классов img классы из search_classes, если есть хоть один из них то прерываем функцию и сообщаем что для данной ориентации картинка уже загружена или в процесе загрузки или не должна загружаться

            let loader = img.parentNode.querySelector('.loader'); //лоадер

            //если есть лоадер и картинка ещё не была загружена ни в одной из ориентаций
            if (loader && ![...img.classList].some(className => [`portrait-uploaded`, `landscape-uploaded`, 'uploaded'].includes(className))) {
                setTimeout(() => {
                    //делаем проверку через ималый интервал времени, если картинка всё ещё не загружена после старта её загрузки, то скорее всего картинка берётся не из кеша и пользователю нужно показать лоадер, если картинка загрузилась очень быстро то лоадер показывать не зачем
                    if (![...img.classList].some(className => [`portrait-uploaded`, `landscape-uploaded`, 'uploaded'].includes(className))) loader.style.display = 'flex'; //показываем лоадер мгновенно
                }, GDS.media.img.loader_delay_time);
            }
            //если есть лоадер и картинка ещё не была загружена ни в одной из ориентаций

            let is_svg = img.getAttribute('data-src').match(/\.{1}([a-zA-Z]+)$/)[1] === 'svg', //указывает svg картинка или нет
                size, //запишем сюда размер миниатюры для текущей ориентации
                url; //сюда будет записан сгенерированный адрес на миниатюру картинки или на саму картинку в случае с svg

            if (is_svg) {
                url = img.getAttribute('data-src');
                img.classList.add('started-loaded'); //помечаем что загрузка данной картинки началась
            } else {
                let result = this.get_img_size_url(img); //результат определения подходящей миниатюры

                //актуально только для НЕ SVG картинок, если запрос url get_img_size_url вернул строку "no need to update", значит миниатюра в новой ориентации не лучше по качеству чем текущая и нам не нужно её загружать, в связи с этим мы помечаем что данная картинка закгружена и для этой ориентации соответственными класами и удаляем данный элемент из отслеживания видимости
                if (result === 'no need to update') {
                    img.classList.add(`${current_orientation}-no-nead-loaded`); //помечаем что загружать картинку в данной ориентации не нужно так как загружена уже более качественная картинка при другой ориентации
                    this.img_visible_observer.unobserve(img); //удаляем данный блок картинки из отслеживания
                    return reject('better loaded'); //завершаем функцию и сообщаем что для даннйо ориентации уже загружена более лучшая картинка
                }

                size = result.size;
                url = result.url;
                img.classList.add(`${current_orientation}-started-loaded`); //помечаем что загрузка данной картинки для данной ориентации началась чтоб не начинать её грузить снова и снова пока она всё ещё не загружена
            }

            //ждйм завершения загрузки картинки по url
            this.download_img_tracker(url)
                .then(() => {
                    if (is_svg) {
                        img.classList.add('uploaded');
                        img.classList.remove('started-loaded'); //в зависимости от формата картинки добавляем нужные классы загрузки и удаляем класс процесса загрзки
                        this.img_visible_observer.unobserve(img); //т.к. svg картинке на важна ориентация, она масштабируется, убираем отслеживание видимости текущейго блока картинки
                    } else {
                        img.classList.add(`${current_orientation}-uploaded`);
                        img.classList.remove(`${current_orientation}-started-loaded`); //в зависимости от формата картинки добавляем нужные классы загрузки и удаляем класс процесса загрзки

                        //если для данной ориентаци уже загружен оригинал картинки то не нужно ничего грузить в другой ориентации
                        if (size === 'original') {
                            let next_orientation = current_orientation === 'landscape' ? 'portrait' : 'landscape'; //определяем следующую ориентацию
                            img.classList.add(`${next_orientation}-no-nead-loaded`); //помечаем что в следующей ориентации ничего не нужно грузить
                            this.img_visible_observer.unobserve(img); //удаляем данный блок картинки из отслеживания
                        }

                        if (['portrait-uploaded', 'landscape-uploaded'].every(className => [...img.classList].includes(className))) this.img_visible_observer.unobserve(img); //если картинка была загружена во всех ориентация то можем удалить её из наблюдателя за видимостью элементов
                    }

                    resolve({ url: url, size: size, is_svg: is_svg }); //успешно загружена для текущей ориентации
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
            .then(async data => {
                //ПРИМЕЧАНИЕ: != тут сравнивает только занчение без типов т.к. может быть строка original вместо цифрового значения
                if (!data.is_svg && img.getAttribute('data-current-size') != data.size) return; //на случай если вдруг картинка с меньшем разрешением будет весить больше той что больше по разрешению и как следствияе после быстрой смены ориентации загрузится позже чем картинка с лучшим разрешением. Именно в этом случае мы и делаем эту проверку чтоб не вставить картинку с более худшим разрешением

                let loader = img.parentNode.querySelector('.loader');

                if (loader) {
                    //если есть лоадер то ждём пока он не скроется
                    loader.style.opacity = '0';
                    let sl = window.getComputedStyle(loader);
                    await wait(() => sl.opacity, '0');
                    loader.remove();
                }

                type === 'bg' ? (img.style.backgroundImage = `url(${data.url})`) : (img.src = data.url);

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
                            if (data_id === id) svg.style.fill = 'rgba(0, 73, 255, .5)';//выделяем нужные svg блоки
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

export { Img_Loader };
