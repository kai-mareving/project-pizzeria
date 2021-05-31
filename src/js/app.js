import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        //* save parsedResponse as thisApp.data.products + execute initMenu()
        thisApp.data.products = parsedResponse;
        //// console.log('fetch() done:', thisApp.data);
        //// console.log('fetch() done:', JSON.stringify(thisApp.data));
        thisApp.initMenu();
      });
    //// console.log('fetch() still working');
  },

  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      //or new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      ////console.log('new Product(data):', thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
    //or cartElem.addEventListener('update',function(event){app.cart.update();}); -> working in Cart.initActions()
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp in app.init():', thisApp);
    //// console.log('thisApp.data:', thisApp.data);
    //// console.log('classNames:', classNames);
    //// console.log('settings:', settings);
    //// console.log('templates:', templates);
    thisApp.initData();
    //// thisApp.initMenu(); -> in app.initData
    thisApp.initCart();
  },
};

app.init();
