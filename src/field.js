import React from 'react';

import FormContext from './context';

let increments = 0;
export default function wrapField(Component, type) {
  class Field extends React.PureComponent {
    static contextType = FormContext;
    constructor(props) {
      super(props);
      this.id = `${type}[${increments++}]`;
      this.instance = React.createRef();
    }
    componentDidMount() {
      this.context.fieldAdd(Object.assign(
        { id: this.id, instance: this.instance.current },
        this.props.hasOwnProperty('name') ? { name: this.props.name } : null
      ));
    }
    componentDidUpdate(prevProps) {
      if ((this.props.name || prevProps.name) && this.props.name !== prevProps.name) {
        this.context.fieldRename(Object.assign(
          { id: this.id },
          this.props.hasOwnProperty('name') ? { name: this.props.name } : null
        ));
      }
    }
    componentWillUnmount() {
      this.context.fieldRemove(this.id);
    }
    change = (value, error, promised) => {
      this.context.dataChange(this.id, value, error, promised)
    }
    render(context) {
      return <Component change={this.change} {...this.props} ref={this.instance} />
    }
  }
  return React.forwardRef((props, ref) => {
    return <Field forwardedRef={ref} {...props} />
  })
}