import React from 'react';

import FormContext from './context';

let increments = 0;
export default function wrapField(Component, type) {
  class Field extends React.Component {
    constructor(props) {
      super(props);
      this.id = `${type}[${++increments}]`;
      this.instance = React.createRef();
      this.contextValue = FormContext._currentValue;
    }
    componentDidMount() {
      this.contextValue.fieldAdd(Object.assign(
        { id: this.id, instance: this.instance.current },
        this.props.hasOwnProperty('name') ? { name: this.props.name } : null
      ));
    }
    componentDidUpdate(prevProps) {
      if ((this.props.name || prevProps.name) && this.props.name !== prevProps.name) {
        this.contextValue.fieldRename(Object.assign(
          { id: this.id },
          this.props.hasOwnProperty('name') ? { name: this.props.name } : null
        ));
      }
    }
    componentWillUnmount() {
      this.contextValue.fieldRemove(this.id);
    }
    change = (value, error, promised) => {
      this.contextValue.dataChange(this.id, value, error, promised);
    }
    finalRender = (context) => {
      this.contextValue = context;
      return <Component change={this.change} {...this.props} ref={this.instance}/>
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