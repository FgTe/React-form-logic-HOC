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
        componentWillUnmount () {
            if ( this.updateID !== null ) {
                clearTimeout(this.updateID);
            }
        }
        componentDidCatch () {
            if ( this.updateID !== null ) {
                clearTimeout(this.updateID);
            }
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
            let error = {};
            for ( let id in this.fields ) {
                if ( this.fields.hasOwnProperty(id) && this.fields[id].error) {
                    let field = this.fields[id];
                    this.propertyMerge(error, field.name || id, field.error);
                }
            }
            return error;
        }
        propertyMerge (obj, key, value) {
            if ( value ) {
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
                            this.setValid(false, false);
                        }
                    } else if ( !this.contextValue.isValid && Object.keys(this.error).length === 0 ) {
                        this.setValid(true, false);
                    }
                }
            }
        }
        setValid (isValid, update) {
            if ( this.contextValue.isValid !== isValid ) {
                this.contextValue = {
                    ...this.contextValue,
                    isValid
                };
                if ( update ) {
                    if ( this.updateID !== null ) {
                        clearTimeout(this.updateID);
                    }
                    this.updateID = setTimeout(this.updateIsValid);
                }
            }
        }
        fieldAdd (id, name, instance) {
            this.fields[id] = { name, value: instance.value, error: instance.error, instance };
            if ( this.contextValue.isValid && Object.keys(this.error).length > 0 ) {
                this.setValid(false, true);
            }
        }
        fieldRemove (id) {
            if ( this.fields.hasOwnProperty(id) ) {
                delete this.fields[id];
                if ( !this.contextValue.isValid && Object.keys(this.error).length === 0 ) {
                    this.setValid(true, true);
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
            if ( this.contextValue.isValid && this.props.onSubmit instanceof Function ) {
                this.props.onSubmit(this.data);
            }
        }
        render () {
            return (
                <FormContext.Provider value={this.contextValue}>
                    <Component {...this.props}/>
                </FormContext.Provider>
            )
        }
    }
}