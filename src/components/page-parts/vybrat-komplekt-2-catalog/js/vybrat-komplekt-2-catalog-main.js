import CUSTOM_SELECTOR_CONTROLLER from '@selector-marka-model-main-js';

let CATALOG_CONTROLLER = {
    init: function () {
        this.catalog = qs('.vybrat-komplekt-2'); //каталог комплектов

        if (!this.catalog) return; //если нет католого прерываем

        this.all_marki = qsa('.catalog-marka-group'); //все блоки марок
        this.all_models = qsa('.catalog-marka-group__models-item'); //все блоки моделей

        //прослушиваем кастомное событие изменения в селекторе марки и модели
        qs('.select-marka-model')._on('marka-model-select-chenge', e => {
            let marka = e.detail.data.current_selected_marka, //текущая марка
                model = e.detail.data.current_selected_model; //текущая модель

            //сначало показываем все марки и модели
            this.all_marki.forEach(group => group.classList.remove('catalog-marka-group--hide'));
            this.all_models.forEach(el => el.classList.remove('catalog-marka-group__models-item--hide'));
            //сначало показываем все марки и модели

            //если передана марка
            if (marka) {
                this.all_marki.forEach(group => group.classList.add('catalog-marka-group--hide')); //скрываем все марки
                let target_marka = [...this.all_marki].find(group => qs('.catalog-marka-group__title', group).textContent === marka); //находим выбраную марку

                target_marka.classList.remove('catalog-marka-group--hide'); //показывам выбраную марку

                //если была выбрана модель
                if (model) {
                    let curent_models = qsa('[data-model]', target_marka), //все модели для текущей марки
                        target_model = [...curent_models].find(el => el.dataset.model === model); //нужная модель

                    curent_models.forEach(el => el.classList.add('catalog-marka-group__models-item--hide')); //скрываем все модели

                    target_model.classList.remove('catalog-marka-group__models-item--hide'); //показываем нужную модель
                }
                //если была выбрана модель
            }
            //если передана марка
        });
        //прослушиваем кастомное событие изменения в селекторе марки и модели

        CUSTOM_SELECTOR_CONTROLLER.selector_wrap.dispatchEvent(CUSTOM_SELECTOR_CONTROLLER.select_chenge_event);//после полной инициализации вызываем событие marka-model-select-chenge на случай если програмно была выбрана марки и/или модели, а так же возможно были параметры в GET запросе
    },
};

CATALOG_CONTROLLER.init();
