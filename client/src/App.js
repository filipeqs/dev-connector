import { Fragment } from 'react';
import './sass/App.scss';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';

const App = () => (
    <Fragment>
        <Navbar />
        <Landing />
    </Fragment>
);

export default App;
