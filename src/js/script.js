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
      title: '.product_name .no-spacing',
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
      thisProduct.initAccordion();

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

    initAccordion() {
      const thisProduct = this;
      ////console.log('initAccordion:', thisProduct);
      //* find the clickable trigger (the element that should react to clicking)
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      console.log('clickableTrigger:', clickableTrigger);

      //* START: add event listener to clickable trigger on event click
      clickableTrigger.addEventListener('click', function(event) {
        //* prevent default action for event
        event.preventDefault();
        ////console.log('initAccordion event listener!');
        //* find active product (product that has active class)
        //* select.all.menuProductsActive: '#product-list > .product.active'
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        ////console.log('activeProducts:', activeProducts);

        //* if there is active product and it's not thisProduct.element, remove class active from it
        const activated = classNames.menuProduct.wrapperActive;

        for (let activeProduct of activeProducts) {
          if (activeProduct !== thisProduct.element) {
            console.log('deactivated::', activeProduct.childNodes[3].innerText);
            activeProduct.classList.remove(activated);
          }
        }
        //* toggle active class on thisProduct.element
        thisProduct.element.classList.toggle(activated);
        console.log('active::', thisProduct.data.name);
      });
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
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
