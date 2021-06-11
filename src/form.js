import React from 'react';

import FormContext from './context';

export default function withFormLogic (Component) {
  return class Form extends React.PureComponent {
    static displayName = `withFormLogic(${Component.name})`;
    constructor (props) {
      super(props);
      this.updateIsValid = () => {
        this.updateID = null;
        this.forceUpdate();
      };
      this.fields = {/*id: {name, value, error, instance}*/ };
      this.promised = {/*id: promise*/};
      this.updateID = null;
      this.submitID = Date.now();
      this.submitSnapshot = {};
      this.locked = false;
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
    // componentDidCatch () {
    //   this.clearUpdate();
    // }
    componentWillUnmount () {
      this.clearUpdate();
    }
    get data () {
      return this.getData(this.fields)
    }
    getData (fields) {
      let data = {};
      for ( let id in fields ) {
        if ( fields.hasOwnProperty(id) && fields[id].hasOwnProperty('name') ) {
          let field = fields[id];
          this.propertyMerge(data, field.name, field.value);
        }
      }
      return data;
    }
    get error () {
      return this.getError(this.fields)
    }
    getError (fields) {
      let error = null;
      for ( let id in fields ) {
        if ( fields.hasOwnProperty(id) && fields[id].error ) {
          error = error || {};
          let field = fields[id];
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
            obj[key] = [obj[key], value];
          }
        } else {
          obj[key] = value;
        }
      }
    }
    dataChange = (id, value, error, promised) => {
      if (this.fields.hasOwnProperty(id)) {
        const field = this.fields[id];
        let prevError = field.error;
        let prevPromisedValue = field.promised;
        field.value = value;
        field.error = error;
        field.promised = promised;
        if ( promised !== prevPromisedValue ) {
          if ( promised ) {
            this.promised[id] = promised;
            let submitID = this.submitID;
            let handle = (valueOrError, args) => {
              let promiseStore;
              const snapshot = this.submitSnapshot && this.submitSnapshot[submitID];
              if ( snapshot ) {
                if ( args.length && snapshot.fields[id] ) {
                  const valOrErr = args[0];
                  snapshot.fields[id][valueOrError] = valOrErr;
                }
                promiseStore = snapshot.promised;
                if ( this.promised[id] === promised ) {
                  delete this.promised[id];
                }
              } else {
                promiseStore = this.promised;
              }
              if ( promiseStore[id] === promised ) {
                delete promiseStore[id];
                if ( this.contextValue.submitting ) {
                  this.submit(submitID);
                }
              }
            }
            promised.then((...args) => {
              handle('value', args);
            }, (...args) => {
              handle('error', args);
            });
          }
        }
        if ( error != prevError ) {
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
    fieldAdd = (field) => {
      const id = field.id;
      const instance = field.instance
      this.fields[id] = Object.assign(
        { instance: instance },
        field.hasOwnProperty('name') ? { name: field.name } : null
      );
      this.dataChange(id, instance.value, instance.error, instance.promised);
    }
    fieldRemove = (id) => {
      if ( this.fields.hasOwnProperty(id) ) {
        delete this.fields[id];
        if ( !this.contextValue.isValid && !this.error ) {
          this.setValid(true);
        }
      }
    }
    fieldRename = (field) => {
      const id = field.id;
      if ( this.fields.hasOwnProperty(id) ) {
        if ( field.hasOwnProperty('name') ) {
          this.fields[id].name = field.name;
        } else if ( this.fields[id].hasOwnProperty('name') ) {
          delete this.fields[id].name
        }
      }
    }
    submit = async (submitID, submitValue) => {
      const snapshot = submitID && this.submitSnapshot[submitID];
      const promiseStore = snapshot ? snapshot.promised : this.promised;
      console.log('submit', submitID, snapshot)
      if ( Object.keys(promiseStore).length ) {
        if ( !this.contextValue.submitting ) {
          if ( this.props.snapshot ) {
            const newSnapshot = {
              fields: {},
              promised: {
                ...this.promised
              }
            }
            for ( let id in this.fields ) {
              const field = this.fields[id]
              newSnapshot.fields[id] = Object.assign(
                { value: field.value, error: field.error },
                field.hasOwnProperty('name') ? { name: field.name } : null
              )
            }
            this.submitSnapshot[this.submitID] = newSnapshot
            this.submitID = Date.now()
          }
          this.contextValue = {
            ...this.contextValue,
            submitting: true
          };
          this.forceUpdate();
        }
      } else {
        if ( this.locked ) {
          return;
        }
        this.locked = true;
        let update = false;
        let nextContext = {};
        if ( !this.contextValue.submitted ) {
          nextContext.submitted = true;
          update = true;
        }
        if ( !this.contextValue.submitting ) {
          nextContext.submitting = true;
          update = true;
        }
        if ( update ) {
          this.contextValue = {
            ...this.contextValue,
            ...nextContext
          };
          this.forceUpdate();
        }
        let data, error, isValid;
        if ( snapshot ) {
          data = this.getData(snapshot.fields)
          error = this.getError(snapshot.fields)
          isValid = !error
          console.log('-----', snapshot, data, error)
        } else {
          data = this.data
          error = this.error
          isValid = this.contextValue.isValid
        }
        try {
          if ( this.props.onSubmit instanceof Function ) {
            await this.props.onSubmit(
              isValid,
              Object.assign(
                {},
                data,
                submitValue || null
              ),
              error
            );
          }
        } finally {
          if ( snapshot ) {
            delete this.submitSnapshot[submitID]
          }
          this.locked = false;
          this.contextValue = {
            ...this.contextValue,
            submitting: false
          };
          this.forceUpdate();
        }
      }
    }
    render () {
      const { onSubmit, ...rest } = this.props;
      return (
        <FormContext.Provider value={this.contextValue}>
          <Component {...rest} />
        </FormContext.Provider>
      );
    }
  }
}