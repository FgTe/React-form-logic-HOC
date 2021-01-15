import React from 'react';

import FormContext from './context';

export default function withSubmitLogic(Component) {
  class Submit extends React.PureComponent {
    static contextType = FormContext;
    constructor(props) {
      super(props);
    }
    submit = () => {
      this.context.submit({
        name: this.props.name,
        value: this.props.value
      });
    }
    render() {
      let { forwardedRef, change, ...rest } = this.props;
      let disabled = this.props.hasOwnProperty('disabled') ? this.props.disabled : !this.context.isValid || this.context.submitting;
      return <Component ref={forwardedRef} submit={this.submit} disabled={disabled} {...rest} submitting={this.context.submitting}/>;
    }
  }
  return React.forwardRef((props, ref) => {
    return <Submit forwardedRef={ref} {...props} />
  });
}