import CUSTOM_SELECTOR_CONTROLLER from '@selector-marka-model-main-js';

let INSTRUCTIONS_CONTROLLER = {
    init: function () {
        this.video_instructions = qs('.instrukczii-2__wrap'); //блок с интрукциями

        if (!this.video_instructions) return; //если нет блока с интрукциями прерываем

        this.all_playlist = qsa('.instrukczii-2__wrap-playlist', this.video_instructions); //все блоки с наборами видео инсрукций для пары марка-модель
        this.common_playlist = qs('.instrukczii-2__wrap-playlist[data-common-instruction]', this.video_instructions); //блок с общими инструкциями

        //прослушиваем кастомное событие изменения в селекторе марки и модели
        qs('.select-marka-model')._on('marka-model-select-chenge', e => {
            let marka = e.detail.data.current_selected_marka, //текущая марка
                model = e.detail.data.current_selected_model; //текущая модель

            this.all_playlist.forEach(el => el.classList.remove('instrukczii-2__wrap-playlist--show')); //скрываем все инструкции
            this.common_playlist.classList.remove('instrukczii-2__wrap-playlist--hide'); //показываем общие инструкции

            //если передана марка
            if (marka) {
                this.common_playlist.classList.add('instrukczii-2__wrap-playlist--hide'); //скрываем общие инструкции

                let target_marka_playlists = [...this.all_playlist].filter(el => el.dataset.marka === marka); //находим все инструкции для даннйо марки

                //если была выбрана модель
                if (model) {
                    let target_model_playlists = target_marka_playlists.filter(el => el.dataset.model === model)[0]; //находим из инструкций удовлетворяющих по марке ту которая подходит по модели

                    target_model_playlists.classList.add('instrukczii-2__wrap-playlist--show'); //показываем инструкцию
                }
                //если была выбрана модель

                //если модель не выбрана
                else {
                    target_marka_playlists.forEach(el => el.classList.add('instrukczii-2__wrap-playlist--show')); //если не передана модель то показываем все инструкции для данной марки
                }
                //если модель не выбрана
            }
            //если передана марка
        });
        //прослушиваем кастомное событие изменения в селекторе марки и модели

        CUSTOM_SELECTOR_CONTROLLER.selector_wrap.dispatchEvent(CUSTOM_SELECTOR_CONTROLLER.select_chenge_event);//после полной инициализации вызываем событие marka-model-select-chenge на случай если програмно была выбрана марки и/или модели, а так же возможно были параметры в GET запросе
    },
};

INSTRUCTIONS_CONTROLLER.init();
