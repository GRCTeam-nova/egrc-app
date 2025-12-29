import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
    const [filterData, setFilterData] = useState(null);

    return (
        <FilterContext.Provider value={{ filterData, setFilterData }}>
            {children}
        </FilterContext.Provider>
    );
};
