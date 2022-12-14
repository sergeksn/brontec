import { wait } from '@js-libs/func-kit';
import Loader from '@loader-main-js';

let img_visible_observer = new IntersectionObserver(check_img_visibility, {
        threshold: GDS.media.img.percent_img_show_to_load / 100, //показываем только когда элемент виден минимум на n процентов от своего размера
    }), //создаём наблюдатель за видимостью элементов на экране
    timer_resize; //будет хранить таймер отложенной функции для ресайза

update_observer_images(); //добаляем все нужные элементы на отслеживание видимости

//при изменении размеров окна браузера запускаем проверку подходящих размеров для видимых картинок
w._on('resize_optimize', () => {
    clearTimeout(timer_resize); //удаляем прежний таймаут чтоб отсчёт времени пошёл заново
    timer_resize = setTimeout(() => update_observer_images(), GDS.media.img.resize_delay_load); //если пробыли в данном разрешении достаточно долго запоскаем проверку актуальности размеров картинок
});
//при изменении размеров окна браузера запускаем проверку подходящих размеров для видимых картинок

//при смене ориентации устройства запускаем проверку подходящих размеров для видимых картинок
w._on('orientation_chenge', () => {
    setTimeout(() => clearTimeout(timer_resize), GDS.media.img.resize_delay_load / 2); //чтоб не было двух вызовов функции проверке при ресайзе и смене ориентации, мы спустя половину времени отведённого на фиксациию ресайза для проверки, удаляем его таймаут чтоб предотвратить лишний вызов
    update_observer_images(); //а сами сразу вызываем проверку актуальности размеров картинок с дальнейшим их отслеживанием в этом размере окна браузера
});
//при смене ориентации устройства запускаем проверку подходящих размеров для видимых картинок

//данная функция добавит в отслеживание элементы которые ещё не
function update_observer_images() {
    add_in_observe(qsa('[data-img-type]:not(.original-size)'));
}
//данная функция добавит в отслеживание элементы которые ещё не

//добаляем все нужные элементы на отслеживание видимости
function add_in_observe(elems) {
    elems.forEach(el => img_visible_observer.observe(el));
}
//добаляем все нужные элементы на отслеживание видимости

//удаляем элементы из отслеживания видимости
//stop_all_load - сообщает о том что нужно так же прервать загрузку всех ещё не загруженых версий этой картинки которые планируются сохранится в кеш
function dellete_from_observe(elems, stop_all_load = true) {
    elems.forEach(el => {
        img_visible_observer.unobserve(el);
        if (stop_all_load && el.current_uploads) el.current_uploads.forEach(miniatura_data => miniatura_data.abort_controller.abort()); //прервать загрузку всех ещё не загруженых версий этой картинки которые планируются сохранится в кеш
    });
}
//удаляем элементы из отслеживания видимости

//определяет какие картинки видны и достаточно ли долго видны, и если всё удовлетворяет условиям видимости инициализирует её загрузку
function check_img_visibility(entries) {
    //перебираем массив с объектами отслеживаемых элементов
    //ПРИМЕЧАНИЕ: при первой инициализации в этом массиве будут все элементы которые мы добавили к данному наблюдателю, а далее только те видимость которых будет изменяться
    entries.forEach(entrie => {
        let img = entrie.target; //картинка видимость которой отслеживаем

        //из всех элементов берём только те которые пересекаются с экраном
        if (entrie.isIntersecting) {
            //загружаем картинки только если её блок был на экране минимум GDS.media.img.min_vsible_time
            img.start_intersecting_timeout_id = setTimeout(() => img_upload_manager(img), GDS.media.img.min_vsible_time); //записываем id данного таймаута в свойства элемента img чтоб потом можно было его отключить если элемент слишком быстро пропал с экрана
        }
        //из всех элементов берём только те которые пересекаются с экраном

        //если пересечние перешло в состояние не пересечения, т.е. элемент либо был за пределами root или в процессе вышел за его пределы, в нашем случае ушёл за границы видимой части экрана
        else {
            if (img.start_intersecting_timeout_id) {
                clearTimeout(img.start_intersecting_timeout_id);
                delete img.start_intersecting_timeout_id;
            }
        }
        //если пересечние перешло в состояние не пересечения
    });
    //перебираем массив с объектами отслеживаемых элементов
}
//определяет какие картинки видны и достаточно ли долго видны, и если всё удовлетворяет условиям видимости инициализирует её загрузку

