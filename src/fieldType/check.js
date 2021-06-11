import React from 'react';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.change = this.change.bind(this);
    this.prevChecked = false;
    this.checked = props.defaultChecked || false;
    this.value = this.checked ? this.props.value : undefined;
    this.error = null;
  }
  change(checked) {
    if (!this.props.hasOwnProperty('checked')) {
      this.checked = checked;
      this.forceUpdate();
    }
  }
  validate(checked, value) {
    if (this.error && this.error.then instanceof Function && this.prevChecked === checked) {
      return this.error
    } else {
      let error;
      if (this.props.required && !checked) {
        error = 'required';
      } else {
        if (this.props.validate) {
          if (typeof this.props.validate === 'function') {
            error = this.props.validate(checked, value);
          }
        }
      }
      return error;
    }
  }
  eachRender() {
    this.prevChecked = this.checked;
    if (this.props.hasOwnProperty('checked')) this.checked = this.props.checked;
    this.error = this.validate(this.checked, this.value);
    this.props.change(this.checked ? this.props.value : undefined, this.error);
  }
}