/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  //##### PRODUCT #####
  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //& console.log('new Product(data):', thisProduct.data);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.dom = {};
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    renderInMenu() {
      const thisProduct = this;

      //* generate the HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //* create a DOMelement using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //* find the menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      //* insert the created DOMelement into menu container
      menuContainer.appendChild(thisProduct.element);
    }

    initAccordion() {
      const thisProduct = this;

      //* find the clickable trigger & add listener on click
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
        //* prevent default action for event
        event.preventDefault();

        //* find active product: '#product-list > .product.active'
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        //* if there is active product and it's not thisProduct.element, remove class active from it
        const activated = classNames.menuProduct.wrapperActive; // class active selector
        for (let activeProduct of activeProducts) {
          if (activeProduct !== thisProduct.element) {
            activeProduct.classList.remove(activated);
          }
        }
        //* toggle active class on thisProduct.element
        thisProduct.element.classList.toggle(activated);
      });
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('update', function () {
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;

      //* convert form to object structure e.g. {sauce:['tomato'],toppings:['olives','redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      let price = thisProduct.data.price; //* set price to default price

      //* LOOP: for every category(param)
      for (let paramId in thisProduct.data.params) {
        //* determine param value, e.g. paramId='toppings',param={label:'Toppings',type:'checkboxes'...
        const param = thisProduct.data.params[paramId];

        //* LOOP: for every option in this category
        for (let optionId in param.options) {
          //* determine option value, e.g. optionId='olives',option={ label:'Olives',price:2,default:true }
          const option = param.options[optionId];
          const isDefault = option.hasOwnProperty('default');

          //* find img in imageWrapper where class .paramId-optionId
          const optionImg = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          //* check if the option (optionId) of category (paramId) is selected in the form (formData)
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            if (!isDefault) {
              price += option.price; //^ add option price to price variable
            }
            //* check if img with class .paramId-optionId was found (not every product has pictures for options)
            if (optionImg) {
              optionImg.classList.add(classNames.menuProduct.imageVisible);
            }

          } else {

            if (optionImg) {
              optionImg.classList.remove(classNames.menuProduct.imageVisible);
            }
            if (isDefault) {
              price -= option.price; //^ reduce price var
            }
          }
        }
      }
      thisProduct.priceSingle = price; //* add prop priceSingle to thisProduct
      thisProduct.dom.priceElem.innerHTML = price * thisProduct.amountWidget.value; //* update calculated price in HTML
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};

      //* LOOP: for every category(param)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {}, //* options[optionId] = {id, label}
        };

        //* LOOP: for every option in this category(param)
        for (let optionId in param.options) {
          const option = param.options[optionId];

          if (formData[paramId] && formData[paramId].includes(optionId)) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }

  }

  //##### AMOUNT WIDGET #####
  class AmountWidget{
    constructor(element) {
      const thisWidget = this;
      //or thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      //or thisWidget.setValue(thisWidget.input.value);
      parseInt(thisWidget.input.value) ? thisWidget.setValue(thisWidget.input.value) : thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      ////console.log('AmountWidget:', thisWidget, '. Constructor args:', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.amountDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.amountIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      //** Validation **
      //^ is value given by function different from what is already in thisWidget.value
      if ((thisWidget.value !== newValue) && (!isNaN(newValue)) && (newValue >= settings.amountWidget.defaultMin) && (newValue <= settings.amountWidget.defaultMax)) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.amountDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.amountIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new Event('update'); //* create custom event
      thisWidget.element.dispatchEvent(event);
    }
  }

  //##### CART #####
  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      // thisCart.update();
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct); //* generate the HTML based on template
      const generatedDOM = utils.createDOMFromHTML(generatedHTML); //* create a DOMelement using utils.createElementFromHTML

      thisCart.dom.productList.appendChild(generatedDOM); //* insert the created DOMelement into .cart__order-summary list

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
      //& console.log('thisCart.products: ', thisCart.products);
    }

    update() {
      const thisCart = this;

      thisCart.totalNumber = 0; //* summed number of products
      let deliveryFee = parseInt(settings.cart.defaultDeliveryFee);
      let subtotalPrice = 0; //* summed cart product prices

      for (let cartProduct of thisCart.products) {
        thisCart.totalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }
      //* insert data into DOM elements:
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.totalNumber === 0 ? deliveryFee = 0 : deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      for (let price of thisCart.dom.totalPrice) {
        price.innerHTML = thisCart.totalPrice;
      }
    }
  }

  //##### CART PRODUCT #####
  class CartProduct{
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();

      //& console.log('thisCartProduct: ', thisCartProduct);
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('update', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        app.cart.update();
      });
    }
  }

  //! ***** APP *****
  const app = {
    initMenu: function () {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('thisApp.data:', thisApp.data);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
