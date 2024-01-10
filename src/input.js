import React from 'react';

import warpField from './field';
import ValueFieldComponent from './fieldType/value';

import FormContext from './context';

export default function withInputLogic(Component, externalTypeCheck) {
  class Input extends ValueFieldComponent {
    constructor(props) {
      super(props);
      this.typeCheck = externalTypeCheck;
      this.contextValue = FormContext._currentValue;
    }
    finalRender = (context) => {
      this.contextValue = context;
      this.eacheRender();
      let { forwardedRef, change, value, validate, disabled, ...rest } = this.props;
      return (
        <Component ref={forwardedRef} change={this.change} value={this.value} error={this.error} disabled={disabled} submitting={this.contextValue.submitting} {...rest} />
      );
    }
    render () {
      return (
        <FormContext.Consumer>
          {this.finalRender}
        </FormContext.Consumer>
      )
    }
  }
  return warpField(Input, 'input');
}