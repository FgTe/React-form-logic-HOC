import React from 'react';

import warpField from './field';

let baceTypeChack = {
    email: () => /[^@]+@[^@]+\.[\w]/ ? null : 'email'
};

export default function withInputLogic (Component, externalTypeChack) {
    let typeChack = {
        ...baceTypeChack,
        ...externalTypeChack
    };
    class Input extends React.Component {
        constructor (props) {
            super(props);
            this.change = this.change.bind(this);
            this.value = this.props.defaultValue || '';
            this.error = null;
        }
        change (value) {
            if ( !this.props.hasOwnProperty('value') ) {
                this.value = value;
                this.forceUpdate();
            }
        }
        validate (value) {
            let error;
            if ( this.props.required && !value ) {
                error = 'required';
            } else {
                if ( this.props.validate ) {
                    if ( typeof this.props.validate === 'function' ) {
                        error = this.props.validate(value);
                    } else if ( this.props.validate instanceof RegExp ) {
                        error = this.props.validate.test(value) ? null : 'pattern';
                    } else if ( typeof this.props.validate === 'string' ) {
                        if ( typeChack[this.props.validate] ) {
                            error = typeChack[this.props.validate](value);
                        }
                    }
                }
            }
            return error;
        }
        render () {
            let { forwardedRef, fieldId, change, value, validate, ...rest } = this.props;
            if ( this.props.hasOwnProperty('value') ) this.value = value;
            this.error = this.validate(this.value);
            this.props.change(this.value, this.error);
            return (
                <Component ref={forwardedRef} change={this.change} value={this.value} error={this.error} {...rest} />
            );
        }
    }
    return warpField(Input, 'input');
}