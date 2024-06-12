import React from 'react';

import FormContext from './context';

export default function withSubmitLogic(Component) {
  class Submit extends React.Component {
    constructor(props) {
      super(props);
      this.contextValue = FormContext._currentValue;
    }
    submit = async (e) => {
      let value;
      return await this.contextValue.submit(/*'', */(
        this.props.hasOwnProperty('name')
        && (
          value = (
            e?.value
            || ( this.props.hasOwnProperty('value') ? this.props.value : null )
          )
        ) ? {
          name: this.props.name,
          value: value
        } : null
      ));
    }
    finalRender = (context) => {
      this.contextValue = context;
      let { forwardedRef, ...rest } = this.props;
      let disabled = this.props.hasOwnProperty('disabled') ? this.props.disabled : !this.contextValue.isValid || this.contextValue.submitting;
      return (
        <Component ref={forwardedRef}
          submit={this.submit}
          disabled={disabled}
          {...rest}
          submitting={this.contextValue.submitting}
          isValid={this.contextValue.isValid}
        />
      )
    }
    render () {
      return (
        <FormContext.Consumer>
          {this.finalRender}
        </FormContext.Consumer>
      )
    }
  }
  return React.forwardRef((props, ref) => {
    return <Submit forwardedRef={ref} {...props} />
  });
}