let CUSTOM_SELECTOR_CONTROLLER = {
    //срабатывает при выборе марки
    marka_select_toggle: function (e) {
        //if (e.currentTarget.hasAttribute('data-disabled')) return; //если данные селектор заблокирован

        if (e?.key && e.key !== 'Enter') return; //если взаимодействовали кнопкой но это не ентер прерываем функцию

        if (this.model_selector_status === 'open') this.model_select_close(); //закрываем селектор марок если он был открыт

        this.marka_selector_status === 'close' ? this.marka_select_open() : this.marka_select_close(); //открываем/закрываем список марок
    },
    //срабатывает при выборе марки

    //открываем список марок
    marka_select_open: function () {
        this.marka_select_wrap.classList.add('marka-select-wrap--open');
        this.marka_group.classList.add('option-group--active');
        this.marka_selector_status = 'open';
        d._on('click', this.check_outside_ckick_function);
    },
    //открываем список марок

    //закрываем список марок
    marka_select_close: function () {
        this.marka_select_wrap.classList.remove('marka-select-wrap--open');
        this.marka_group.classList.remove('option-group--active');
        this.marka_selector_status = 'close';
        d._off('click', this.check_outside_ckick_function);
    },
    //закрываем список марок

    //устанавливает значение марки и делает активный выбраных пункт
    marka_select_set_value: function (value) {
        let current_sected_marka = [...this.marka_option_items].find(el => el.textContent === value); //находим пункт с нужной маркой

        if (!current_sected_marka) return false; //если такой марки нет прерывам выполнение

        if (this.target_model_group?.dataset.marka !== value) this.model_select_set_default(); //если сменилась марка очищаем селектор модели устанавливая его по умолчанию в "Модель"

        this.marka_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех марок
        this.marka_title.textContent = value; //вставляем в заголовок селектора имя марки
        this.current_selected_marka = value; //записываем выбраную марку
        this.target_model_group = [...this.model_group].find(el => el.dataset.marka === value); //записываем выбраную группу моделей

        if (current_sected_marka.parentNode.children.length > 2) this.all_marki_option_item.setAttribute('data-all-marki-option-item', 'enable'); //показываем пункт селектора марок для показа всех марок если марок больше одной (тут учитывается в количество два ещё скрытый пункт селектора "Все марки")

        current_sected_marka.classList.add('option-item--selected'); //выделяем выбраную марку

        this.model_select_enable(); //делаем выбор модели доступным для взаимодействия

        return true;
    },
    //устанавливает значение марки и делает активный выбраных пункт

    //очищает селектор марки устанавливая его по умолчанию в "Марка"
    marka_select_set_default: function () {
        this.marka_title.textContent = 'Марка'; //вставляем в заголовок селектора имя марки
        this.current_selected_marka = null; //так же сбрасываем текущую выбраную марку
        this.marka_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех марок
        this.all_marki_option_item.setAttribute('data-all-marki-option-item', 'disabled'); //скрываем пункт селектора марок для отображения всех марок 'Все марки'
    },
    //очищает селектор марки устанавливая его по умолчанию в "Марка"

    //срабатывает при клике на каждую марку в селекторе
    marka_selectct_item: function (e) {
        if (e?.key && e.key !== 'Enter') return; //если взаимодействовали кнопкой но это не ентер прерываем функцию

        let el = e.currentTarget, //элемент marka_option_items по которому кликнули
            marka_text = el.textContent; //записываем название марки

        //если мы выбрали пункт 'Все марки' или 'Общие инструкции' для показа всех марок
        if (el.hasAttribute('data-all-marki-option-item')) {
            this.marka_select_set_default(); //очищает селектор марки устанавливая его по умолчанию в "Марка"

            this.model_select_set_default(); //очищает селектор модели устанавливая его по умолчанию в "Модель"

            this.model_select_disabled(); //делаем выбор модели НЕ доступным для взаимодействия

            this.selector_wrap.dispatchEvent(this.select_chenge_event); //запускаем кастомоное событие смены марки или модели
            return;
        }
        //если мы выбрали пункт 'Все марки' для показа всех марок

        this.marka_select_set_value(marka_text); //устанавливает значение марки и делает активный выбраных пункт

        this.selector_wrap.dispatchEvent(this.select_chenge_event); //запускаем кастомоное событие смены марки или модели
    },
    //срабатывает при клике на каждую марку в селекторе

    //срабатывает при выборе марки
    model_select_toggle: function (e) {
        if (e.currentTarget.hasAttribute('data-disabled')) return; //если данные селектор заблокирован, т.е. ещё не была выбрана не одна из марок

        if (e?.key && e.key !== 'Enter') return; //если взаимодействовали кнопкой но это не ентер прерываем функцию

        if (this.marka_selector_status === 'open') this.marka_select_close(); //закрываем селектор марок если он был открыт

        this.model_selector_status === 'close' ? this.model_select_open() : this.model_select_close(); //открываем/закрываем список моделей
    },
    //срабатывает при выборе марки

    //открываем список моделей
    model_select_open: function () {
        this.model_select_wrap.classList.add('model-select-wrap--open');
        this.target_model_group.classList.add('option-group--active');
        this.model_selector_status = 'open';
        d._on('click', this.check_outside_ckick_function);
    },
    //открываем список моделей

    //закрываем список моделей
    model_select_close: function () {
        this.model_select_wrap.classList.remove('model-select-wrap--open');
        this.target_model_group.classList.remove('option-group--active');
        this.model_selector_status = 'close';
        d._off('click', this.check_outside_ckick_function);
    },
    //закрываем список моделей

    //устанавливает значение модели и делает активный выбраных пункт
    model_select_set_value: function (value) {
        let current_sected_model = [...this.target_model_group.children].find(el => el.textContent === value); //находим пункт с нужной моделью

        if (!current_sected_model) return false; //если такой модели нет прерывам выполнение

        this.model_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех моделей

        this.model_title.textContent = value; //вставляем в заголовок селектора имя марки
        this.current_selected_model = value; //записываем выбраную марку

        if (this.target_model_group.children.length > 2) qs('[data-all-models-option-item]', this.target_model_group).setAttribute('data-all-models-option-item', 'enable'); //показываем пункут селектора "Все модели" только если там больше двух элементов в слелекте, т.е. одна модель и скрытый пункт "Все модели" это два селекта, т.е. нужна как минимум ещё одна модель в селекте чтоб пункт "Все модели" отобразился

        current_sected_model.classList.add('option-item--selected'); //выделяем выбраную модель

        return true;
    },
    //устанавливает значение модели и делает активный выбраных пункт

    //очищает селектор модели устанавливая его по умолчанию в "Модель"
    model_select_set_default: function () {
        this.model_title.textContent = 'Модель'; //сбрасываем заголовко селектора моделей
        this.model_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех моделей
        this.current_selected_model = null; //так же сбрасываем текущую выбраную модель
        this.all_model_option_item.forEach(el => el.setAttribute('data-all-models-option-item', 'disabled')); //скрываем у всех селектовров моделей пункт "Все модели"
    },
    //очищает селектор модели устанавливая его по умолчанию в "Модель"

    //блокирует для взаимодействия селектор моделей
    model_select_disabled: function () {
        this.model_select_wrap.setAttribute('data-disabled', ''); //делаем выбор модели НЕ доступным для взаимодействия
        this.model_select_wrap.removeAttribute('tabindex'); //делаем выбор модели НЕ доступным для взаимодействия
    },
    //блокирует для взаимодействия селектор моделей

    //разблокируем для взаимодействия селектор моделей
    model_select_enable: function () {
        this.model_select_wrap.removeAttribute('data-disabled'); //делаем выбор модели доступным для взаимодействия
        this.model_select_wrap.setAttribute('tabindex', '0'); //делаем выбор модели доступным для взаимодействия
    },
    //разблокируем для взаимодействия селектор моделей

    //срабатывает при клике на каждую модель в селекторе
    model_selectct_item: function (e) {
        if (e?.key && e.key !== 'Enter') return; //если взаимодействовали кнопкой но это не ентер прерываем функцию

        let el = e.currentTarget, //элемент model_option_items по которому кликнули
            model_text = el.textContent; //записываем название марки

        //если мы выбрали пункт 'Все модели' для показа всех марок
        if (model_text === 'Все модели') {
            this.model_select_set_default(); //очищает селектор модели устанавливая его по умолчанию в "Модель"
            this.selector_wrap.dispatchEvent(this.select_chenge_event); //запускаем кастомоное событие смены марки или модели
            return;
        }
        //если мы выбрали пункт 'Все модели' для показа всех марок

        this.model_select_set_value(model_text); //устанавливает значение модели и делает активный выбраных пункт

        this.selector_wrap.dispatchEvent(this.select_chenge_event); //запускаем кастомоное событие смены марки или модели
    },
    //срабатывает при клике на каждую модель в селекторе

    //функция определяет был ли клик вне селекторов, и если да то закрывает все
    check_if_click_outside_selector: function (e) {
        let path_elems = e.composedPath(),
            close_all = () => {
                if (this.marka_selector_status === 'open') this.marka_select_close(); //закрываем селектор марок если он был открыт
                if (this.model_selector_status === 'open') this.model_select_close(); //закрываем селектор моделей если он был открыт
            };

        if (path_elems.indexOf(this.marka_select_wrap) === -1 && path_elems.indexOf(this.model_select_wrap) === -1) close_all(); //если клик был не по селектору марок и не по селектору модей или их дочерним элементам то закрываем все селекторы
    },
    //функция определяет был ли клик вне селекторов, и если да то закрывает все

    //инициализирует работу кастомного селектора марки и модели
    init: function () {
        this.selector_wrap = qs('.select-marka-model'); //оболочка с селектами
        if (!this.selector_wrap) return; //если оболочка не найдена прерываем дальнейшую инициализацию

        this.selector_wrap.CUSTOM_SELECTOR_CONTROLLER = this; //записываем объект в свойства оболочки селектора чтоб можно было получать к нему доступ

        this.marka_select_wrap = qs('.marka-select-wrap', this.selector_wrap); //оболочка группы с марками
        this.marka_group = qs('.option-group', this.marka_select_wrap); //группа с марками
        this.marka_option_items = qsa('.option-item', this.marka_group); //все элеменыт списка марок
        this.marka_title = qs('.select-title', this.marka_select_wrap); //заголовк для марок
        this.model_select_wrap = qs('.model-select-wrap', this.selector_wrap); //оболочка групп с моделями
        this.model_group = qsa('.option-group', this.model_select_wrap); //все группы с моделями
        this.model_option_items = qsa('.option-item', this.model_select_wrap); //все элеменыт списков моделей
        this.model_title = qs('.select-title', this.model_select_wrap); //заголовк для моделей
        this.all_marki_option_item = qs('[data-all-marki-option-item]', this.marka_select_wrap); //элемент в селекторе марок которые отвечат за вывод всех марок
        this.all_model_option_item = qsa('[data-all-models-option-item]', this.selector_wrap); //все элементы в селекторах моделей в виде пункта "Все модели"

        this.marka_selector_status = 'close'; //статус селектора марки открыт/закрыт
        this.model_selector_status = 'close'; //статус селектора модели открыт/закрыт
        this.current_selected_marka = null; //будет содержать текущие выбраные марку
        this.current_selected_model = null; //будет содержать текущие выбраные модель
        this.target_model_group = null; //будет содержать текущие выбраную группу моделей

        this.select_chenge_event = new CustomEvent('marka-model-select-chenge', {
            detail: {
                data: this, //передаём ссылку на объект чтоб можно было получать текущие марку и модель через e.detail.data.current_selected_marka и e.detail.data.current_selected_model соответственно
            },
        }); //создаём кастомное событие чтоб отслеживать когда будет меняться марка или модель

        this.check_outside_ckick_function = this.check_if_click_outside_selector.bind(this); //записывае в свойства объекта ссылку на функцию проверки кликов вне селектов чтоб можно было её отменять

        this.marka_select_wrap._on('click keyup', this.marka_select_toggle.bind(this)); //срабатывает при клике на селектор марок
        this.marka_option_items._on('click keyup', this.marka_selectct_item.bind(this)); //срабатывает при клике на каждую марку в селекторе
        this.model_select_wrap._on('click keyup', this.model_select_toggle.bind(this)); //срабатывает при клике на селектор моделей
        this.model_option_items._on('click keyup', this.model_selectct_item.bind(this)); //срабатывает при клике на каждую модель в селекторе

        this.set_selector_state_from_get_url_params(); //если в поиске есть марка или модель то мы вносим их данные в селектор

        // this.selector_wrap._on('marka-model-select-chenge', function (e) {
        //     console.log(e.detail.data.current_selected_marka);
        //     console.log(e.detail.data.current_selected_model);
        // });
    },
    //инициализирует работу кастомного селектора марки и модели

    //если в поиске есть марка или модель то мы вносим их данные в селектор
    set_selector_state_from_get_url_params: function () {
        let GET_data = new URLSearchParams(location.search),
            marka = GET_data.get('marka'),
            model = GET_data.get('model');

        //если передана марка
        if (marka) {
            let set_marka = this.marka_select_set_value(marka); //пытаемся выбрать переданную марку

            if (!set_marka) return; //прерываем если нет такой марки

            //если передана модель
            if (model) {
                this.model_select_set_value(model); //выбираем модель если есть
            }
            //если передана модель

            this.selector_wrap.dispatchEvent(this.select_chenge_event); //нужна как минимум марка чтоб запустить событие
        }
        //если передана марка
    },
    //если в поиске есть марка или модель то мы вносим их данные в селектор
};

CUSTOM_SELECTOR_CONTROLLER.init();

export default CUSTOM_SELECTOR_CONTROLLER;
