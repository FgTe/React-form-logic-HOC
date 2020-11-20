import React from 'react';

import FormContext from './context';

export default function withFormLogic (Component) {
    return class Form extends React.PureComponent {
        static displayName = `withFormLogic(${Component.name})`;
        constructor (props) {
            super(props);
            this.dataChange = this.dataChange.bind(this);
            this.fieldAdd = this.fieldAdd.bind(this);
            this.fieldRemove = this.fieldRemove.bind(this);
            this.fieldRename = this.fieldRename.bind(this);
            this.submit = this.submit.bind(this);
            this.updateIsValid = () => {
                this.forceUpdate();
                this.updateID = null;
            };
            this.fields = {/*id: {name, value, error, instance}*/};
            this.updateID = null;
            this.contextValue = {
                dataChange: this.dataChange,
                fieldAdd: this.fieldAdd,
                fieldRemove: this.fieldRemove,
                fieldRename: this.fieldRename,
                submit: this.submit,
                submitted: false,
                isValid: true
            };
        }
        componentDidCatch () {
            this.clearUpdate();
        }
        componentWillUnmount () {
            this.clearUpdate();
        }
        get data () {
            let data = {};
            for ( let id in this.fields ) {
                if ( this.fields.hasOwnProperty(id) && this.fields[id].name ) {
                    let field = this.fields[id];
                    this.propertyMerge(data, field.name, field.value);
                }
            }
            return data;
        }
        get error () {
            let error = null;
            for ( let id in this.fields ) {
                if ( this.fields.hasOwnProperty(id) && this.fields[id].error) {
                    error = error || {};
                    let field = this.fields[id];
                    this.propertyMerge(error, field.name || id, field.error);
                }
            }
            return error;
        }
        propertyMerge (obj, key, value) {
            if ( value !== undefined ) {
                if ( obj[key] ) {
                    if ( obj[key] instanceof Array ) {
                        obj[key].push(value);
                    } else {
                        obj[key] = [ obj[key], value ];
                    }
                } else {
                    obj[key] = value;
                }
            }
        }
        dataChange (id, value, error) {
            if ( this.fields.hasOwnProperty(id) ) {
                let prevError = this.fields[id].error;
                this.fields[id].value = value;
                this.fields[id].error = error;
                if ( error !== prevError ) {
                    if ( error ) {
                        if ( this.contextValue.isValid ) {
                            this.setValid(false);
                        }
                    } else if ( !this.contextValue.isValid && !this.error ) {
                        this.setValid(true);
                    }
                }
            }
        }
        setValid (isValid) {
            if ( this.contextValue.isValid !== isValid ) {
                this.contextValue = {
                    ...this.contextValue,
                    isValid
                };
                if ( this.updateID === null ) {
                    this.updateID = setTimeout(this.updateIsValid);
                }
            }
        }
        clearUpdate () {
            if ( this.updateID !== null ) {
                clearTimeout(this.updateID);
                this.updateID = null;
            }
        }
        fieldAdd (id, name, instance) {
            this.fields[id] = { name, value: instance.value, error: instance.error, instance };
            if ( this.contextValue.isValid && this.error ) {
                this.setValid(false);
            }
        }
        fieldRemove (id) {
            if ( this.fields.hasOwnProperty(id) ) {
                delete this.fields[id];
                if ( !this.contextValue.isValid && !this.error ) {
                    this.setValid(true);
                }
            }
        }
        fieldRename (id, name) {
            if ( this.fields.hasOwnProperty(id) ) {
                this.fields[id].name = name
            }
        }
        submit () {
            if ( !this.contextValue.submitted ) {
                this.contextValue = {
                    ...this.contextValue,
                    submitted: true
                };
                this.forceUpdate();
            }
            if ( this.props.onSubmit instanceof Function ) {
                this.props.onSubmit(this.contextValue.isValid, this.data, this.error);
            }
        }
        render () {
            const { onSubmit, ...rest } = this.props
            return (
                <FormContext.Provider value={this.contextValue}>
                    <Component {...rest} />
                </FormContext.Provider>
            )
        }
    }
}