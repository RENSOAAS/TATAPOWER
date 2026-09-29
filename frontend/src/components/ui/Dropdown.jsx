import React, {useState} from "react";
import "./dropdown.css";

const DropdownNew = ({ selectedMachine, setSelectedMachine, items }) => {
    const [showItems, setShowItems] = useState(false);

    const handleArrow = () => {
        setShowItems(!showItems)
    };

    const handleOnClick = item => {
        setSelectedMachine(item);
        setShowItems(false);
    };

    return (
        <div className="select-box--box">
            <div className="select-box--container">
                <div className="select-box--selected-item">
                    {selectedMachine !== {} && selectedMachine.value}
                </div>
                <div className="select-box--arrow" onClick={handleArrow}>
                    <span
                        className={`${showItems
                            ? "select-box--arrow-up"
                            : "select-box--arrow-down"
                            }`}
                    />
                </div>

                <div
                    style={{ display: showItems ? "block" : "none" }}
                    className={"select-box--items"}
                >
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => handleOnClick(item)}
                            className={selectedMachine === item ? "selected" : ""}
                        >
                            {item.value}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DropdownNew;