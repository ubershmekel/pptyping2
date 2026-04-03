import './styles/main.css';
import { App } from './app';

const container = document.getElementById('app');
if (!container) throw new Error('#app not found');

const app = new App(container);
app.start();
