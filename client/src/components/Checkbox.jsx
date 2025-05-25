import React from "react";

export default function Checkbox({ value, onChange }) {
    return (
        <label className="flex items-center space-x-2 my-1">
            <input
                type="checkbox"
                name={value}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span>{value}</span>
        </label>
    );
}