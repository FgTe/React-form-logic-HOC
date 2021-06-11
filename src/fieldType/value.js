import React from 'react';

let baceTypeCheck = {
  email: () => /[^@]+@[^@]+\.[\w]/ ? null : 'email'
};

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.change = this.change.bind(this);
    this.prevValue = '';
    this.value = this.props.defaultValue || '';
    this.innerError = null;
    this.error = null;
    this.promised = null;
  }
  change(value, error, promised) {
    let update
    if ( promised !== this.promised ) {
      this.promised = promised
      update = true
    }
    if (!this.props.hasOwnProperty('value')) {
      this.value = value;
      update = true
    }
    if ( error !== this.innerError ) {
      this.innerError = error;
      update = true
    }
    if ( update ) {
      this.forceUpdate()
    }
  }
  validate(value) {
    if (this.innerError) {
      return this.innerError;
    } else if (this.error && this.error.then instanceof Function && this.prevValue === value) {
      return this.error;
    } else {
      let error;
      if (this.props.required && !value) {
        error = 'required';
      } else {
        if (this.props.validate) {
          if (typeof this.props.validate === 'function') {
            error = this.props.validate(value);
          } else if (this.props.validate instanceof RegExp) {
            error = this.props.validate.test(value) ? null : 'pattern';
          } else if (typeof this.props.validate === 'string') {
            const typeCheck = baceTypeCheck[this.props.validate] || (
              this.typeCheck ? (
                this.typeCheck instanceof Function ? this.typeCheck : this.typeCheck[this.props.validate]
              ) : undefined
            );
            if ( typeCheck ) {
              error = typeCheck(value);
            }
          }
        }
      }
      return error;
    }
  }
  eacheRender() {
    this.prevValue = this.value;
    if (this.props.hasOwnProperty('value')) this.value = this.props.value;
    this.error = this.validate(this.value);
    this.props.change(this.value, this.error, this.promised);
  }
}