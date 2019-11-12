import React from 'react';

import warpField from './field';

export default function withPickerLogic (Component) {
    class Picker extends React.Component {
        constructor (props) {
            super(props);
            this.value = this.props.value;
            this.error = this.props.validate instanceof Function ? this.props.validate(this.value) : undefined;
        }
        render () {
            let { fieldId, forwardedRef, change, validate, ...rest } = this.props;
            this.value = this.props.value;
            this.error = validate instanceof Function ? validate(this.value) : undefined;
            this.props.change(this.value, this.error);
            return <Component ref={forwardedRef} value={this.value} error={this.error} {...rest}/>
        }
    }
    return warpField(Picker, 'chackbox');
}