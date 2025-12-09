if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter basename='/india_oss'>
      <App />
    </BrowserRouter>
  </Provider>
);
