import { createContext, useReducer } from "react";
import PropTypes from 'prop-types';

const initialState = {
  isSidebarOpen: false,
};


export const SidebarContext = createContext({});

export const SidebarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState); // Fixed typo here

  const toggleSidebar = () => {
    dispatch({
      type: "TOGGLE_SIDEBAR",
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        ...state,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// ✅ Optional: Add PropTypes for children
SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
const Reducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        isSidebarOpen: !state.isSidebarOpen,
      };
    default:
      return state;
  }
};
