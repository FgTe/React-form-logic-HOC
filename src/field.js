import React from 'react'

import FormContext from './context'

let increments = 0
export default function wrapField(Component, type) {
  class Field extends React.PureComponent {
    static contextType = FormContext
    constructor (props) {
      super(props)
      this.id = `${type}[${increments++}]`
      this.instance = React.createRef()
    }
    componentDidMount () {
      this.context.fieldAdd(this.id, this.props.name, this.instance.current)
    }
    componentDidUpdate (prevProps) {
      if ( ( this.props.name || prevProps.name ) && this.props.name !== prevProps.name ) {
        this.context.fieldRename(this.id, this.props.name)
      }
    }
    componentWillUnmount () {
      this.context.fieldRemove(this.id)
    }
    change = (value, error) => {
      this.context.dataChange(this.id, value, error)
    }
    render (context) {
      return <Component change={this.change} {...this.props} ref={this.instance} />
    }
  }
  return React.forwardRef((props, ref) => {
    return <Field forwardedRef={ref} {...props}/>
  })
}