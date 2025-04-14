import * as vis from '@tensorflow/tfjs-vis';

import '@/styles/components/Tutorial.css'
import {h} from "@/utils/dom";

export default function Tutorial(url, resetVisor = true) {
    resetVisor && document.getElementById("tfjs-visor-container")?.remove();
    vis.visor().open();

    function createIframe() {
        const iframeDocStyle = `
             body {
                min-width: 550px;
                margin-right: 550px;
             }
                                
            * {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
                                
            :-webkit-scrollbar {
                display: none;
            }`

        const iframe = h("iframe", {src: url,});
        iframe.onload = () => {
            iframe.contentDocument.head.appendChild(
                h("style", {innerText: iframeDocStyle,})
            );
        };
        return iframe;
    }

    const bottomBarContainer = h("div", {class: "bottom-bar-container",},);
    const tutorialContainer = h("div", {class: "tutorial-container",},
        [
            createIframe(),
            h("div", {class: "bottom-bar",}, [bottomBarContainer,]),
        ]
    );

    return Object.assign(tutorialContainer, {getBottomBar: () => bottomBarContainer});
}
