export default class {
    constructor({ title, search_text, price, old_price, discont, small_description, info_img_data, page_url }) {
        this.title = title;

        if (search_text) this.title = title.replace(new RegExp(search_text, 'ig'), '<span class="product-info__searched-text">$&</span>'); //если есть search_text в переданном объекте с данными значит это рендер для результатов поиска и нам нужно выделить поисковые фразы, $&   вставляет всё найденное совпадение

        this.price = price;
        this.old_price = old_price === '0' ? '' : '<div class="product-info__old-price old-price">' + old_price + '</div>';
        this.discont = discont === '' || discont === '0' ? '' : '<div class="product-info__discont discont-price">' + discont + '</div>';

        this.small_description = small_description == '' ? '' : small_description;

        if (search_text && this.small_description) this.small_description = small_description.replace(new RegExp(search_text, 'ig'), '<span class="product-info__searched-text">$&</span>'); //если есть search_text в переданном объекте с данными значит это рендер для результатов поиска и нам нужно выделить поисковые фразы, $&   вставляет всё найденное совпадение

        this.main_img = info_img_data.main;
        this.main_img.pt = ((this.main_img.oh / this.main_img.ow) * 100).toFixed(5);

        this.kit_img = info_img_data.kit;

        this.instruction_img = info_img_data.instruction;
        if (this.instruction_img) this.instruction_img.pt = ((this.instruction_img.oh / this.instruction_img.ow) * 100).toFixed(5);

        this.page_url = page_url === '' ? '#test' : page_url;
    }

    render_product_block() {
        return `<a href="${this.page_url}">
          <div class="product-info product-info--header-search">
          <div class="product-info__description">
            <div class="product-info__title">${this.title}</div>
            <div class="product-info__small-description">${this.small_description}</div>
            <div class="product-info__price-block">
              ${this.old_price}
              <div class="product-info__current-price ruble-price">${this.price}</div>
              ${this.discont}
            </div>
          </div>
          <div class="product-info__img-wrap">
            <div class="product-info__gradient-fon"></div>
            <div class="image" style="padding-top:${this.main_img.pt}%;">
              <img data-img-type="img" data-main data-src="${this.main_img.url}" data-original-w="${this.main_img.ow}" data-original-h="${this.main_img.oh}">
              <div data-img-type="kit" data-src="${this.kit_img.url}" data-kit-all-id="${this.kit_img.all_id}" data-kit-nead-id="${this.kit_img.nead_id}"></div>
              <div class="loader">
                <div class="loader__circle"></div>
              </div>
            </div>
          </div>
          <div class="product-info__arrow icon--arrow-middle"></div>
        </div>
      </a>`;
    }

    render_instruction_block() {
        if (!this.instruction_img) return ''; //если для данного продукта не передана картинка инструкций значит для этого блока инструкции показывать неужно

        return `<a href="${this.page_url}">
          <div class="product-info product-info--header-search">
          <div class="product-info__description">
            <div class="product-info__title">Инструкция по монтажу ${this.title}</div>
            <div class="product-info__small-description">${this.small_description}</div>
          </div>
          <div class="product-info__img-wrap">
            <div class="product-info__gradient-fon"></div>
            <div class="image" style="padding-top:${this.instruction_img.pt}%;">
              <div data-img-type="bg" data-src="${this.instruction_img.url}" data-original-w="${this.instruction_img.ow}" data-original-h="${this.instruction_img.oh}"></div>
              <div class="loader">
                <div class="loader__circle"></div>
              </div>
            </div>
          </div>
          <div class="product-info__arrow icon--arrow-middle"></div>
        </div>
      </a>`;
    }
}
