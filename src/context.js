import React from 'react';

export default React.createContext({
    data: {},
    error: {},
    dataChange () {},
    errorOccur () {},
    fieldAdd () {},
    fieldRemove () {}
})