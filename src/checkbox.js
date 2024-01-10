import React from 'react';

import warpField from './field';
import CheckFieldComponent from './fieldType/check';

import FormContext from './context';

export default function withChackboxLogic(Component) {
  class Chackbox extends CheckFieldComponent {
    constructor(props) {
      super(props);
      this.contextValue = FormContext._currentValue;
    }
    finalRender = (context) => {
      this.contextValue = context;
      this.eachRender();
      let { forwardedRef, change, checked, disabled, ...rest } = this.props;
      return <Component ref={forwardedRef} change={this.change} checked={this.checked} disabled={disabled} submitting={this.contextValue.submitting} {...rest} />
    }
    render () {
      return (
        <FormContext.Consumer>
          {this.finalRender}
        </FormContext.Consumer>
      )
    }
  }
  return warpField(Chackbox, 'chackbox');
}