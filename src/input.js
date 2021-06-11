import React from 'react';

import warpField from './field';
import ValueFieldComponent from './fieldType/value';

import FormContext from './context';

export default function withInputLogic(Component, externalTypeCheck) {
  class Input extends ValueFieldComponent {
    static contextType = FormContext;
    constructor(props) {
      super(props);
      this.typeCheck = externalTypeCheck;
    }
    render() {
      this.eacheRender();
      let { forwardedRef, change, value, validate, disabled, ...rest } = this.props;
      return (
        <Component ref={forwardedRef} change={this.change} value={this.value} error={this.error} disabled={disabled} submitting={this.context.submitting} {...rest} />
      );
    }
  }
  return warpField(Input, 'input');
}