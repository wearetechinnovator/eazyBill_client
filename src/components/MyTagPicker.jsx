import React, { useMemo, useState } from "react";
import { Icons } from "../helper/icons";
import { useEffect } from "react";
import '../assets/css/mytag_picker.css';



/**
 * @param data []: Array of Object
 * @param values []: Default values as Array
 * @param onChage (arr)=>{}: Function return a Array of Object
 * 
 * In data param subLabel is `OPTIONAL`
 * If you pass subLabel, this show only DropDown not as a Tag
 * Tag text only first `Label`
 * 
 * ================================================================
 * Example:
 * =================================================================
 * <MyTagPicker
        data={[ {label: '', value: '', subLabel: ['', '']}, {label: '', value: '', subLabel: ['', '']} ]}
        values={['6a3b737619f11c4540b71e74']}
        onChange={(v) => {
            console.log(v) // return arr
        }}
    /> 
 */

export default function MyTagPicker({ data, values, onChange, placeholder }) {
    const [allTag, setAllTag] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const filteredTags = useMemo(() => {
        return allTag?.filter(tag =>
            tag.label.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, allTag]);




    useEffect(() => {
        setAllTag(data);
    }, [data])

    // Set Default Selected Values;
    useEffect(() => {
        if (data && values && values.length > 0) {
            const defaultSelected = data.filter((d) => values.includes(d.value));
            setSelectedTags(defaultSelected);
        }
    }, [data, values]);

    const isSelected = value => selectedTags.some(t => t.value === value);

    const toggleTag = tag => {
        let updated;
        if (isSelected(tag.value)) {
            updated = selectedTags.filter(t => t.value !== tag.value);
        } else {
            updated = [...selectedTags, tag];
        }

        setSelectedTags(updated);
        onChange?.(updated);
        setQuery("");
    };

    const removeTag = value => {
        const updated = selectedTags.filter(t => t.value !== value);
        setSelectedTags(updated);
        onChange?.(updated);
    };

    return (
        <div className="sb_tag_picker">
            <div className="sb_tag__main">
                {selectedTags.map(tag => (
                    <div key={tag.value} className="sb_tag__item">
                        <span>{tag.label}</span>
                        <Icons.CANCEL
                            size={14}
                            onClick={() => removeTag(tag.value)}
                        />
                    </div>
                ))}

                <input
                    value={query}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setShowDropdown(false)}
                    onChange={e => setQuery(e.target.value)}
                    className="sb_tag__input"
                    placeholder={placeholder}
                />
            </div>

            {showDropdown && filteredTags?.length > 0 && (
                <div className="sb_tag__dropdown">
                    {filteredTags.map(tag => {
                        const checked = isSelected(tag.value);
                        return (
                            <div key={tag.value}
                                className={`sb_tag__option ${checked ? "sb_tag__option--selected" : ""}`}
                                onMouseDown={() => toggleTag(tag)}
                            >
                                <input
                                    type="checkbox"
                                    className="sb_tag__checkbox"
                                    checked={checked}
                                    onChange={() => { }}
                                    tabIndex={-1}
                                />
                                <span>{tag.label}</span>

                                {tag.subLabel?.map((sl, _) => {
                                    return <span key={_} className="text-[10px] text-gray-500">
                                        {sl}
                                    </span>
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
