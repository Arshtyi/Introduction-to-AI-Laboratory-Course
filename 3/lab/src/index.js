import * as vis from "@tensorflow/tfjs-vis";

import './index.css'
import Home from '@/pages/Home';
import DataLab from "@/pages/DataLab";
import TrainLab from "@/pages/TrainLab";
import PracticeLab from '@/pages/PracticeLab';

const routes = {
    '/': Home,
    '/data': DataLab,
    '/train': TrainLab,
    '/practice': PracticeLab,
};

function init() {
    const app = document.getElementById('app');

    function handleRoute() {
        const path = window.location.hash.slice(1);
        if (path !== '/train' || path !== '/data') {
            vis.visor().close();
        }

        const Page = routes[path] || Home;
        app.innerHTML = '';
        app.appendChild(Page());
    }

    window.addEventListener('hashchange', handleRoute);

    handleRoute();
}

init();
