import { mount } from "svelte";

import "./bulma.rol.scss";
import "./app.css";

import App from "./App.svelte";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
