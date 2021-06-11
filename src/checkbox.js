import React from 'react';

import warpField from './field';
import CheckFieldComponent from './fieldType/check';

import FormContext from './context';

export default function withChackboxLogic(Component) {
  class Chackbox extends CheckFieldComponent {
    static contextType = FormContext;
    render() {
      this.eachRender();
      let { forwardedRef, change, checked, disabled, ...rest } = this.props;
      return <Component ref={forwardedRef} change={this.change} checked={this.checked} disabled={disabled} submitting={this.context.submitting} {...rest} />
    }
  }
  return warpField(Chackbox, 'chackbox');
}