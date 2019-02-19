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
            this.state = {
                data: {},
                error: {}
            };
            this.data = this.state.data;
            this.error = this.state.error;
            this.fields = [/*{id, name, value, error, instance}*/];
            this.stateComputeInterval = null;
        }
        findField (id, start, callback) {
            let index = -1;
            for ( let i = start || 0; i < this.fields.length; i++ ) {
                if ( this.fields[i].id === id ) {
                    index = i;
                    break;
                }
            }
            if ( index >= 0 ) {
                typeof callback === 'function' && callback(index, this.fields[index]);
            }
            return index;
        }
        stateCompute (escapId) {
            let data = {};
            let error = {};
            for ( let i = 0; i < this.fields.length; i++ ) {
                let field = this.fields[i];
                if ( escapId === undefined || field !== escapId ) {
                    this.propertyMerge(data, field.name, field.value);
                    this.propertyMerge(error, field.name, field.error);
                }
            }
            this.data = data;
            this.error = error;
            this.setState({
                data,
                error
            });
            if ( typeof this.props.onChange === 'function' ) {
                this.props.onChange({ data, error });
            }
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
            this.findField(id, null, (index, field) => {
                field.value = value;
                field.error = error;
                this.stateCompute();
            });
        }
        fieldAdd (id, name, instance) {
            this.fields.push({ id, name, value: instance.state.value || '', error: instance.state.error, instance });
            this.stateCompute();
        }
        fieldRemove (id) {
            let index = this.findField(id);
            if ( index >= 0 ) {
                this.fields.splice(index, 1);
            }
            this.stateCompute();
        }
        fieldRename (id, name) {
            this.findField(id, null, (index, field) => {
                field.name = name;
                this.stateCompute();
            });
        }
        isValid () {
            let pass = true;
            for ( let name in this.state.error ) {
                if ( this.state.error.hasOwnProperty(name) && this.state.error ) {
                    pass = false;
                    break;
                }
            }
            return pass;
        }
        validate () {
            let pass = true;
            for ( let index = 0; index < this.fields.length; index++ ) {
                if ( this.fields[index].instance instanceof React.Component && typeof this.fields[index].instance.validate === 'function' ) {
                    if ( this.fields[index].instance.validate(this.fields[index].value) ) {
                        pass = false;
                    }
                }
            }
            return pass;
        }
        render () {
            return (
                <FormContext.Provider value={{ ...this.state, dataChange: this.dataChange, fieldAdd: this.fieldAdd, fieldRemove: this.fieldRemove, fieldRename: this.fieldRename }}>
                    <Component data={this.state.data} error={this.state.error} {...this.props}/>
                </FormContext.Provider>
            )
        }
    }
}