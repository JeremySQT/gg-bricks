import { mount } from 'svelte';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '../../packages/tokens/tokens.css';
import App from './App.svelte';
mount(App, { target: document.getElementById('app')! });
