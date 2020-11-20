/* eslint-disable */
import React from 'react';
import FormContext from './context';

let increments = 0;
export default function wrapField (Component, type) {
    class Field extends React.PureComponent {
        constructor (props) {
            super(props);
            this.finalRender = this.finalRender.bind(this);
            this.change = this.change.bind(this);
            this.id = `${type}[${increments++}]`;
            this.instance = React.createRef();
        }
        componentDidMount () {
            this.contextValue.fieldAdd(this.id, this.props.name, this.instance.current);
        }
        componentDidUpdate (prevProps) {
            if ( ( this.props.name || prevProps.name ) && this.props.name !== prevProps.name ) {
                this.contextValue.fieldRename(this.id, this.props.name);
            }
        }
        componentWillUnmount () {
            this.contextValue.fieldRemove(this.id);
        }
        change (value, error) {
            this.contextValue.dataChange(this.id, value, error)
        }
        finalRender (context) {
            this.contextValue = context
            return <Component change={this.change} {...this.props} fieldId={this.id} ref={this.instance} />
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
        return <Field forwardedRef={ref} {...props} />
    })
}