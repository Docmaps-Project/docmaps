import {css, CSSResult} from "lit";

// These are the styles used within the lit component
export const customCss: CSSResult = css`
    .docmaps-widget {
        width: 500px;
        height: 500px;
        background: #EDEDED;
        border: 1px solid;
        overflow-x: hidden;
        overflow-y: hidden;
        text-align: start;
    }

    .clickable {
        cursor: pointer;
    }

    .no-select {
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE10+/Edge */
        user-select: none; /* Standard */
    }

    .not-found-message {
        margin-top: 121px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 16px;
        font-weight: 400;
        text-align: center;
        color: #777777;
    }

    .not-found-message p {
        margin: 0;
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
        width: 500px;
        font-family: 'IBM Plex Mono', 'SF Pro Display', monospace;
        font-size: 14px;
        font-style: normal;
        line-height: normal;
        height: 358px; // 500px (whole widget) - 67px (detail timeline) - 50px (detail-header) - 25px (widget-header)
    }

    .metadata-grid {
        max-height: 100%;
        max-width: 100%;
        display: grid;
        grid-template-columns: 131px auto;
        grid-gap: 0;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .no-metadata-found-grid {
        max-height: 100%;
        max-width: 100%;
        display: grid;
        grid-template-columns: auto;
        grid-gap: 0;
        overflow-y: scroll;
        overflow-x: hidden;
    }


    .metadata-grid-item {
        min-height: 47px;
        max-width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-left: 36px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        word-break: break-all;
        white-space: normal;
        border-bottom: 0.5px solid #C1C1C1;
    }

    .metadata-grid-item.key {
        font-weight: 400;
        border-right: 0.5px solid #C1C1C1;
    }

    .metadata-grid-item.value {
        font-weight: 300;
        padding-right: 25px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .metadata-grid-item.value .content {
        font-size: 12px;
        font-style: italic;
        font-weight: 300;
        line-height: normal;
        padding-top: 7px;
        padding-bottom: 7px;
    }

    .metadata-link {
        max-width: 89%;
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
    }

    .metadata-link:hover {
        color: #C1C1C1;
    }


    .copy-to-clipboard-button:hover .copy-to-clipboard-button-path {
        fill: #474747;
    }

    .detail-header .close-button {
        margin-right: 25px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .detail-header .close-button:hover {
        stroke: #ffffff;
        fill: #ffffff;
    }

    .docmap-logo-small {
        display: inline-block;
        margin: 7px 13px 6px 11px
    }

    .large {
        display: inline-block;
        margin: 7px 13px 6px 11px
    }

    .not-found-screen {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 55px;
    }

    .tooltip {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 14px;
        font-weight: 300;
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
        font-size: 30px;
        font-style: normal;
        font-weight: 600;
        text-anchor: middle;
        text-transform: uppercase;
    }

    .labels text:first-child {
        font-size: 50px;
    }
`
