import React from 'react';

import FormContext from './context';
import warpField from './field';

export default function withSubmitLogic (Component) {
    class Submit extends React.PureComponent {
        constructor (props) {
            super(props);
            this.finalRender = this.finalRender.bind(this)
            this.submit = this.submit.bind(this);
        }
        submit () {
            if ( this.props.value !== undefined ) {
                this.props.change(this.props.value);
            }
            this.contextValue.submit();
        }
        finalRender (context) {
            this.contextValue = context;
            let { forwardedRef, fieldId, change, ...rest } = this.props;
            let disabled = this.props.hasOwnProperty('disabled') ? this.props.disabled : !context.isValid;
            this.props.change(this.props.value);
            return <Component ref={forwardedRef} submit={this.submit} disabled={disabled} {...rest}/>;
        }
        render () {
            return (
                <FormContext.Consumer>
                    {this.finalRender}
                </FormContext.Consumer>
            )
        }
    }
    return warpField(Submit, 'submit');
}