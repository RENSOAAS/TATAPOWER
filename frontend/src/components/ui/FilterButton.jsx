import React, { useState, useEffect } from 'react';
import Moment from 'moment';
import "./filterButton.css";
import { API } from "../../config";

const FilterCard = ({ filterValues, setFilterValues, filterCardIsOpen, setFilterCardIsOpen }) => {

    const [listOfMachines, setListOfMachines] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [machineChecked, setMachineChecked] = useState({});

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    const defaultDate = `${year}-${month}-${day}`;
    
    const [filterCardValues, setFilterCardValues] = useState({
        periodFrom: defaultDate,
        periodTo: defaultDate,
        machineNames: {}
    });

    const { periodFrom, periodTo, machineNames } = filterCardValues;

    // ---------------------------------------------------------------------------
    // Predefined dates
    const handlePresetChange = (event) => {
        if (event.target.value === "today") {
            const todaysDate = new Date()   
            const dateFrom = Moment(todaysDate).format("YYYY-MM-DD") 

            setFilterCardValues({
                periodFrom: dateFrom,
                periodTo: dateFrom
            })
        } else if (event.target.value === 'yesterday') {
            const yesterdaysDate = new Date()
            yesterdaysDate.setDate(yesterdaysDate.getDate() - 1);
            
            const dateFrom = Moment(yesterdaysDate).format("YYYY-MM-DD")

            setFilterCardValues({
                periodFrom: dateFrom,
                periodTo: dateFrom
            })
        } else if (event.target.value === 'lastSevenDays') {
            const lastSevenDaysDate = new Date()
            lastSevenDaysDate.setDate(lastSevenDaysDate.getDate() - 7);
            
            const dateFrom = Moment(lastSevenDaysDate).format("YYYY-MM-DD")
            const dateTo = Moment(new Date()).format("YYYY-MM-DD")

            setFilterCardValues({
                periodFrom: dateFrom,
                periodTo: dateTo
            })
        } else if (event.target.value === 'lastMonth') {
            const firstDayOfPreviousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1, 1));
            const lastDayOfPreviousMonth = new Date(new Date().setDate(0));

            
            const dateFrom = Moment(firstDayOfPreviousMonth).format("YYYY-MM-DD")
            const dateTo = Moment(lastDayOfPreviousMonth).format("YYYY-MM-DD")

            setFilterCardValues({
                periodFrom: dateFrom,
                periodTo: dateTo
            })
        }
    }
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Fetching list of machines from the db
    useEffect(() => {
        let isMounted = true;
        const fetchWegid = async () => {
            try {
                const res = await fetch(`${API}/fetchWegid`);
                const result = await res.json();
                const data = result.listOfWegid.wegid;
                if (isMounted) {
                    setListOfMachines(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (listOfMachines.length === 0) {
            fetchWegid();
        }

        return () => {
            isMounted = false;
        };
    }, []);
    // ---------------------------------------------------------------------------

    useEffect(() => {
        if (machineChecked) {
            setFilterCardValues(filterCardValues => ({ ...filterCardValues, machineNames: machineChecked }));
        }
    }, [machineChecked]);

    // ---------------------------------------------------------------------------
    // filter all or list of machines
    const handleAllChecked = (event) => {
        const checked = event.target.checked;
        setAllChecked(checked);
        setMachineChecked(prevMachineChecked =>
            listOfMachines.reduce((acc, machine) => {
                acc[machine] = checked;
                return acc;
            }, {}),
        );
    };

    const handleMachineChecked = (machine) => {
        return event => {
            const checked = event.target.checked;
            setMachineChecked(prevMachineChecked => ({ ...prevMachineChecked, [machine]: checked }));
        };
    };
    // ---------------------------------------------------------------------------

    const handleChange = name => e => {
        setFilterCardValues({ ...filterCardValues, [name]: e.target.value });
    }
    
    const handleApplyFilters = (e) => {
        e.preventDefault();
        const selectedMachinesList = Object.keys(machineNames).filter(key => machineNames[key] === true);
        if (periodFrom === '') {
            alert("Please fill the Date from");
        } else if (periodTo === '') {
            alert("Please fill the Date to");
        } else if (selectedMachinesList.length === 0) {
            alert("Please select machine(s)");
        } else {
            setFilterValues(filterCardValues);
        }
        setFilterCardIsOpen(!filterCardIsOpen);
    };

    const handleClearFilters = (e) => {
        setFilterValues({ periodFrom: "", periodTo: "", machineNames: {} });
        setFilterCardIsOpen(!filterCardIsOpen);
    };

    return (
        <div className='filter-card-wrapper'>
            <div className='filter-card-container'>
                <div className='filter-card-position-section'>
                    <label className='custom-checkbox-container-filters'>
                        <p>Date</p>
                    </label>
                    <div className='filter-card--date-inputs'>
                        <input
                            onChange={handleChange("periodFrom")}
                            type="date"
                            placeholder='From'
                            value={periodFrom}
                        />
                        <input
                            onChange={handleChange("periodTo")}
                            type="date"
                            placeholder='To'
                            value={periodTo}
                            max={new Date()}
                        />
                    </div>

                    {/* Preset dates */}
                    <div className='filter-card-preset-section'>
                        <label className='custom-checkbox-container-filters'>
                            <p>Preset Dates</p>
                        </label>
                        <div className='filter-card-preset-section-options'>
                            <label>
                                <input
                                    type="radio"
                                    name="preset"
                                    value="today"
                                    onChange={handlePresetChange}
                                />
                                Today
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="preset"
                                    value="yesterday"
                                    onChange={handlePresetChange}
                                />
                                Yesterday
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="preset"
                                    value="lastSevenDays"
                                    onChange={handlePresetChange}
                                />
                                Last 7 Days
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="preset"
                                    value="lastMonth"
                                    onChange={handlePresetChange}
                                />
                                Last Month
                            </label>
                        </div>
                    </div>

                    {/* all of list of machines checkboxes */}
                    <div className='custom-checkboxes--container'>
                        <label className='custom-checkbox-container-filters'>
                            <p>Select Machine(s)</p>
                        </label>
                        <label className="custom-checkbox">
                            <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={handleAllChecked}
                            />
                            <span className="checkmark"></span>
                            All
                        </label>
                        {listOfMachines.map(machine => {
                            return (
                                <label className="custom-checkbox" key={machine}>
                                    <input
                                        type="checkbox"
                                        checked={machineChecked[machine]}
                                        onChange={handleMachineChecked(machine)}
                                    />
                                    <span className="checkmark"></span>
                                    {machine}
                                </label>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div className='filter-card-button-area'>
                <p onClick={handleClearFilters} className='clear-filters-button'>Clear Filters</p>
                <button onClick={handleApplyFilters} className='apply-filters-button'>Apply</button>
            </div>
        </div>
    );
};

export default FilterCard;