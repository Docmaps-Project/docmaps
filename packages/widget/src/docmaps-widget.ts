import {html, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import litLogo from './assets/lit.svg'
import viteLogo from '/vite.svg'
import {customCss} from "./styles";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('docmaps-widget')
export class DocmapsWidget extends LitElement {
  /**
   * Copy for the read the docs hint.
   */
  @property()
  docsHint = 'Click on the Vite and Lit logos to learn more'

  /**
   * The number of times the button has been clicked.
   */
  @property({type: Number})
  count = 0

  static styles = [customCss]

  private _onClick() {
    this.count++
  }

  render() {
    return html`
        <div>
            <a href="https://vitejs.dev" target="_blank">
                <img src=${viteLogo} class="logo" alt="Vite logo"/>
            </a>
            <a href="https://lit.dev" target="_blank">
                <img src=${litLogo} class="logo lit" alt="Lit logo"/>
            </a>
        </div>
        <slot></slot>
        <div class="card">
            <button @click=${this._onClick} part="button">
                count is ${this.count}
            </button>
        </div>
        <p class="read-the-docs">${this.docsHint}</p>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'docmaps-widget': DocmapsWidget
  }
}
