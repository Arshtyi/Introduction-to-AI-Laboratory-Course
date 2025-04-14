import '@/styles/pages/Home.css';
import {h} from '@/utils/dom';

export default function Home() {

    const href = (url) => {
        window.location.href = url;
    };

    return h("div", {classList: "home-container",},
        [
            h("div", {innerText: "MNIST-LAB", classList: "home-description",}),
            h("div", {classList: "home-button-container",},
                [
                    h("button", {innerText: "Data", onClick: () => href("#/data"),}),
                    h("button", {innerText: "Train", onClick: () => href("#/train"),}),
                    h("button", {innerText: "Practice", onClick: () => href("#/practice"),}),
                ]
            ),
        ]
    );
}
