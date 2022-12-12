import Loader from '@loader-main-js';

new (class {
    constructor() {
        let options_observer = {
            threshold: GDS.media.video_frames.percent_frame_show_to_load / 100, //показываем только когда элемент виден минимум на n процентов от своего размера
        };

        this.visible_observer = new IntersectionObserver(this.check_visibility.bind(this), options_observer); //создаём наблюдатель за видимостью элементов на экране

        d.querySelectorAll('.iframe-youtube').forEach(el => this.visible_observer.observe(el)); //добавляем все фреймы на отслеживание видимости
    }

    //проверяет видимость фреймов
    check_visibility(entries) {
        //перебираем массив с объектами отслеживаемых элементов
        //ПРИМЕЧАНИЕ: при первой инициализации в этом массиве будут все элементы которые мы добавили к данному наблюдателю, а далее только те видимость которых будет изменяться
        entries.forEach(entrie => {
            let frame_wrap = entrie.target; //оболочка фрейма видимость которой отслеживаем

            //из всех элементов берём только те которые пересекаются с экраном
            if (entrie.isIntersecting) {
                //загружаем фрейм только если его блок был на экране минимум GDS.media.video_frames.min_vsible_time
                frame_wrap.start_intersecting_timeout_id = setTimeout(() => {
                    this.visible_observer.unobserve(frame_wrap); //удаляем данный фрейм из отслеживания видимости

                    this.render_frame(frame_wrap), GDS.media.video_frames.min_vsible_time; //записываем id данного таймаута в свойства элемента frame_wrap чтоб потом можно было его отключить если элемент слишком быстро пропал с экрана
                });
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

    //создаёт и вставляет фрейм в документ
    render_frame(wrap) {
        let src = wrap.querySelector('[data-src]').getAttribute('data-src') + '?rel=0',//ссылка на видео с доп параметром чтоб не показывалась сетка из похожих видео в конце ролика
            iframe = d.createElement('iframe');//создаём фрейм

        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
        iframe.setAttribute('allowFullScreen', '');
        iframe.setAttribute('src', src);

        iframe.ksn_loader = new Loader(wrap.querySelector('.loader'));//записываем в свойства фрейма объект его лоадера

        iframe.onload = () => this.loaded_frame(iframe); //для фреймов onload сработает как для успеха так и для ошибки

        wrap.append(iframe);//вставляем фрейм в документ

        setTimeout(() => !iframe.classList.contains('uploaded') && iframe.ksn_loader.show(), GDS.media.video_frames.loader_delay_time);//если фрейм не загрузился за время GDS.media.video_frames.loader_delay_time значит мы должны показать лоадер

        delete wrap.start_intersecting_timeout_id; //удаляем свойство за ненадобностью
    }
    //создаёт и вставляет фрейм в документ

    //после загрузки фрейма
    async loaded_frame(iframe) {
        await iframe.ksn_loader.hide_and_remove(); //скрываем и удаляем лоадер если он есть

        iframe.classList.add('uploaded');//помечаем что фрейм загружен чтоб он показался
    }
     //после загрузки фрейма
})();
