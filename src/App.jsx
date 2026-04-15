import React from "react";
import Routing from "./Routing/Routing";
import "./utils/axiosInterceptors";
import ShopsProvider from "./Context/ShopsProvider";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import ToastProvider from "./Components/UI/ToastProvider";

const App = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
                <ShopsProvider>
                    <ToastProvider>
                        <Routing />
                    </ToastProvider>
                </ShopsProvider>
            </PersistGate>
        </Provider>
    );
};

export default App;
