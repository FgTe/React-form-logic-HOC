import React from 'react';

import FormContext from './context';
import warpField from './field';

let baceTypeChack = {
    email: () => /[^@]+@[^@]+\.[\w]/ ? null : '请输入正确的邮件地址'
};

export default function withInputLogic (Component, externalTypeChack) {
    let typeChack = {
        ...baceTypeChack,
        ...externalTypeChack
    };
    class Input extends React.PureComponent {
        static contextType = FormContext;
        static getDerivedStateFromProps (props, state) {
            return {
                value: props.hasOwnProperty('value') ? props.value : state.value
            }
        }
        constructor (props) {
            super(props);
            this.changeHandler = this.changeHandler.bind(this);
            this.state = {
                value: this.props.defaultValue || '',
                error: null
            };
        }
        changeHandler (value) {
            let error = this.validate(value);
            this.setState({
                value,
                error
            });
        }
        validate (value) {
            let error;
            if ( this.props.required && !value ) {
                error = `请输入${this.props.label || ''}`
            } else {
                if ( this.props.validate ) {
                    if ( typeof this.props.validate === 'function' ) {
                        error = this.props.validate(value);
                    } else if ( this.props.validate instanceof RegExp ) {
                        error = this.props.validate.test(value) ? null : `请输入正确的${this.props.label || ''}格式`;
                    } else if ( typeof this.props.validate === 'string' ) {
                        if ( typeChack[this.props.validate] ) {
                            error = typeChack[this.props.validate](value);
                        }
                    }
                }
            }
            this.context.dataChange(this.props.fieldId, value, error);
            return error
        }
        componentDidUpdate (prevProps) {
            if ( prevProps.value !== this.props.value ) {
                this.changeHandler(this.props.value);
            }
        }
        render () {
            let { forwardedRef, validate, fieldId, value, ...rest } = this.props;
            return (
                <Component ref={forwardedRef} changeHandler={this.changeHandler} value={this.state.value} error={this.state.error} {...rest}/>
            )
        }
    }
    return warpField(Input, 'input');
}