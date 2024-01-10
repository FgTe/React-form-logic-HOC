import React from 'react';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.change = this.change.bind(this);
    this.prevChecked = false;
    this.checked = props.defaultChecked || false;
    this.value = this.checked ? this.props.value : undefined;
    this.error = null;
    if ( this.props.hasOwnProperty('defaultChecked') ) {
      this.checked = props.defaultChecked;
    }
    this.validate(
      this.checked ? props.value : undefined,
      this.checked
    );
  }
  change(checked) {
    if (!this.props.hasOwnProperty('checked')) {
      this.checked = checked;
      this.error = this.validate(
        this.checked ? this.props.value : undefined,
        this.checked
      );
      this.forceUpdate();
    }
  }
  validate(value, checked) {
    let error;
    if (this.props.required && !checked) {
      error = 'required';
    } else {
      if (this.props.validate) {
        if (typeof this.props.validate === 'function') {
          error = this.props.validate(value, checked);
        }
        if ( error?.then && error !== this.error ) {
          const handle = (err) => {
            if ( this.error === error ) {
              this.error = err || null;
              this.forceUpdate();
            }
          }
          error.then(handle, handle)
        }
      }
    }
    return error;
  }
  eachRender() {
    if (this.props.hasOwnProperty('checked')) {
      if ( this.props.checked !== this.checked ) {
        this.error = this.validate(
          this.props.checked ? this.props.value : undefined,
          this.props.checked
        );
      }
      this.checked = this.props.checked;
    }
    this.props.change(this.checked ? this.props.value : undefined, this.error);
  }
}