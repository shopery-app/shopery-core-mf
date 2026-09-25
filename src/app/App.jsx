import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";
import ToastProvider from "../components/ui/Toast";
import { PageSpinner } from "../components/ui/Feedback";
import AppRouter from "./router";

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<PageSpinner />} persistor={persistor}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </PersistGate>
  </Provider>
);

export default App;
