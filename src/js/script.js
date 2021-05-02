/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();

      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      //* generate the HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      ////console.log('generatedHTML: ', generatedHTML);
      //* create a DOMelement using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      ////console.log(thisProduct.element);
      //* find the menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      ////console.log(menuContainer);
      //* insert the created DOMelement into menu container
      menuContainer.appendChild(thisProduct.element);
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      ////const testProduct = new Product();
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }

      //// console.log('testProduct:', testProduct);
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}