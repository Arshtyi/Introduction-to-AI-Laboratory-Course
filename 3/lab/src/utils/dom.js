function ensureArray(obj) {
    return Array.isArray(obj) ? obj : [obj];
}

function addElementStyles(element, styles) {
    if (typeof styles === "string") {
        element.style.cssText += styles;
    } else if (typeof styles === "object") {
        Object.assign(element.style, styles);
    }
}

function addElementClasses(element, classes) {
    if (typeof classes === "string") {
        element.classList.add(classes);
    } else if (Array.isArray(classes)) {
        classes.forEach((cls) => {
            if (typeof cls === "string") {
                element.classList.add(cls);
            } else if (typeof cls === "object") {
                Object.entries(cls).forEach(([clsName, condition]) => {
                    element.classList.toggle(clsName, !!condition)
                })
            }
        });
    }
}

function addElementOnEvent(element, event, handler) {
    if (typeof handler === "function") {
        element.addEventListener(event.slice(2).toLowerCase(), handler);
    }
}

function addElementEvents(element, events) {
    if (typeof events === "object") {
        Object.entries(events).forEach(([event, handlers]) => {
            ensureArray(handlers).forEach(
                handler => element.addEventListener(event.toLowerCase(), handler)
            );
        });
    }
}

function addChildren(element, children) {
    ensureArray(children).forEach(child => {
        if (child instanceof Node) {
            element.appendChild(child);
        }
    });
}

function h(tag, propsOrChildren, children) {
    let props = {};

    if (propsOrChildren && !(Array.isArray(propsOrChildren) || propsOrChildren instanceof Node)) {
        props = propsOrChildren;
    } else if (propsOrChildren !== undefined) {
        children = propsOrChildren;
    }

    const element = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {
        if (key === "style") {
            addElementStyles(element, value);
        } else if (key === "class") {
            addElementClasses(element, value);
        } else if (key === "event") {
            addElementEvents(element, value);
        } else if (key.startsWith("on")) {
            addElementOnEvent(element, key, value);
        } else {
            element[key] = value;
        }
    });

    if (children !== undefined) {
        addChildren(element, children);
    }

    return element;
}

export {
    h,
    ensureArray,
    addChildren,
    addElementStyles,
    addElementClasses,
    addElementOnEvent,
    addElementEvents,
};
