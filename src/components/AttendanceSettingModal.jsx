import { useEffect, useState } from "react";
import { Modal, Toggle } from "rsuite";
import useMyToaster from "../hooks/useMyToaster";
import Cookies from 'js-cookie';


const AttendanceSettingModal = ({ open, closeModal }) => {
    const toast = useMyToaster();
    const token = Cookies.get("token");
    const [modelOpen, setModelOpen] = useState(null);
    const weekDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const [settings, setSettings] = useState({
        attendanceReminder: false, reminderTime: "", defaultPresent: false,
        workingHour: "", workingMinute: "0", weeklyOffDays: []
    })


    useEffect(() => {
        setModelOpen(open);
    }, [open])

    useEffect(() => {
        (async () => {
            try {
                const url = process.env.REACT_APP_API_URL + "/staff/attendance-setting/get";
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                })
                const res = await req.json();
                if (req.status === 200) {
                    setSettings({ ...res.data, attendanceReminder: res.data.attendanceReminder });
                }

            } catch (error) {
                return toast("Setting not fetch", "error")
            }
        })()
    }, [open])


    const saveSettings = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + "/staff/attendance-setting/add";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...settings, token })
            })
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            toast("Setting update success", 'success');
            return

        } catch (error) {
            return toast("Something went wrong", "error")
        }
    }



    return (
        <div>
            <Modal open={modelOpen} backdrop='static' size={'xs'} onClose={() => {
                setModelOpen(false);
                closeModal(false);
            }}>
                <Modal.Header className="border-b pb-2 bg-white">
                    <p>Attendance Setting</p>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white">
                    <div className="border-b flex flex-col px-2 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <p className="text-[13px]">Enable Daily Attendance Reminder</p>
                            <Toggle
                                size={'sm'}
                                onChange={(v) => setSettings({ ...settings, attendanceReminder: v })}
                                checked={settings.attendanceReminder}
                            />
                        </div>
                        <p className="text-gray-500 text-xs mt-2 mb-1">Reminder time: 10:00</p>
                        <select
                            onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                            value={settings.reminderTime}
                            className="w-[50%]"
                        >
                            {Array.from({ length: 21 }, (_, t) =>
                                t > 8 ? (
                                    <option key={t} value={`${t}:00`}>
                                        {t}:00
                                    </option>
                                ) : null
                            )}
                        </select>
                    </div>

                    <div className="w-full border-b flex items-center justify-between py-3 px-2">
                        <p className="text-[13px]">Mark Present By Default</p>
                        <Toggle
                            size={'sm'}
                            onChange={(v) => setSettings({ ...settings, defaultPresent: v })}
                            checked={settings.defaultPresent}
                        />
                    </div>

                    <div className="border-b flex flex-col py-3 px-2">
                        <p className="text-[13px]">Set Up Working Hour In A Shift</p>
                        <p className="text-gray-500 text-xs mt-2 mb-1">Number of hours</p>
                        <div className="w-full flex items-center gap-2">
                            <select
                                onChange={(e) => setSettings({ ...settings, workingHour: e.target.value })}
                                value={settings.workingHour}
                                className="attendace__setting__time__drp"
                            >
                                {Array.from({ length: 25 }, (_, t) =>
                                    t > 0 ? (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ) : null
                                )}
                            </select>
                            <span>:</span>
                            <select
                                onChange={(e) => setSettings({ ...settings, workingMinute: e.target.value })}
                                value={settings.workingMinute}
                                className="attendace__setting__time__drp"
                            >
                                <option value={0}>00</option>
                                <option value={30}>30</option>
                            </select>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-2 mb-1">
                            Total working hours in a day = {settings.workingHour}:{settings.workingMinute}hrs
                        </p>
                    </div>

                    <div className="flex flex-col py-3 px-2 border-b">
                        <p className="text-[13px]">Set Up Weekly Off</p>
                        <div className="w-full flex items-center gap-2 mt-2">
                            {
                                weekDay.map((day, _) => {
                                    return (
                                        <div key={_}
                                            onClick={() => {
                                                let weekDay = [...settings.weeklyOffDays];

                                                if (weekDay.includes(day)) {
                                                    weekDay = weekDay.filter((d, _) => d !== day);
                                                } else {
                                                    weekDay.push(day)
                                                }
                                                setSettings({ ...settings, weeklyOffDays: weekDay });
                                            }}
                                            className={
                                                `${settings.weeklyOffDays.includes(day) ? 'bg-blue-100 text-blue-500' : 'bg-gray-100'}  
                                                p-[6px] rounded-full text-[11px] cursor-pointer`
                                            }>
                                            {day}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <p className="text-gray-500 text-[11px] mt-2 mb-1">
                            By default Sundays will be marked weekly off
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end items-center gap-2">
                        <button
                            onClick={() => {
                                setModelOpen(false);
                                closeModal(false);
                            }}
                            className="border bg-gray-50 rounded w-[120px] p-1 text-xs"
                        >
                            Close
                        </button>
                        <button
                            onClick={saveSettings}
                            className="bg-[#003e32] p-1 rounded w-[120px] text-xs text-white"
                        >
                            Save
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AttendanceSettingModal