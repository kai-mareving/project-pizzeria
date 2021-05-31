import { settings, select } from '../settings.js';

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
  //or const event = new CustomEvent('update', { bubbles: true });
  thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;