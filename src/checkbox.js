/* eslint-disable */
import React from 'react';

import warpField from './field';

export default function withChackboxLogic (Component) {
    class Chackbox extends React.Component {
        constructor (props) {
            super(props);
            this.change = this.change.bind(this);
            this.checked = this.props.checked || false
            this.value = this.checked ? this.props.value : undefined;
        }
        change (checked) {
            if (!this.props.hasOwnProperty('checked')) {
                this.checked = checked;
                this.forceUpdate();
            }
        }
        render () {
            let { fieldId, forwardedRef, change, checked, ...rest } = this.props;
            if ( this.props.hasOwnProperty('checked') ) this.checked = checked;
            this.props.change(this.checked ? this.props.value : undefined);
            return <Component ref={forwardedRef} change={this.change} checked={this.checked} {...rest} />
        }
    }
    return warpField(Chackbox, 'chackbox');
}