//определяет какой загрузчик нужен для данного блока картинки
function img_upload_manager(img) {
    //если ещё нет данного свойства у родителя картинки значит мы увидели её впервые и готовмся к её загрузке и отображению
    //ПРИМЕЧАНИЕ: т.к. этот пункт выполянется один раз при обнаружении нам не важно сколько картинок в этом блоке родителя, т.к. у них всё равно один лоадер, объект которого будет как раз и сохранён сюда
    if (!img.parentNode.ksn_loader) img.parentNode.ksn_loader = new Loader(qs('.loader', img.parentNode)); //сохраняем объект лоадера для этой картинки

    let dit = img.getAttribute('data-img-type'); //тип данной картинки, может быть тоько один так что можно вызывать проверки только через if без else if

    //'img' - для обычных блоков img с одной картинкой вставленной через тег img
    //'bg' - для обычных блоков div с одной картинкой вставленной через css background-image
    if (dit === 'img' || dit === 'bg') common_img_render(img, dit); //инициализируем загрузку и отображение картинки

    //'overlay-img' - для обычных блоков img с одной картинкой вставленной через тег img
    //'overlay-bg' - для обычных блоков div с одной картинкой вставленной через css background-image
    if (dit === 'overlay-img' || dit === 'overlay-bg') overlay_img_render(img, dit); //инициализируем загрузку и отображение картинки которая является наложением для другой

    //'img-swiper-loop' - для обычных блоков img с одной картинкой вставленной через тег img которые являются сладйами сладера swiper с включённым циклом бесконечной прокрутки
    //'bg-swiper-loop' - для обычных блоков div с одной картинкой вставленной через css background-image которые являются сладйами сладера swiper с включённым циклом бесконечной прокрутки
    if (dit === 'img-swiper-loop' || dit === 'bg-swiper-loop') swiper_looped_img_render(img, dit); //инициализируем загрузку и отображение картинки которая являются слайдом сладера swiper с включённым циклом бесконечной прокрутки

    //'kit' - svg картинка предстваляющая из себя набор svg блоков к которым можно получить доступ по id
    if (dit === 'kit') svg_kit_render(img); //инициализируем загрузку и отображение картинки

    delete img.start_intersecting_timeout_id; //удаляем свойство за ненадобностью
}
//определяет какой загрузчик нужен для данного блока картинки

