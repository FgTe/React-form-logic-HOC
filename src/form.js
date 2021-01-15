import React from 'react'

import FormContext from './context'

export default function withFormLogic (Component) {
  return class Form extends React.PureComponent {
    static displayName = `withFormLogic(${Component.name})`
    constructor (props) {
      super(props)
      this.updateIsValid = () => {
        this.forceUpdate()
        this.updateID = null
      }
      this.fields = {/*id: {name, value, error, instance}*/ }
      this.promisedValue = {/*id: promise*/}
      this.promisedError = {/*id: promise*/}
      this.updateID = null
      this.submitID = null
      this.submitValue = null
      this.locked = false
      this.contextValue = {
        dataChange: this.dataChange,
        fieldAdd: this.fieldAdd,
        fieldRemove: this.fieldRemove,
        fieldRename: this.fieldRename,
        submit: this.submit,
        submitting: false,
        submitted: false,
        isValid: true
      };
    }
    componentDidCatch () {
      this.clearUpdate()
      this.clearSubmit()
    }
    componentWillUnmount () {
      this.clearUpdate()
      this.clearSubmit()
    }
    get data () {
      let data = {}
      for ( let id in this.fields ) {
        if ( this.fields.hasOwnProperty(id) && this.fields[id].name ) {
          let field = this.fields[id]
          this.propertyMerge(data, field.name, field.value)
        }
      }
      return data
    }
    get error () {
      let error = null
      for ( let id in this.fields ) {
        if ( this.fields.hasOwnProperty(id) && this.fields[id].error ) {
          error = error || {}
          let field = this.fields[id]
          this.propertyMerge(error, field.name || id, field.error)
        }
      }
      return error
    }
    propertyMerge (obj, key, value) {
      if ( value !== undefined ) {
        if ( obj[key] ) {
          if ( obj[key] instanceof Array ) {
            obj[key].push(value)
          } else {
            obj[key] = [obj[key], value]
          }
        } else {
          obj[key] = value
        }
      }
    }
    dataChange = (id, value, error) => {
      if ( this.fields.hasOwnProperty(id) ) {
        const field = this.fields[id]
        let prevValue = field.value
        let prevError = field.error
        this.fields[id].value = value
        this.fields[id].error = error
        if ( value !== prevValue ) {
          if ( value && value.then instanceof Function ) {
            this.promisedValue[id] = value
            let handle = () => {
              if ( this.promisedValue[id] === value ) {
                delete this.promisedValue[id]
                if ( this.contextValue.submitting ) {
                  if ( this.submitID === null ) {
                    this.submitID = setTimeout(() => {
                      this.submit()
                      this.submitID = null
                    })
                  }
                }
              }
            }
            value.then(handle, handle)
          }
        }
        if ( error !== prevError ) {
          if ( error && error.then instanceof Function ) {
            this.promisedError[id] = error
            let handle = () => {
              if ( this.promisedError[id] === error ) {
                delete this.promisedError[id]
                if ( this.contextValue.submitting ) {
                  if ( this.submitID === null ) {
                    this.submitID = setTimeout(() => {
                      this.submit()
                      this.submitID = null
                    })
                  }
                }
              }
            }
            error.then(handle, handle)
          }
          if ( error ) {
            if ( this.contextValue.isValid ) {
              this.setValid(false)
            }
          } else if ( !this.contextValue.isValid && !this.error ) {
            this.setValid(true)
          }
        }
      }
    }
    setValid (isValid) {
      if ( this.contextValue.isValid !== isValid ) {
        this.contextValue = {
          ...this.contextValue,
          isValid
        }
        if ( this.updateID === null ) {
          this.updateID = setTimeout(this.updateIsValid)
        }
      }
    }
    clearUpdate () {
      if ( this.updateID !== null ) {
        clearTimeout(this.updateID)
        this.updateID = null
      }
    }
    clearSubmit () {
      if ( this.submitID !== null ) {
        clearTimeout(this.submitID)
        this.submitID = null
      }
    }
    fieldAdd = (id, name, instance) => {
      this.fields[id] = { name, instance }
      this.dataChange(id, instance.value, instance.error)
    }
    fieldRemove = (id) => {
      if ( this.fields.hasOwnProperty(id) ) {
        delete this.fields[id];
        if ( !this.contextValue.isValid && !this.error ) {
          this.setValid(true);
        }
      }
    }
    fieldRename = (id, name) => {
      if ( this.fields.hasOwnProperty(id) ) {
        this.fields[id].name = name
      }
    }
    submit = async (submitValue) => {
      if ( Object.keys(this.promisedValue).length || Object.keys(this.promisedError).length ) {
        if ( !this.contextValue.submitting ) {
          this.contextValue = {
            ...this.contextValue,
            submitting: true
          }
          this.forceUpdate()
        }
      } else {
        if ( this.locked ) {
          return
        }
        this.locked = true
        let update = false
        let nextContext = {}
        if ( !this.contextValue.submitted ) {
          nextContext.submitted = true
          update = true
        }
        if ( !this.contextValue.submitting ) {
          nextContext.submitting = true
          update = true
        }
        if ( update ) {
          this.contextValue = {
            ...this.contextValue,
            ...nextContext
          }
          this.forceUpdate()
        }
        try {
          if ( this.props.onSubmit instanceof Function ) {
            if ( submitValue ) {
              this.submitValue = submitValue
            }
            await this.props.onSubmit(
              this.contextValue.isValid,
              Object.assign(
                {},
                this.submitValue && this.submitValue.hasOwnProperty('name') && this.submitValue.hasOwnProperty('value') && this.submitValue.name ? { [this.submitValue.name]: this.submitValue.value } : null,
                this.data
              ),
              this.error
            );
          }
        } finally {
          this.locked = false
          this.contextValue = {
            ...this.contextValue,
            submitting: false
          }
          this.forceUpdate()
        }
      }
    }
    render () {
      const { onSubmit, ...rest } = this.props
      return (
        <FormContext.Provider value={this.contextValue}>
          <Component {...rest}/>
        </FormContext.Provider>
      )
    }
  }
}