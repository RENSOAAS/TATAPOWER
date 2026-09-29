import React, { useState } from 'react';

const GraphFilters = ({ setFilterValues, filterCardIsOpen, setFilterCardIsOpen }) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    const defaultDate = `${year}-${month}-${day}`;

    const date = new Date();
    const showTime = date.getHours()
        + ':' + date.getMinutes()
        + ":" + date.getSeconds();
    
    const [filterCardValues, setFilterCardValues] = useState({
        periodFrom: defaultDate,
        periodTo: defaultDate
    });

    const { periodFrom, periodTo } = filterCardValues;

    // ---------------------------------------------------------------------------
    // Predefined dates
    const handlePresetChange = (event) => {
        const today = new Date();
        const lastSevenDays = new Date();
        lastSevenDays.setDate(lastSevenDays.getDate() - 7);
        const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfLastThreeMonths = new Date(today.getFullYear(), today.getMonth() - 2, 1);

        if (event.target.value === "lastSevenDays") {
            setFilterCardValues({
                periodFrom: lastSevenDays.toISOString().substring(0, 10),
                periodTo: today.toISOString().substring(0, 10)
            });
        } else if (event.target.value === "thisMonth") {
            setFilterCardValues({
                periodFrom: firstDayOfThisMonth.toISOString().substring(0, 10),
                periodTo: today.toISOString().substring(0, 10)
            });
        } else if (event.target.value === "lastThreeMonths") {
            setFilterCardValues({
                periodFrom: firstDayOfLastThreeMonths.toISOString().substring(0, 10),
                periodTo: today.toISOString().substring(0, 10)
            });
        }
    };
    // ---------------------------------------------------------------------------

    const handleChange = name => e => {
        setFilterCardValues({ ...filterCardValues, [name]: e.target.value });
    }
    const handleApplyFilters = (e) => {
        e.preventDefault();
        if (periodFrom === '') {
            alert("Please fill the Date from");
        } else if (periodTo === '') {
            alert("Please fill the Date to");
        } else {
            if (filterCardValues.periodTo === defaultDate) {
                setFilterValues({
                    periodFrom: filterCardValues.periodFrom + ' 00:01:00',
                    periodTo: filterCardValues.periodTo + ' ' + showTime
                });
            } else {
                setFilterValues({
                    periodFrom: filterCardValues.periodFrom + ' 00:01:00',
                    periodTo: filterCardValues.periodTo + ' 23:59:59'
                });
            }
        }
        setFilterCardIsOpen(!filterCardIsOpen);
    };

    const handleClearFilters = (e) => {
        setFilterValues({
            periodFrom: defaultDate + ' 00:01:00',
            periodTo: defaultDate + ' ' + showTime
        });
        setFilterCardIsOpen(!filterCardIsOpen);
    };

    return (
        <div className='filter-card-wrapper'>
            <div className='filter-card-container'>
                <div className='filter-card-position-section'>
                    <label className='custom-checkbox-container-filters'>
                        <p>Date</p>
                    </label>
                    <div>
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
                            <p>Preset Dates :-</p>
                        </label>
                        <div className='filter-card-preset-section-options'>
                            <p>By Default: Today</p>
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
                                    value="thisMonth"
                                    onChange={handlePresetChange}
                                />
                                This Month
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="preset"
                                    value="lastThreeMonths"
                                    onChange={handlePresetChange}
                                />
                                Last 3 Months
                            </label>
                        </div>
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

export default GraphFilters;