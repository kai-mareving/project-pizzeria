import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
  const thisCart = this;

  thisCart.products = [];
  thisCart.getElements(element);
  thisCart.initActions();
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
  thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
  thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions() {
  const thisCart = this;

  thisCart.dom.toggleTrigger.addEventListener('click', function () {
    thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
  });
  //or thisCart.dom.productList.addEventListener('update', function () { thisCart.update(); });

  thisCart.dom.productList.addEventListener('remove', function () {
    thisCart.remove(event.detail.cartProduct); //* event call contains a ref to thisCartProduct instance
  });

  thisCart.dom.form.addEventListener('submit', function (event) {
    event.preventDefault();
    thisCart.sendOrder();
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
  thisCart.orderDeliveryFee = deliveryFee;
  thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
  thisCart.orderSubtotalPrice = subtotalPrice;
  thisCart.totalPrice = subtotalPrice + deliveryFee;
  for (let price of thisCart.dom.totalPrice) {
    price.innerHTML = thisCart.totalPrice;
  }
  }

  remove(cartProduct) {
  const thisCart = this;

  cartProduct.dom.wrapper.remove(); //* remove product from HTML

  const productIndex = thisCart.products.indexOf(cartProduct);
  if (productIndex !== -1) {
    thisCart.products.splice(productIndex, 1); //* remove info about this product from the thisCart.products[]
    thisCart.update(); //* call update() to recalculate the totals
  }
  }

  sendOrder() {
  const thisCart = this;

  const url = settings.db.url + '/' + settings.db.orders;
  const orderPayload = {
    address: thisCart.dom.address.value,
    phone: thisCart.dom.phone.value,
    totalPrice: thisCart.totalPrice,
    subTotalPrice: thisCart.orderSubtotalPrice,
    totalNumber: thisCart.totalNumber,
    deliveryFee: thisCart.orderDeliveryFee,
    products: [],
  };

  for (let prod of thisCart.products) {
    orderPayload.products.push(prod.getData());
  }
  //// console.log('orderPayload: ', orderPayload);
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(orderPayload)
  };

  fetch(url, options).then(response => response.json())
    .then(parsedResponse => console.log('parsedResponse: ', parsedResponse));

  }
}

export default Cart;