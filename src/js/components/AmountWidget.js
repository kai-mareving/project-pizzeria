import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    /* Call to BaseWidget */
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);
    parseInt(thisWidget.dom.input.value) ? thisWidget.setValue(thisWidget.dom.input.value) : thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
    //// console.log('AmountWidget:', thisWidget, '. Constructor args:', element);
  }

  getElements() {
    const thisWidget = this;

    //or thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.amountDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.amountIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  //^ setValue(value) now in BaseWidget

  isValid(value) {
    return !isNaN(value) && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax;
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    thisWidget.dom.amountDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.amountIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

}

export default AmountWidget;
