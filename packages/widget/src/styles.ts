import {css, CSSResult} from "lit";

// These are the styles used within the lit component
export const customCss: CSSResult = css`
  :host {
    width: 500px;
    height: 500px;
    background: #EDEDED;
    border: 1px solid;
    overflow-x: hidden;
  }

  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }

  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  .logo.lit:hover {
    filter: drop-shadow(0 0 2em #325cffaa);
  }

  .card {
    padding: 2em;
  }

  .clickable {
    cursor: pointer;
  }

  ::slotted(h1) {
    font-size: 3.2em;
    line-height: 1.1;
  }

  a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
  }

  a:hover {
    color: #747bff;
  }

  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: rgb(175, 105, 248);
    cursor: pointer;
    color: white;
    transition: border-color 0.25s;
  }

  button:hover {
    border-color: #646cff;
  }

  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }

  .widget-header {
    width: 500px;
    height: 25px;
    background: #043945;
    display: flex;
    align-items: center;
  }

  .widget-header span {
    color: white;
    font-family: 'IBM Plex Mono', 'SF Pro Display', monospace;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 2.4px;
    text-transform: uppercase;
  }

  .detail-timeline {
    height: 67px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }

  .detail-header {
    width: 500px;
    height: 50px;
    outline: 1px solid;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-header span {
    font-family: 'IBM Plex Mono', 'SF Pro Display', monospace;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: uppercase;
    margin-left: 36px;
  }

  .detail-body {
    color: #000;
    font-family: 'IBM Plex Mono', 'SF Pro Display', monospace;
    font-size: 14px;
    font-style: normal;
    line-height: normal;
    overflow-y: scroll;
  }

  .metadata-grid {
    display: grid;
    grid-template-columns: 131px auto;
    grid-gap: 0
  }

  .metadata-grid-item {
    height: 47px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 0.5px solid #C1C1C1;
    border-right: 0.5px solid #C1C1C1;
  }

  .metadata-grid-item.key {
    font-weight: 400;
  }

  .metadata-grid-item.value {
    font-weight: 300;
  }

  .detail-header .close-button {
    margin-right: 25px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .docmap-logo {
    display: inline-block;
    margin: 7px 13px 6px 11px
  }

  .tooltip {
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    position: absolute;
    text-align: center;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .labels text {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 30px; /* This is the default size; it will be overridden by specific styles below */
    font-style: normal;
    font-weight: 600;
    text-anchor: middle;
    //letter-spacing: 10px;
    text-transform: uppercase;
  }

  .labels text:first-child {
    font-size: 50px;
  }

`
