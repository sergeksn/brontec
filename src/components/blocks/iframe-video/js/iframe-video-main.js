import Loader from '@loader-main-js';

let visible_observer = new IntersectionObserver(check_visibility, {
    threshold: GDS.media.video_frames.percent_frame_show_to_load / 100, //показываем только когда элемент виден минимум на n процентов от своего размера
}); //создаём наблюдатель за видимостью элементов на экране

qsa('.iframe-video').forEach(el => visible_observer.observe(el)); //добавляем все фреймы на отслеживание видимости

//проверяет видимость фреймов
function check_visibility(entries) {
    //перебираем массив с объектами отслеживаемых элементов
    //ПРИМЕЧАНИЕ: при первой инициализации в этом массиве будут все элементы которые мы добавили к данному наблюдателю, а далее только те видимость которых будет изменяться
    entries.forEach(entrie => {
        let frame_wrap = entrie.target; //оболочка фрейма видимость которой отслеживаем

        //из всех элементов берём только те которые пересекаются с экраном
        if (entrie.isIntersecting) {
            //загружаем фрейм только если его блок был на экране минимум GDS.media.video_frames.min_vsible_time
            frame_wrap.start_intersecting_timeout_id = setTimeout(() => {
                visible_observer.unobserve(frame_wrap); //удаляем данный фрейм из отслеживания видимости
                render_preview(frame_wrap);
            }, GDS.media.video_frames.min_vsible_time);
        }
        //из всех элементов берём только те которые пересекаются с экраном

        //если пересечние перешло в состояние не пересечения, т.е. элемент либо был за пределами root или в процессе вышел за его пределы, в нашем случае ушёл за границы видимой части экрана
        else {
            if (frame_wrap.start_intersecting_timeout_id) {
                clearTimeout(frame_wrap.start_intersecting_timeout_id);
                delete frame_wrap.start_intersecting_timeout_id;
            }
        }
        //если пересечние перешло в состояние не пересечения
    });
    //перебираем массив с объектами отслеживаемых элементов
}
//проверяет видимость фреймов

//создаём каркас из картинки превью видео чтоб пользователь мог нажать для запуска видео, но видео не грузилось по умолчанию
async function render_preview(wrap) {
    let video_id = wrap.dataset.videoId, //id видео
        preview_img = new Image(),
        platform = wrap.dataset.videoPlatform,
        preview_src = GDS.host_url + '/wp-content/themes/serge_produkt/get_video_priview/placeholder.svg',
        error_load = false;

    switch (platform) {
        case 'rutube':
            try {
                const response = await fetch(GDS.host_url + '/wp-content/themes/serge_produkt/get_video_priview/get_video_preview.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ video_id: video_id, platform: platform }),
                });

                const data = await response.json();
                if (data.thumbnail_url) {
                    let width_preview = wrap.offsetWidth * GDS.device.dpr;
                    preview_src = data.thumbnail_url + '?width=' + width_preview;
                } else {
                    console.error('Ошибка:', data.error);
                    error_load = true;
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
                error_load = true;
            }

            break;
        case 'youtube':
            preview_src = 'https://i.ytimg.com/vi/' + video_id + '/maxresdefault.jpg'; //адрес превьюшки
            break;
    }

    preview_img.src = preview_src;

    //после загрузки картинки
    preview_img.onload = async () => {
        await wrap.ksn_loader.hide_and_remove(); //скрываем и удаляем лоадер если он есть
        qs('.iframe-video__poster-img', wrap).append(preview_img); //добавляем картнку почтера
        wrap.classList.add('uploaded-poster'); //показываем картинку постера с кнопкой

        if (error_load) wrap.classList.add('logo-poster'); //помечаем что постер не загружен и вмсето него установлен логотип
    };
    //после загрузки картинки

    wrap.ksn_loader = new Loader(qs('.loader', wrap)); //записываем в свойства оболочки объект его лоадера

    setTimeout(() => !wrap.classList.contains('uploaded-poster') && wrap.ksn_loader.show(), GDS.media.img.loader_delay_time); //если превьюшка не загрузилась за время GDS.media.img.loader_delay_time значит мы должны показать лоадер

    qs('.iframe-video__poster', wrap)._on('click', render_frame.bind(null, wrap));

    delete wrap.start_intersecting_timeout_id; //удаляем свойство за ненадобностью
}
//создаём каркас из картинки превью видео чтоб пользователь мог нажать для запуска видео, но видео не грузилось по умолчанию

//создаёт и вставляет фрейм в документ
function render_frame(wrap) {
    let video_id = wrap.dataset.videoId, //id видео на ютубе
        platform = wrap.dataset.videoPlatform,
        iframe = d.createElement('iframe'); //создаём фрейм

    switch (platform) {
        case 'rutube':
            iframe.setAttribute('allow', 'clipboard-write; autoplay');
            iframe.webkitAllowFullScreen = true;
            iframe.mozallowfullscreen = true;
            iframe.allowFullScreen = true;
            iframe.setAttribute('src', 'https://rutube.ru/play/embed/' + video_id + '/');
            break;
        case 'youtube':
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
            iframe.setAttribute('src', 'https://www.youtube.com/embed/' + video_id + '?autoplay=1&rel=0');
            break;
    }

    qs('.iframe-video__poster', wrap).remove(); //удаляем постер
    qs('.iframe-video__player', wrap).append(iframe); //вставляем фрейм в документ

    iframe.onload = () => {
        iframe.contentWindow.postMessage(JSON.stringify({ type: 'player:play' }), '*');
    };
}
//создаёт и вставляет фрейм в документ
