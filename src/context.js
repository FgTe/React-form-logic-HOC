import React from 'react'

export default React.createContext({
  validate () { },
  dataChange () { },
  fieldAdd () { },
  fieldRemove () { },
  fieldRename () { },
  submit () { },
  submitted: false,
  isValid: true
})