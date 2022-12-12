import { wait } from '@js-libs/func-kit';

new (class {
    constructor() {
        w._on('load', () => this.start_observe()); //начианем отслеживание толкьо после полной загрузки страницы
    }

    //начинает отслеживание видимости блоков
    async start_observe() {
        let otstup = GDS.win.height * 0.05 > 50 ? GDS.win.height * 0.05 : 50, //задержка обнаружения в 5% высоты экрана но минимум 50px
            all_showed_blocks = d.querySelectorAll('[data-showed-on-scroll]'); //все элементы которые нужно отслеживать
            //ПРИМЕЧАНИЕ: решил использовать data атрибут вместо класса чтоб было удобнее искать такие блоки в вёрстке и в коде

        this.first_observe = new IntersectionObserver(this.show_block.bind(this)); //первое сканирование без отсупов, т.е. если элемент виден хоть на 1 пискель он будет виден и дальше

        this.visible_observer = new IntersectionObserver(this.show_block.bind(this), { rootMargin: '-' + otstup + 'px 0px' }); //создаём наблюдатель за видимостью элементов на экране, обнаруживаем блоки при пересечении в n писелей

        all_showed_blocks.forEach(el => this.first_observe.observe(el)); //добавляем все элементы на отслеживание видимости впервый раз без отступов

        await wait(() => this.first_observe_complit, true); //ждём завершения первого сканирования, так же в этот момент первое скарирование будет удалено и можно запускать основное

        all_showed_blocks.forEach(el => !el.classList.contains('block-showed-on-scroll--show') && el.classList.add('block-showed-on-scroll--hide')); //после того как завершилось первое сканирование видимости добавляем всем элементам не помеченным как видимые класс с пометкой того что они скрыты, чтоб в дальнейшем они плавно появлялись

        all_showed_blocks.forEach(el => this.visible_observer.observe(el)); //добавляем все элементы на отслеживание видимости с отступами
    }
    //начинает отслеживание видимости блоков

    //в случае видимости блока
    show_block(entries) {
        //перебираем массив с объектами отслеживаемых элементов
        //ПРИМЕЧАНИЕ: при первой инициализации в этом массиве будут все элементы которые мы добавили к данному наблюдателю, а далее только те видимость которых будет изменяться
        entries.forEach(entrie => {
            //из всех элементов берём только те которые пересекаются с экраном
            if (entrie.isIntersecting) {
                let el = entrie.target;
                el.classList.add('block-showed-on-scroll--show'); //помечаем что блок виден
                this.visible_observer.unobserve(el); //удаляем блок из отслеживания
            }
        });

        if (!this.first_observe_complit) {
            this.first_observe.disconnect(); //удаляем все элементы из первого отслеживания без отступов
            this.first_observe_complit = true; //если первое сканирование ещё не было проведено помечаем его выполнение
        }
    }
    //в случае видимости блока
})();
