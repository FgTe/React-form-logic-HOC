import React from 'react';
import FormContext from './context';

let increments = 0;
export default function wrapField (Component, type) {
    class Field extends React.PureComponent {
        static contextType = FormContext;
        constructor (props) {
            super(props);
            this.id = `${type}[${increments++}]`;
            this.instance = React.createRef();
        }
        componentDidMount () {
            this.context.fieldAdd(this.id, this.props.name || this.id, this.instance.current);
        }
        componentWillUnmount () {
            this.context.fieldRemove(this.id);
        }
        componentDidUpdate (prevProps) {
            if ( ( this.props.name || prevProps.name ) && this.props.name !== prevProps.name ) {
                this.context.fieldRename(this.id, this.props.name || this.id);
            }
        }
        render () {
            let { name, ...rest } = this.props;
            return <Component {...rest} fieldId={this.id} name={name || this.id} ref={this.instance}/>
        }
    }
    return React.forwardRef((props, ref) => {
        return <Field forwardedRef={ref} {...props}/>
    })
}