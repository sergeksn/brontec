import Header_Poster from './header-poster';
import Header_Menu from './header-visible';
import Header_Toggle_Block from './header-hidden';
import Header_Search from './header-search';

import { wait } from '@js-libs/func-kit';



let Header = new (class {
    status = 'show'; //хранит текущее состояние блока хедера, свёрнут он или открыт или в процессе

    lock = false; //определяет заблокированны интерактивные элементы в хедере или нет

    constructor() {
        let d = document;
        //записываем все неоходимые переменные для удобства доступа
        this.header = d.getElementsByTagName('header')[0]; //хедер
        this.header_poster = d.querySelector('.header-poster');
        this.has_header_poster = this.header_poster ? true : false; //определяет есть ли в хедере банер
        this.header_background = d.getElementById('header-background');
        this.header_visible = d.querySelector('.header-visible');
        this.header_hidden = d.querySelector('.header-hidden');
        //записываем все неоходимые переменные для удобства доступа

        window._on('scroll_throttle', this.toggle_header.bind(this)); //скрываем/показываем хедер при прокрутке

        window._on('resize_optimize', () => {
            this.toggle_header.bind(this); //проверяем нужно ли скрыть хедер
            this.header_background.style.height = `${this.get_header_h({ header_hidden: false })}px`; //пересчитываем высоту фона хедера
        });
    }

    //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера
    //всё зависит от того что передано, по умолчанию получает высоту всего хедера
    get_header_h(searched_height = {}) {
        searched_height = Object.assign(
            {
                header_poster: this.has_header_poster,
                header_visible: true,
                header_hidden: true,
            },
            searched_height,
        ); //получаем те данные которые нужно получить объединов объекты по умолчанию с тем что передал скрипт

        let result = 0;

        for (let el in searched_height) {
            if (searched_height[el]) {
                let el_h = window.getComputedStyle(this[el]).height;
                if (el_h === 'auto') continue;
                result += Number(el_h.replace('px', ''));
            }
        }

        return result;
    }
    //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера

    //отпускает вниз и показывает блок хедера
    async show() {
        if (this.status === 'show' || this.status === 'pending to show') return;

        this.status = 'pending to show';

        this.header.style.transform = `translateY(0)`;

        let header_styles = window.getComputedStyle(this.header); //живой список стилей

        //для X match(/\((?:([^\s]+\s?){5}(?:.+))\)/) для Y match(/\((?:(?:[^\s]+\s?){5}(.+))\)/)
        //дожидаемся кона анимации
        await wait(() => header_styles.transform.match(/\((?:(?:[^\s]+\s?){5}(.+))\)/)[1], `0`, {
            value: 'header-transform-y', //связываем функции ожидания треками чтоб если одна из них запустится раньше чем другая то та которя неу спела закончится будет прервана и вернёт отклонённый промис
        })
            .then(() => {
                this.status = 'show';
            })
            .catch(() => {});
    }
    //отпускает вниз и показывает блок хедера

    //поднимает вверх и скрывает блок хедера
    async hide() {
        if (this.status === 'hide' || this.status === 'pending to hide') return; //если скрыта или в процессе скрытия то не нужно пытаться скрывать снова

        this.status = 'pending to hide';

        let y = this.get_header_h({ header_hidden: false }).toFixed(3); //округляем до 3-х знаков т.к. matrix не видит больше

        this.header.style.transform = `translateY(-${y}px)`;

        let header_styles = window.getComputedStyle(this.header); //живой список стилей

        //для X match(/\((?:([^\s]+\s?){5}(?:.+))\)/) для Y match(/\((?:(?:[^\s]+\s?){5}(.+))\)/)
        //дожидаемся кона анимации
        await wait(() => header_styles.transform.match(/\((?:(?:[^\s]+\s?){5}(.+))\)/)[1], `-${y}`, {
            value: 'header-transform-y',
        })
            .then(() => {
                this.status = 'hide';
            })
            .catch(() => {});
    }
    //поднимает вверх и скрывает блок хедера

    //функция оправляет сворачиванием и разворачиванием хедера
    async toggle_header() {
        if (this.lock) return; //если заблокированны интерактивные элементы на сайте мы не чего не делаем с хедером

        GDS.scroll.dir === 'bottom' && GDS.scroll.value > this.get_header_h({ header_hidden: false }) ? await this.hide() : await this.show(); //если скролим вниз и высота скрола больше высоты хедера скрываем хедер, в противном случае показываем хедер
    }
    //функция оправляет сворачиванием и разворачиванием хедера
})();

export { Header, Header_Poster, Header_Menu, Header_Toggle_Block, Header_Search };
