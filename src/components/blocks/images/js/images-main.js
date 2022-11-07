import { wait } from '@js-libs/func-kit';
import Loader from '@loader-main-js';

//ПРИМЕЧАНИЕ: тестил скрипт как мог, вроде всё работает корректно
//ВАЖНО: должно быть именно new class чтоб сразу выполнился конструктор который доавит все картинки на отслеживание видимости
const Img_Loader = new (class {
    //инициализатор загрузки картинок
    constructor() {
        let options_observer = {
            threshold: GDS.media.img.percent_img_show_to_load / 100, //показываем только когда элемент виден минимум на n процентов от своего размера
        };

        this.img_visible_observer = new IntersectionObserver(this.img_upload_manager.bind(this), options_observer); //создаём наблюдатель за видимостью элементов на экране

        let timer_resize, //будет хранить таймер отложенной функции для ресайза
            update_observer_images = () => this.add_in_observe(document.querySelectorAll('[data-img-type]:not(.original-size)')); //данная функция добавит в отслеживание элементы которые ещё не

        update_observer_images(); //добаляем все нужные элементы на отслеживание видимости

        //при изменении размеров окна браузера запускаем проверку подходящих размеров для видимых картинок
        window._on('resize_optimize', () => {
            clearTimeout(timer_resize); //удаляем прежний таймаут чтоб отсчёт времени пошёл заново
            timer_resize = setTimeout(() => update_observer_images(), GDS.media.img.resize_delay_load); //если пробыли в данном разрешении достаточно долго запоскаем проверку актуальности размеров картинок
        });
        //при изменении размеров окна браузера запускаем проверку подходящих размеров для видимых картинок

        //при смене ориентации устройства запускаем проверку подходящих размеров для видимых картинок
        window._on('orientation_chenge', () => {
            setTimeout(() => clearTimeout(timer_resize), GDS.media.img.resize_delay_load / 2); //чтоб не было двух вызовов функции проверке при ресайзе и смене ориентации, мы спустя половину времени отведённого на фиксациию ресайза для проверки, удаляем его таймаут чтоб предотвратить лишний вызов
            update_observer_images(); //а сами сразу вызываем проверку актуальности размеров картинок с дальнейшим их отслеживанием в этом размере окна браузера
        });
        //при смене ориентации устройства запускаем проверку подходящих размеров для видимых картинок
    }
    //инициализатор загрузки картинок

    //добаляем все нужные элементы на отслеживание видимости
    add_in_observe(elems) {
        elems.forEach(el => this.img_visible_observer.observe(el));
    }
    //добаляем все нужные элементы на отслеживание видимости

    //удаляем элементы из отслеживания видимости
    //stop_all_load - сообщает о том что нужно так же прервать загрузку всех ещё не загруженых версий этой картинки которые планируются сохранится в кеш
    dellete_from_observe(elems, stop_all_load = true) {
        elems.forEach(el => {
            this.img_visible_observer.unobserve(el);
            if (stop_all_load && el.current_uploads) el.current_uploads.forEach(miniatura_data => miniatura_data.abort_controller.abort()); //прервать загрузку всех ещё не загруженых версий этой картинки которые планируются сохранится в кеш
        });
    }
    //удаляем элементы из отслеживания видимости

    //определяет какой загрузчик нужен для данного блока картинки
    img_upload_manager(entries) {
        //перебираем массив с объектами отслеживаемых элементов
        //ПРИМЕЧАНИЕ: при первой инициализации в этом массиве будут все элементы которые мы добавили к данному наблюдателю, а далее только те видимость которых будет изменяться
        entries.forEach(entrie => {
            //из всех элементов берём только те которые пересекаются с экраном
            if (entrie.isIntersecting) {
                //загружаем картинки только если её блок был на экране минимум GDS.media.img.min_vsible_time
                entrie.target.start_intersecting_timeout_id = setTimeout(() => {
                    //если ещё нет данного свойства у родителя картинки значит мы увидели её впервые и готовмся к её загрузке и отображению
                    //ПРИМЕЧАНИЕ: т.к. этот пункт выполянется один раз при обнаружении нам не важно сколько картинок в этом блоке родителя, т.к. у них всё равно один лоадер, объект которого будет как раз и сохранён сюда
                    if (!entrie.target.parentNode.ksn_loader) entrie.target.parentNode.ksn_loader = new Loader(entrie.target.parentNode.querySelector('.loader')); //сохраняем объект лоадера для этой картинки

                    let dit = entrie.target.getAttribute('data-img-type'); //тип данной картинки, может быть тоько один так что можно вызывать проверки только через if без else if

                    //'img' - для обычных блоков img с одной картинкой вставленной через тег img
                    //'bg' - для обычных блоков div с одной картинкой вставленной через css background-image
                    if (dit === 'img' || dit === 'bg') this.common_img_render(entrie.target, dit); //инициализируем загрузку и отображение картинки

                    //'kit' - svg картинка предстваляющая из себя набор svg блоков к которым можно получить доступ по id
                    if (dit === 'kit') this.svg_kit_render(entrie.target); //инициализируем загрузку и отображение картинки

                    delete entrie.target.start_intersecting_timeout_id; //удаляем свойство за ненадобностью
                }, GDS.media.img.min_vsible_time); //записываем id данного таймаута в свойства элемента entrie.target чтоб потом можно было его отключить если элемент слишком быстро пропал с экрана
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
            need_dpr_width = width * GDS.device.dpr, //требуемая ширина картинки для качественного отображения, с учётом плотности пиксилей
            miniatura_width; //сюда будет записана требуемая ширина миниатюры из списка заданных

        this.img_visible_observer.unobserve(img); //удаляем данную картинку из отслеживания что постоянно не выполянть функцию при сроле когда картинка будет мелькать на экране

        //если картинка svg
        if (ext === '.svg') {
            img.classList.add('original-size'); //помечаем что это оригинал картинки
            return img.getAttribute('data-src'); //возвращаем оригинал картинки, т.к. svg картинка одна для всех размеров
        }
        //если картинка svg

        miniatura_width = GDS.media.img.miniatur_sizes.find((_, index, sizes_list) => need_dpr_width > sizes_list[index - 1] && need_dpr_width * 0.97 <= sizes_list[index] && sizes_list[index] < original_w); //получит подходящую миниатюру, если вернёт undefined значит нужно вернуть оригинал

        if (+img.getAttribute('data-current-size') >= miniatura_width) return 'no need to update'; //если текущей требуемый размер  миниатюры есть и он меньше её уже загруженой версии или равен ей, сообщаем что не нужно обновлять миниатюру

        //нужно вернуть оригинал картинки
        if (!miniatura_width) {
            img.classList.add('original-size'); //помечаем что это оригинал картинки
            img.removeAttribute('data-current-size'); //удаляем атрибут за ненадобностью
            return img.getAttribute('data-src'); //возвращаем оригинал картинки
        }
        //нужно вернуть оригинал картинки

        img.setAttribute('data-current-size', miniatura_width); //записываем для данной картинки её текущий размер

        let data_miniatura_height = Math.round((original_h * miniatura_width) / original_w); //используя пропорцию получаем высоту запрашиваемой миниатюры

        return img.getAttribute('data-src'); //для тестов пока нет миниатюр
        //ПРИМЕЧАНИЕ: в режиме разработки original-size не будет добавляться т.к. мы принудительно выдаём не миниатюру а оригинал

        return url_bez_ext + '-' + miniatura_width + 'x' + data_miniatura_height + ext; //возвращаем расчитаный url для миниатюры wp-content/uploads/2021/03/1-2-2000x702.jpg к примеру
    }
    //получаем адрес миниатюры картинки с учётом ширины картинки на сайте

    //получает на вход url картинки, после чего он создаёт новый объект изображения и мониторит его загрузку или ошибку загрузки в случае если картинка не найдена
    async download_img_tracker(img, url) {
        if (!img.current_uploads) img.current_uploads = []; //если у картинки ещё нет свойства с данными её загрузки, создаём его

        //перебираем все миниатюры данной картинки которые грузятся в данный момент
        img.current_uploads.forEach(item => {
            if (GDS.media.img.min_anyway_load_byte_size && item.download_byte_size >= GDS.media.img.min_anyway_load_byte_size) return; //сначало проверяем установлено ли минимальное количество скачаных байт для загрузки картинки в кеш если есть то смотрим если количество уже загруженых байт больше или равно минимальному байтовому значению для сохранения в кеш, тогда мы не проверяем процент скачки и картинка продолжит загрузку
            if (item.download_percent < GDS.media.img.min_anyway_load_percent) item.abort_controller.abort(); //если процент загрузки миниатюры ниже установленого в настройках GDS.media.img.min_anyway_load_percent минимума то её загрузку мы прерываем
        });

        //объект с данными для загрузки текущей миниатюры
        let current_img_data = {
            abort_controller: new AbortController(), //контролер для прерывания запроса на загрузку картинки по данному url
            url: url, //адрес данной картинки
            download_percent: 0, //нужно задать для download_percent и download_byte_size по 0 чтоб корректно работали сравнения т.к. если новая картинка начнёт грузится раньше чем мы получим первый байт от текущей эти значения будут undefined и это слоамает условие и картинка загрузится в кеш
            download_byte_size: 0,
        };

        img.current_uploads.push(current_img_data); //записываем объект в общий массив данных о текущих загрузкам миниатюр данной картинки

        //отправляем запрос на получение текущей требуемой миниатюры картинки картинки
        await fetch(url, {
            signal: current_img_data.abort_controller.signal, //ставим отслеживание для прерывания запроса
        })
            .then(async response => {
                if (!response.ok) throw 'server-error ' + response.status; //если ответ не в предаелах 200-299 то выбразываем исключение

                let reader = response.body.getReader(), //начинаем считывать поток данных запроса
                    contentLength = +response.headers.get('Content-Length'), //размер картинки в байтах
                    receivedLength = 0; //загруженное количисетво байт, егомы будем увеличивать по мере загрузки

                //будет выполняется до завершения загрузки картинки или прерывания её загрузки
                while (true) {
                    let { done, value } = await reader.read(); //это промис с текущем состояние чтения потока
                    //done - сигнализирет о том что поток закрылся
                    //value - количество загруженных байт
                    if (done) break; //как только поток закрылся прерываем наш бесконечный цыкл
                    receivedLength += value.length; //обновляем количество загруженых байт

                    current_img_data.download_percent = (receivedLength / contentLength) * 100; //записываем в свойства данных о загрузке картинки текущий процент её загрузки
                    current_img_data.download_byte_size = receivedLength; //количество загруженых байт картинки
                    //console.log(`Получено ${current_img_data.download_percent}%`);
                }
                //будет выполняется до завершения загрузки картинки или прерывания её загрузки
            })
            .catch(e => {
                throw { error: e, img: img, url: url }; //передаём ошибку дальше
            }) //обрабатываем ошибки возникшие в ходе загрузки картинки
            //отправляем запрос на получение текущей требуемой миниатюры картинки картинки
            .finally(() => {
                //после того как картинка загружена или её загрузка не удалась, нам тут не важно, удаляем её данные загрузки из общего массива
                img.current_uploads.forEach((item, index, arr) => {
                    if (item.url === url) arr.splice(index, 1); //удаляем из массива объект в котором url соответсвет ожидаемому url данной асинхронной функции
                });
            });
    }
    //получает на вход url картинки, после чего он создаёт новый объект изображения и мониторит его загрузку или ошибку загрузки в случае если картинка не найдена

    //функция начинает загрузку картинки img и верёнет промис о результатах загрузки
    async common_img_loader(img) {
        //делаем проверку через малый интервал времени, если блок всё ещё не загружен после старта его загрузки, то скорее всего содержимое блока берётся не из кеша и пользователю нужно показать лоадер, если содержимое блока загрузилось очень быстро то лоадер показывать не зачем
        setTimeout(() => {
            if (!img.classList.contains('uploaded'))
                img.parentNode.ksn_loader.show().catch(e => {
                    //ПРИМЕЧАНИЕ: в данном случае наши исключения нас не интересуют т.к. они не смогут помещать коду в этом модуле, они нужны если код используется извне для управления состояниями элементов
                    if (typeof e.ksn_message === 'undefined') console.error(e); //если ошибка не наша выводим её в консоль и завершаем функцию, это ошибка могла произойти из-за непридвиденной ошибки в коде
                }); //если содержимое блока всё ещё не загружено то показываем лоадер
        }, GDS.media.img.loader_delay_time);

        let url = this.get_img_size_url(img); //сюда будет записан сгенерированный адрес на миниатюру картинки или на саму картинку в случае с svg

        if (url === 'no need to update') throw { ksn_message: 'no need to update' }; //если при попытки получить новые размеры миниатюры под эту ширину экрана мы получить в ответ no need to update, то это значит что сейчас используется уже такая же или более лучшая миниатюра чем нужно для текущего размера экрана, так что мы завершаем функцию и сообщаем что уже загружена более лучшая картинка или такая же

        await this.download_img_tracker(img, url); //ждём завершения загрузки картинки по url

        if (!img.classList.contains('uploaded')) img.classList.add('uploaded'); //если ещё нет пометки о том что картинка загружена помечаем что как минимум одна миниатюра картинки загружена

        if (!img.getAttribute('src')) return url; //если у картинки ещё не установлен src просто записываем туда текущий url

        if (img.getAttribute('src') === img.getAttribute('data-src')) throw { ksn_message: 'uploaded only on cache' }; //если в атрибуте src уже оригинал картинки, то эту картинку мы просто сохраняем в кеш без отображения

        if (url === img.getAttribute('data-src')) return url; //если загруженная картинка оригинал то мы заменяем ею любую миниатюру в src, т.к. оригинал в любом случае лучше лобой миниатюры

        if (+url.match(/[^\.]+(?:-([0-9]+)x[0-9]+.)/)[1] > +img.getAttribute('src').match(/[^\.]+(?:-([0-9]+)x[0-9]+.)/)[1]) return url; //если загруженая картинка БОЛЬШЕ той что уже есть в src заменяем url на её

        throw { ksn_message: 'uploaded only on cache' }; //если загруженая картинка МЕНЬШЕ той что уже есть в src сохраняем в кеш без отображения
        //это значит что загрузилась картинка меньшего разрешения после того как уже отображена более качественная картинка, это могло произойти если картинка большего размера имеет гораздо меньший вес чем маленькая картинка, чтоб не вставлять более мелкую картинку вместо более качественной просто обрабратываем как исключение
    }
    //функция начинает загрузку картинки img и верёнет промис о результатах загрузки

    //в случае ошибки загрузки вставляем блок с ошибкой который покажент картинку ошибки загрузки
    error_img_load(data) {
        let show_img_error_load_block = async () => {
            //функция скрывает лоадер и показывает картинку ошибки загрузки
            await data.img.parentNode.ksn_loader.hide_and_remove().catch(e => {
                //ПРИМЕЧАНИЕ: в данном случае наши исключения нас не интересуют т.к. они не смогут помещать коду в этом модуле, они нужны если код используется извне для управления состояниями элементов
                if (typeof e.ksn_message === 'undefined') console.error(e); //если ошибка не наша выводим её в консоль и завершаем функцию, это ошибка могла произойти из-за непридвиденной ошибки в коде
            }); //скрываем и удаляем лоадер если он есть

            let div = document.createElement('div');
            div.classList.add('media-load-error');
            data.img.parentNode.append(div);
            data.img.style.visibility = 'hidden'; //скрываем картинку чтоб не было пустых контуров и маленького стандартного значка ошибки загрузки картинки от браузера, а был только наш значёк ошибки
            setTimeout(() => (div.style.opacity = '1'), 100); //показываем с небольшой задержкой чтоб блок успел отрендерится
        };

        //исключение внутри fetch запроса
        if (data.error) {
            if (data.error.name === 'AbortError') return; //'AbortError' - в случае прерывания загрузки ничего не делаем т.к. загрузка скорее всего прервана чтоб загрузить картинку более лучшего качества

            if (data.error.message === 'Failed to fetch') {
                //если не удалось подключится к указанному ресурсу
                console.error(`Не удалось подключится к ресурсу ${data.url}\n Ошибка: ${data.error.message}`); //выводим ошибку в консоль
                show_img_error_load_block();
                return;
            }

            if (typeof data.error === 'string' && data.error.includes('server-error')) {
                //получили код ответа из серии 4xx или 5xx
                console.error(`Не удалось загрузить картинку по адресу ${data.url}\n Ошибка: ${data.error}`); //выводим ошибку в консоль
                show_img_error_load_block();
                return;
            }

            console.error(data.error); //выводим все оставшиеся не наши ошибки, которые произошли внутри fetch, в консоль
        }
        //исключение внутри fetch запроса

        if (typeof data.ksn_message === 'undefined') return console.error(data); //выводим все оставшиеся не наши ошибки в консоль
    }
    //в случае ошибки загрузки вставляем блок с ошибкой который покажент картинку ошибки загрузки

    //функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image или через тег img
    //img -  в данном случае это блок div с data-img-type="bg" или теш img с data-img-type="img"
    //type - тип блока картинки img или bg
    async common_img_render(img, type) {
        await this.common_img_loader(img)
            .then(async url => {
                await img.parentNode.ksn_loader.hide_and_remove().catch(async e => {
                    //ПРИМЕЧАНИЕ: в данном случае наши исключения нас не интересуют т.к. они не смогут помещать коду в этом модуле, они нужны если код используется извне для управления состояниями элементов
                    if (typeof e.ksn_message === 'undefined') console.error(e); //если ошибка не наша выводим её в консоль и завершаем функцию, это ошибка могла произойти из-за непридвиденной ошибки в коде
                }); //скрываем и удаляем лоадер если он есть

                type === 'bg' ? (img.style.backgroundImage = `url(${url})`) : (img.src = url); //вставляем картинку

                img.style.opacity = '1'; //показываем картинку
            })
            .catch(e => this.error_img_load(e)); //обрабатываем ошибки произошедшие в ходе загрузки картинки
    }
    //функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image

    //встваяет svg картинки из svg набора в документ
    async svg_kit_render(img) {
        await this.common_img_loader(img)
            .then(async url => {
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

                        use.setAttribute('href', url + '#' + id);
                        svg_wrap.append(svg);
                    });

                img.parentNode.appendChild(svg_wrap); //вставляем набор нужных svg картинок

                let sl = window.getComputedStyle(svg_wrap);

                await wait(() => sl.display === 'block', true); //ждём пока все динамичсески вставленные svg добавятся в документ т.к. есть микроскопическая задержка

                await wait(() => img.parentNode.querySelector('.loader'), null); //если есть лоадер дожидаемся пока он не скроется

                svg_wrap.style.opacity = '1'; //отображаем набор
            })
            .catch(e => this.error_img_load(e)); //обрабатываем ошибки произошедшие в ходе загрузки картинки
    }
    //встваяет svg картинки из svg набора в документ
})();

export { Img_Loader };
