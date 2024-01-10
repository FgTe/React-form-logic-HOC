import React from 'react';

let baceTypeCheck = {
  email: () => /[^@]+@[^@]+\.[\w]/ ? null : 'email'
};

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.change = this.change.bind(this);
    this.value = '';
    this.innerError = null;
    this.promised = null;
    if ( this.props.hasOwnProperty('defaultValue') ) {
      this.value = this.props.defaultValue;
    }
    this.error = this.validate(this.value);
  }
  change(value, error, promised) {
    let update = false;
    if ( promised !== this.promised ) {
      this.promised = promised;
      update = true;
    }
    if ( !this.props.hasOwnProperty('value') ) {
      this.value = value;
      this.error = this.validate(value);
      update = true;
    }
    if ( error !== this.innerError ) {
      this.innerError = error;
      update = true;
    }
    if ( update ) {
      this.forceUpdate();
    }
  }
  validate(value) {
    if ( this.innerError ) {
      return this.innerError;
    } else {
      let error;
      if ( this.props.required && !value ) {
        error = 'required';
      } else {
        if ( this.props.validate ) {
          if ( typeof this.props.validate === 'function' ) {
            error = this.props.validate(value);
          } else if ( this.props.validate instanceof RegExp ) {
            error = this.props.validate.test(value) ? null : 'pattern';
          } else if ( typeof this.props.validate === 'string' ) {
            const typeCheck = baceTypeCheck[this.props.validate] || (
              this.typeCheck ? (
                this.typeCheck instanceof Function ? this.typeCheck : this.typeCheck[this.props.validate]
              ) : undefined
            );
            if ( typeCheck ) {
              error = typeCheck(value);
            }
          }
          if ( error?.then && error !== this.error ) {
            const handle = (err) => {
              if ( this.error === error ) {
                this.error = err || null;
                this.forceUpdate();
              }
            }
            error.then(handle, handle);
          }
        }
      }
      return error;
    }
  }
  eacheRender() {
    if ( this.props.hasOwnProperty('value') ) {
      if ( this.props.value !== this.value ) {
        this.error = this.validate(this.props.value);
      }
      this.value = this.props.value;
    }
    this.props.change(this.value, this.error, this.promised);
  }
}