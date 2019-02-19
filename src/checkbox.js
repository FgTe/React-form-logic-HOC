import React from 'react';

import FormContext from './context';
import warpField from './field';

export default function withChackboxLogic (Component) {
    class Chackbox extends React.PureComponent {
        static contextType = FormContext;
        static getDerivedStateFromProps (props, state) {
            return {
                checked: props.hasOwnProperty('checked') ? props.checked : state.checked
            }
        }
        constructor (props) {
            super(props);
            this.changeHandle = this.changeHandle.bind(this);
            this.state = {
                checked: this.props.checked || false,
                value: this.props.checked ? this.props.value : undefined
            };
        }
        changeHandle (checked) {
            let value = checked ? this.props.value : undefined;
            this.setState({
                checked,
                value
            });
            this.context.dataChange(this.props.fieldId, value);
        }
        componentDidUpdate (prevProps) {
            if ( prevProps.checked !== this.props.checked || prevProps.value !== this.props.value && this.state.checked ) {
                this.changeHandle(this.state.checked);
            }
        }
        render () {
            let { fieldId, forwardedRef, checked, ...rest } = this.props;
            return <Component ref={forwardedRef} changeHandle={this.changeHandle} checked={this.state.checked} {...rest}/>
        }
    }
    return warpField(Chackbox, 'chackbox');
}