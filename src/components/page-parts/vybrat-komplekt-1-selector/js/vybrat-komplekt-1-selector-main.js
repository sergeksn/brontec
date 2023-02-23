let CUSTOM_SELECTOR_CONTROLER = {
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

    //срабатывает при клике на каждую марку в селекторе
    marka_selectct_item: function (e) {
        if (e?.key && e.key !== 'Enter') return; //если взаимодействовали кнопкой но это не ентер прерываем функцию

        let el = e.currentTarget, //элемент marka_option_items по которому кликнули
            marka_text = el.textContent, //записываем название марки
            prev_sected_marka = this.target_model_group; //содержит предидущую выбраную марку или null если ещё не выбирали до этого

        //если мы выбрали пункт 'Все марки' для показа всех марок
        if (marka_text === 'Все марки') {
            this.marka_title.textContent = 'Марка'; //вставляем в заголовок селектора имя марки
            this.current_selected_marka = null; //так же сбрасываем текущую выбраную марку
            this.current_selected_model = null; //так же сбрасываем текущую выбраную модель
            this.marka_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех марок
            this.model_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех моделей
            this.all_marki_option_item.setAttribute('data-all-marki-option-item', 'disabled'); //скрываем пункт селектора марок для отображения всех марок
            this.model_title.textContent = 'Модель'; //сбразываем заголовко селектора моделей
            this.model_select_wrap.setAttribute('data-disabled', ''); //делаем выбор модели НЕ доступным для взаимодействия
            this.model_select_wrap.removeAttribute('tabindex'); //делаем выбор модели НЕ доступным для взаимодействия
            this.selector_wrap.dispatchEvent(this.select_chenge_event); //запускаем кастомоное событие смены марки или модели
            return;
        }
        //если мы выбрали пункт 'Все марки' для показа всех марок

        this.marka_title.textContent = marka_text; //вставляем в заголовок селектора имя марки
        this.current_selected_marka = marka_text; //записываем выбраную марку
        this.target_model_group = [...this.model_group].find(el => el.dataset.marka === marka_text); //записываем выбраную группу моделей

        //если сменилась марка
        if (prev_sected_marka?.dataset.marka !== marka_text) {
            this.model_title.textContent = 'Модель'; //сбразываем заголовко селектора моделей
            this.model_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех моделей
            this.current_selected_model = null; //так же сбрасываем текущую выбраную модель
        }
        //если сменилась марка

        this.marka_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех марок

        el.classList.add('option-item--selected'); //выделяем выбраную модель

        this.model_select_wrap.removeAttribute('data-disabled'); //делаем выбор модели доступным для взаимодействия
        this.model_select_wrap.setAttribute('tabindex', '0'); //делаем выбор модели доступным для взаимодействия
        this.all_marki_option_item.setAttribute('data-all-marki-option-item', 'enable'); //показываем пункт селектора марок для показа всех марок

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

    //срабатывает при клике на каждую модель в селекторе
    model_selectct_item: function (e) {
        if (e?.key && e.key !== 'Enter') return; //если взаимодействовали кнопкой но это не ентер прерываем функцию

        let el = e.currentTarget, //элемент model_option_items по которому кликнули
            model_text = el.textContent; //записываем название марки

        this.model_title.textContent = model_text; //вставляем в заголовок селектора имя марки
        this.current_selected_model = model_text; //записываем выбраную марку

        this.model_option_items.forEach(el => el.classList.remove('option-item--selected')); //убираем выделение у всех моделей

        el.classList.add('option-item--selected'); //выделяем выбраную модель

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

        this.marka_select_wrap = qs('.marka-select-wrap', this.selector_wrap); //оболочка группы с марками
        this.marka_group = qs('.option-group', this.marka_select_wrap); //группа с марками
        this.marka_option_items = qsa('.option-item', this.marka_group); //все элеменыт списка марок
        this.marka_title = qs('.select-title', this.marka_select_wrap); //заголовк для марок
        this.model_select_wrap = qs('.model-select-wrap', this.selector_wrap); //оболочка групп с моделями
        this.model_group = qsa('.option-group', this.model_select_wrap); //все группы с моделями
        this.model_option_items = qsa('.option-item', this.model_select_wrap); //все элеменыт списков моделей
        this.model_title = qs('.select-title', this.model_select_wrap); //заголовк для моделей
        this.all_marki_option_item = qs('[data-all-marki-option-item]', this.marka_select_wrap); //элемент в селекторе марок которые отвечат за вывод всех марок

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

        this.selector_wrap._on('marka-model-select-chenge', function (e) {
            console.log(e.detail.data.current_selected_marka);
            console.log(e.detail.data.current_selected_model);
        });
    },
    //инициализирует работу кастомного селектора марки и модели
};

CUSTOM_SELECTOR_CONTROLER.init();

//срабатывает когда меняется значение в селекте марки
// marka_select._on(
//     'change',
//     function (e) {
//         e.preventDefault();

//         //если есть предидущий селект который отображается в поле модели мы его убираем
//         let prev_active_select = qs('.model-select--active-select', selector_wrap);
//         prev_active_select?.classList.remove('model-select--active-select');
//         //если есть предидущий селект который отображается в поле модели мы его убираем

//         //находим селект со списком моделей который предназначен для нашей марки
//         for (let i = 0; i < model_selects.length; i++) {
//             if (model_selects[i].getAttribute('data-model') === this.value) {
//                 model_selects[i].classList.add('model-select--active-select'); //делаем видимым селект моделей для данной марки
//                 model_selects[i][0].selected = true; //нужно чтоб сбросить предидущие выборы в селекте модели если были
//                 break;
//             }
//         }
//         //находим селект со списком моделей который предназначен для нашей марки
//     },
//     { passive: false },
// );
//срабатывает когда меняется значение в селекте марки
