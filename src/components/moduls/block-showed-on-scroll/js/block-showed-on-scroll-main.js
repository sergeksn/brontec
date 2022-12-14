import { wait } from '@js-libs/func-kit';

let first_observe, visible_observer, first_observe_complit;

//в случае видимости блока
function show_block(entries) {
    //перебираем массив с объектами отслеживаемых элементов
    //ПРИМЕЧАНИЕ: при первой инициализации в этом массиве будут все элементы которые мы добавили к данному наблюдателю, а далее только те видимость которых будет изменяться
    entries.forEach(entrie => {
        //из всех элементов берём только те которые пересекаются с экраном
        if (entrie.isIntersecting) {
            let el = entrie.target;
            el.classList.add('block-showed-on-scroll--show'); //помечаем что блок виден
            visible_observer.unobserve(el); //удаляем блок из отслеживания
        }
    });

    if (!first_observe_complit) {
        first_observe.disconnect(); //удаляем все элементы из первого отслеживания без отступов
        first_observe_complit = true; //если первое сканирование ещё не было проведено помечаем его выполнение
    }
}
//в случае видимости блока

//начинает отслеживание видимости блоков
async function start_observe() {
    let otstup = GDS.win.height * 0.05 > 50 ? GDS.win.height * 0.05 : 50, //задержка обнаружения в 5% высоты экрана но минимум 50px
        all_showed_blocks = qsa('[data-showed-on-scroll]'); //все элементы которые нужно отслеживать
    //ПРИМЕЧАНИЕ: решил использовать data атрибут вместо класса чтоб было удобнее искать такие блоки в вёрстке и в коде

    first_observe = new IntersectionObserver(show_block); //первое сканирование без отсупов, т.е. если элемент виден хоть на 1 пискель он будет виден и дальше

    visible_observer = new IntersectionObserver(show_block, { rootMargin: '-' + otstup + 'px 0px' }); //создаём наблюдатель за видимостью элементов на экране, обнаруживаем блоки при пересечении в n писелей

    all_showed_blocks.forEach(el => first_observe.observe(el)); //добавляем все элементы на отслеживание видимости впервый раз без отступов

    await wait(() => first_observe_complit, true); //ждём завершения первого сканирования, так же в этот момент первое скарирование будет удалено и можно запускать основное

    all_showed_blocks.forEach(el => !el.classList.contains('block-showed-on-scroll--show') && el.classList.add('block-showed-on-scroll--hide')); //после того как завершилось первое сканирование видимости добавляем всем элементам не помеченным как видимые класс с пометкой того что они скрыты, чтоб в дальнейшем они плавно появлялись

    all_showed_blocks.forEach(el => visible_observer.observe(el)); //добавляем все элементы на отслеживание видимости с отступами
}
//начинает отслеживание видимости блоков

w._on('load', start_observe); //начианем отслеживание толкьо после полной загрузки страницы
