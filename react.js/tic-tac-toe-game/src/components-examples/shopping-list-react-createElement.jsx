import React from 'react';

class ShoppingListByCreateElement extends React.Component {
    render() {
        return React.createElement("div", {
            className: "shopping-list"
        },
            React.createElement("h1", null, "Shopping List for ", this.props.name),
            React.createElement("ul", null,
                React.createElement("li", null, "Instagram"),
                React.createElement("li", null, "WhatsApp"),
                React.createElement("li", null, "Oculus")
            )
        );
    }
}

export {ShoppingListByCreateElement};