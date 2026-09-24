import { mount } from 'svelte';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '../../packages/svelte/tokens.css';
import App from './App.svelte';
mount(App, { target: document.getElementById('app')! });