//получаем адрес миниатюры картинки с учётом ширины картинки на сайте
//img - картинка или блок фоном которого является картинка
function get_img_size_url(img) {
    let data_src = img.getAttribute('data-src'), //путь к оригиналу картинки
        ext = data_src.match(/\.{1}([a-zA-Z]+)$/)[0], //расширение картинки в вормате .jpg С ТОЧКОЙ !!!
        url_bez_ext = data_src.replace(ext, ''), //адрес картинки без расширения файла и точки перед ним
        original_w = +img.getAttribute('data-original-w'), //ширина оригинальной картинки в px
        original_h = +img.getAttribute('data-original-h'), //высота оригинальной картинки в px
        width = parseFloat(w.getComputedStyle(img).width), //целочисленно значение ширины отведённое под картинку
        need_dpr_width = width * GDS.device.dpr, //требуемая ширина картинки для качественного отображения, с учётом плотности пиксилей
        miniatura_width; //сюда будет записана требуемая ширина миниатюры из списка заданных

    img_visible_observer.unobserve(img); //удаляем данную картинку из отслеживания что постоянно не выполянть функцию при сроле когда картинка будет мелькать на экране

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
async function download_img_tracker(img, url) {
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

//функция принудительной закгрузки картинки даже если её ещё не видно на экране
function forced_download(img) {
    img_upload_manager(img);
}
//функция принудительной закгрузки картинки даже если её ещё не видно на экране

//функция начинает загрузку картинки img и верёнет промис о результатах загрузки
async function common_img_loader(img) {
    setTimeout(() => !img.classList.contains('uploaded') && img.parentNode.ksn_loader.show(), GDS.media.img.loader_delay_time); //делаем проверку через малый интервал времени, если блок всё ещё не загружен после старта его загрузки, то скорее всего содержимое блока берётся не из кеша и пользователю нужно показать лоадер если он есть и разрешён его показ, если содержимое блока загрузилось очень быстро то лоадер показывать не зачем

    let url = get_img_size_url(img); //сюда будет записан сгенерированный адрес на миниатюру картинки или на саму картинку в случае с svg

    if (url === 'no need to update') throw { ksn_message: 'no need to update' }; //если при попытки получить новые размеры миниатюры под эту ширину экрана мы получить в ответ no need to update, то это значит что сейчас используется уже такая же или более лучшая миниатюра чем нужно для текущего размера экрана, так что мы завершаем функцию и сообщаем что уже загружена более лучшая картинка или такая же

    await download_img_tracker(img, url); //ждём завершения загрузки картинки по url

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
function error_img_load(data) {
    //функция скрывает лоадер и показывает картинку ошибки загрузки
    let show_img_error_load_block = async () => {
        await data.img.parentNode.ksn_loader.hide_and_remove(); //скрываем и удаляем лоадер если он есть

        let div = d.createElement('div');
        div.classList.add('media-load-error');
        data.img.parentNode.append(div);
        data.img.style.visibility = 'hidden'; //скрываем картинку чтоб не было пустых контуров и маленького стандартного значка ошибки загрузки картинки от браузера, а был только наш значёк ошибки
        setTimeout(() => (div.style.opacity = '1'), 100); //показываем с небольшой задержкой чтоб блок успел отрендерится
    };
    //функция скрывает лоадер и показывает картинку ошибки загрузки

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

        return console.error(data.error); //выводим все оставшиеся не наши ошибки, которые произошли внутри fetch, в консоль
    }
    //исключение внутри fetch запроса

    if (typeof data.ksn_message === 'undefined') return console.error(data); //выводим все оставшиеся не наши ошибки в консоль
}
//в случае ошибки загрузки вставляем блок с ошибкой который покажент картинку ошибки загрузки

//функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image или через тег img
//img -  в данном случае это блок div с data-img-type="bg" или теш img с data-img-type="img"
//type - тип блока картинки img или bg
async function common_img_render(img, type) {
    await common_img_loader(img)
        .then(async url => {
            await img.parentNode.ksn_loader.hide_and_remove(); //скрываем и удаляем лоадер если он есть

            type === 'bg' ? (img.style.backgroundImage = `url(${url})`) : (img.src = url); //вставляем картинку

            img.style.opacity = '1'; //показываем картинку
        })
        .catch(e => error_img_load(e)); //обрабатываем ошибки произошедшие в ходе загрузки картинки
}
//функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image

//функция для загрузки картинок которые являются наложенными, т.е. показываются поверх основыной картинки и нам нужно их показывать не раньше чем загрузится основоная картинка
async function overlay_img_render(img, type) {
    await common_img_loader(img)
        .then(async url => {
            type === 'overlay-bg' ? (img.style.backgroundImage = `url(${url})`) : (img.src = url); //вставляем картинку

            await wait(() => qs('[data-main]', img.parentNode).classList.contains('uploaded'), true); //ждём пока не загрузится основная картинка

            img.style.opacity = '1'; //показываем картинку
        })
        .catch(e => error_img_load(e)); //обрабатываем ошибки произошедшие в ходе загрузки картинки
}
//функция для загрузки картинок которые являются наложенными, т.е. показываются поверх основыной картинки и нам нужно их показывать не раньше чем загрузится основоная картинка

//функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image или через тег img в сладйере swiper с бесконечным циклом прокрутки
//ПРИМЕЧАНИЕ: к этому моменту все слайды этого слайдера должы быть добавлены для отслеживания
//свайпер создаёт несколько дубликатов картинки для корректной работы зацикленности и присваевает дубликатам одинаковые data-swiper-slide-index по которым мы находим дубликаты и инициализируем их загрузку
async function swiper_looped_img_render(img, type) {
    await common_img_loader(img)
        .then(async url => {
            await img.parentNode.ksn_loader.hide_and_remove(); //скрываем и удаляем лоадер если он есть

            type === 'bg-swiper-loop' ? (img.style.backgroundImage = `url(${url})`) : (img.src = url); //вставляем картинку

            img.style.opacity = '1'; //показываем картинку

            let parent_search = (el, search_class) => {
                    //функция для поиска родителя элемента с нужным классом
                    let parent = el.parentNode;
                    return parent.classList.contains(search_class) ? parent : parent_search(parent, search_class);
                },
                slide = parent_search(img, 'swiper-slide'), //текущий слайд для которого грузим картинку
                slide_index = slide.getAttribute('data-swiper-slide-index'), //индекс этого слайда в swiper
                swiper_wrap = parent_search(slide, 'swiper-wrapper'), //оболочка слайдов
                slide_dublicat = [...qsa('[data-swiper-slide-index="' + slide_index + '"]', swiper_wrap)].filter(el => el !== slide); //добликаты для данного слайда созданные свайпером для корректной работы цыкла

            //перебираем все дубликаты картинки
            slide_dublicat.forEach(el => {
                let img = qs('[data-img-type]:not(.uploaded)', el); //чтоб избежать ненужных повторений нам нужны только те дубликаты которые ещё не были загружены
                img && forced_download(img); //если данный дубликат ещё не был загружен запускаем его принудитеьную загрузку
            });
        })
        .catch(e => error_img_load(e)); //обрабатываем ошибки произошедшие в ходе загрузки картинки
}
//функция для загрузки картинок из блоков где всего одна картинка, вставленная через css background-image или через тег img в сладйере swiper с бесконечным циклом прокрутки

//встваяет svg картинки из svg набора в документ
async function svg_kit_render(img) {
    await common_img_loader(img)
        .then(async url => {
            let svg_wrap = d.createElement('div'),
                nead_id = img.getAttribute('data-kit-nead-id').split(/\s+/); //нужные к выводу части комплекта

            svg_wrap.classList.add('svg-kit-wrap');

            img.getAttribute('data-kit-all-id')
                .split(/\s+/) //в качестве разделителя берём пробел, который может повторятся от 1 до сколько угодно раз, на случай если мы случайно поставили 2-3 пробеда вместо одного
                .forEach(id => {
                    let svgNS = 'http://www.w3.org/2000/svg',
                        svg = d.createElementNS(svgNS, 'svg'),
                        use = d.createElementNS(svgNS, 'use');

                    svg.append(use);
                    svg.setAttribute('data-id', id);

                    nead_id.forEach(data_id => {
                        if (data_id === id) svg.style.fill = 'rgba(0, 73, 255, .5)'; //выделяем нужные svg блоки
                    });

                    use.setAttribute('href', url + '#' + id);
                    svg_wrap.append(svg);
                });

            img.parentNode.appendChild(svg_wrap); //вставляем набор нужных svg картинок

            let sl = w.getComputedStyle(svg_wrap);

            await wait(() => sl.display === 'block', true); //ждём пока все динамичсески вставленные svg добавятся в документ т.к. есть микроскопическая задержка

            await wait(() => qs('[data-main]', img.parentNode).classList.contains('uploaded'), true); //ждём пока не загрузится основная картинка

            svg_wrap.style.opacity = '1'; //отображаем набор
        })
        .catch(e => error_img_load(e)); //обрабатываем ошибки произошедшие в ходе загрузки картинки
}
//встваяет svg картинки из svg набора в документ

export { add_in_observe, dellete_from_observe };
