// Fuente abreviada para la ficha, con las fuentes de contenido/fuentes.json.
import contenido from '../../contenido/fuentes.json';
import { abreviar } from '../util/fuentes.js';

export const FUENTES = contenido.fuentes;

export const abreviarFuentes = (referencias = []) => abreviar(referencias, FUENTES);
