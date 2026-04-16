import React, { useState } from "react";



//these save the fields for the respective age group sorted by id
const rangeChecks = {
    heartRate: [
        {min: 104, max: 185},
        {min: 95, max: 175},
        {min: 70, max: 145},
        {min: 50, max: 130},
    ],
    bloodPressure: [
        {min: 35, max: 100},
        {min: 35, max: 100},
        {min: 45, max: 120},
        {min: 55, max: 130},
    ],
    sodium: {min: 133, max: 145},
    potassium: {min: 3.5, max: 6.2},
};
const rangeVals = {
    heartRate: [11, 7],
    bloodPressure: [13, 2],
    sodium: [5,1],
    potassium: [3,3]
};

const thresholdChecks = {
    SpO_2: 148,
    bilirubin: 4.9,
    wbcc: 2,
    bun: 51,
    serumBicarb: 15,
    temperature: 38.5,
    gcs: 6
};
const thresholdVals = {
    SpO_2: 11,
    bilirubin: 9,
    wbcc: 12,
    bun: 10,
    serumBicarb: 6,
    temperature: 3,
    urinaryOutput: 11,
    gcs: 26,
    diag: 29,
};

const PSAPSCALC = () => {
    const [mode, setMode] = useState("mortality"); // "mortality" | "ecmo"
    // General state for numerical variables
    const [values, setValues] = useState({
        SpO_2: 0,
        sodium: 0,
        potassium: 0,
        bilirubin: 0,
        wbcc: 0,
        bun: 0,
        serumBicarb: 0,
        temperature: 0,
        urinaryOutput: null,
        adType: null,
        diag: {
            ecmo: false,
            bw: false,
            cpr: false,
            ino: false,
        },
        gcs: 0,
        heartRate: 0,
        bloodPressure: 0,
    });
    // user input values that show up onscreen
    const [input, setInput] = useState({
        SpO_2: 0,
        FiO_2: 0,
        sodium: 0,
        potassium: 0,
        bilirubin: 0,
        wbcc: 0,
        bun: 0,
        serumBicarb: 0,
        temperature: 0,
        urinaryOutput: 0,
        gcs: 0,
        adType: 0,
        diag: 0,
        heartRate: 0,
        bloodPressure: 0,
    })

    const [activeField, setActiveField] = useState(""); // "SpO_2" or "PaO_2"

    const [selectedAge] = useState(0);

    const handleValueChange = (key, value) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const toggleDiag = (type) => {
        setValues(prev => {
            let newDiag = { ...prev.diag };

            if (type === "other") {
                newDiag = {
                    ecmo: false,
                    bw: false,
                    cpr: false,
                    ino: false,
                };
            }

            if (type === "ecmo") {
                newDiag.ecmo = !newDiag.ecmo;
            }

            if (type === "bw") {
                newDiag.bw = !newDiag.bw;
            }

            if (type === "cpr") {
                newDiag.cpr = !newDiag.cpr;
            }

            if (type === "ino") {
                newDiag.ino = !newDiag.ino;
            }

            return {
                ...prev,
                diag: newDiag,
            };
        });
    };

    const diagScore =
        (values.diag.ecmo ? 17 : 0) +
        (values.diag.bw ? 9 : 0) +
        (values.diag.cpr ? 17 : 0) +
        (values.diag.ino ? 8 : 0);


    const totalScore =
        Object.entries(values).reduce((acc, [key, val]) => {
            if (key === "diag") return acc;
            return acc + (val ?? 0);
        }, 0) + diagScore;


    // range based variables check
    const checkRange = (field, value, id) => {
        let bounds;
        value = value.trim();
        if(field === "heartRate" || field === "bloodPressure") {
            bounds = rangeChecks[field][id];
        } else bounds = rangeChecks[field];

        if (!bounds) return; // no rules for this field

        let input = NaN;
        if(value !== ""){
            input = Number(value);
        }
        else{
            setValues(prev => ({
                ...prev,
                [field]: 0
            }));
            setInput(prev => ({
                ...prev,
                [field]: value
            }));
            return; // reset the points to 0
        }

        if(!isNaN(input)) {
            let newValue = 0;

            if (input < bounds.min){
                newValue = rangeVals[field][0];  // only update this field
            } else if (input > bounds.max){
                newValue = rangeVals[field][1];  // only update this field
            }

            setValues(prev => ({
                ...prev,
                [field]: newValue
            }));
            setInput(prev => ({
                ...prev,
                [field]: value
            }));
        }
        else alert("please input a valid value");
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        if (newMode === "ecmo") {
            handleValueChange("diag", 0);
        }
    };

    // thresholds
    const checkUpperBound = (field, value) => {
        value = value.trim();
        if (value === "") {
            setInput(prev => ({ ...prev, [field]: value }));
            setValues(prev => ({ ...prev, [field]: 0 })); // ✅ always number
            return;
        }
        let input = NaN;
        input = Number(value);
        if(isNaN(input)){
            alert("please input a valid value");
            return;
        }

        const bound = thresholdChecks[field];
        if (!bound) return;

        setInput(prev => ({
            ...prev,
            [field]: value
        }));

        if(value > bound){
            setValues(prev => ({
                ...prev,
                [field]: thresholdVals[field]
            }));
        } else{
            setValues(prev => ({
                ...prev,
                [field]: 0
            }));
        }
    };

    const checkLowerBound = (field, value) => {
        value = value.trim();
        if (value === "") {
            setInput(prev => ({ ...prev, [field]: value }));
            setValues(prev => ({ ...prev, [field]: 0 }));
            return;
        }

        let input = NaN;
        input = Number(value);
        if(isNaN(input)){
            alert("please input a valid value");
            return;
        }

        const bound = thresholdChecks[field];
        if (!bound) return;

        setInput(prev => ({
            ...prev,
            [field]: value
        }));

        if(value < bound){
            setValues(prev => ({
                ...prev,
                [field]: thresholdVals[field]
            }));
        } else{
            setValues(prev => ({
                ...prev,
                [field]: 0
            }));
        }
    };

    const checkRatio = (field, value) => {
        // Trim spaces
        value = value.trim();

        if (value === "") {
            setInput(prev => ({ ...prev, [field]: value }));
            setValues(prev => ({...prev, [field]: 0}));
            return;
        }

        // Only allow numbers (integer or decimal)
        if (!/^\d*\.?\d*$/.test(value)) {
            alert("Please input a valid numeric value");
            return;
        }

        value = Number(value);
        if (isNaN(value)) {
            alert("Please input a valid numeric value");
            return;
        }

        // Prevent division by zero if FiO2 is empty or zero
        const FiO2 = Number(input.FiO_2);
        if (!FiO2 || FiO2 === 0) {
            setInput(prev => ({ ...prev, [field]: value }));
            return;
        }

        const ratio = value / FiO2;
        const bound = thresholdChecks[field];
        if (!bound) return;

        if (ratio < bound) {
            setValues(prev => ({ ...prev, [field]: thresholdVals[field] }));
        }
        else{
            setValues(prev => ({ ...prev, [field]: 0 }));
        }

        setInput(prev => ({ ...prev, [field]: value }));
    };



    return (
        <div className="flex justify-center items-center min-h-screen bg-green-200">
            <div className="w-full max-w-3xl p-6 space-y-4 bg-white shadow-lg rounded-2xl">
            <h1 className="text-3xl font-bold text-center">CDH-SAPS Calculator</h1><br></br>
                <div className="flex justify-center space-x-4 mb-4">
                    <button
                        className={`btn ${
                            mode === "mortality" ? "btn-accent" : "btn-warning"
                        }`}
                        onClick={() => switchMode("mortality")}

                    >
                        Mortality
                    </button>

                    <button
                        className={`btn ${
                            mode === "ecmo" ? "btn-accent" : "btn-warning"
                        }`}
                        onClick={() => switchMode("ecmo")}
                    >
                        ECMO
                    </button>
                </div>

                



                    <div>
                        <span className="mr-2 font-bold">Heart Rate:</span>
                        <input
                            type="text"
                            value={input.heartRate}
                            onChange={(e) => checkRange("heartRate", e.target.value, selectedAge)}
                            className="input input-bordered"
                        />
                        <span> ({values.heartRate} points)</span>
                    </div>

                    <div>
                        <span className="mr-2 font-bold">Systolic Blood Pressure:</span>
                        <input
                            type="text"
                            value={input.bloodPressure} // assumes values.bloodPressure in state
                            onChange={(e) => checkRange("bloodPressure", e.target.value, selectedAge)}
                            className="input input-bordered"
                        />
                        <span> ({values.bloodPressure} points)</span>
                    </div>
            <br></br>

            
            <div className="space-y-4">

                {/* SpO2 */}
                <div>
                    <span className="mr-2 font-medium">SpO₂:</span>
                    <input
                        type="text"
                        value={input.SpO_2}
                        onChange={(e) => {
                            const value = e.target.value.trim();

                            if (value !== "" && isNaN(Number(value))) {
                                alert("Please input a valid value");
                                return;
                            }

                            setInput(prev => ({ ...prev, SpO_2: value }));

                            // compute ratio immediately
                            checkRatio("SpO_2", value);
                        }}
                        className="input input-bordered"
                    />
                </div>

                {/* FiO2 */}
                <div>
                    <span className="mr-2 font-medium">FiO₂:</span>
                    <input
                        type="text"
                        value={input.FiO_2}
                        onChange={(e) => {
                            const value = e.target.value.trim();

                            if (value !== "" && isNaN(Number(value))) {
                                alert("Please input a valid value");
                                return;
                            }

                            setInput(prev => ({ ...prev, FiO_2: value }));

                            // recompute ratio when FiO2 changes
                            checkRatio("SpO_2", input.SpO_2);
                        }}
                        className="input input-bordered"
                    />
                </div>

                {/* Ratio display */}
                <div>
                    <span className="font-bold">
                        SpO₂ / FiO₂:{" "}
                        {isNaN(input.SpO_2 / input.FiO_2)
                            ? "-"
                            : (input.SpO_2 / input.FiO_2).toFixed(2)}
                    </span>
                    <span> ({values.SpO_2} points)</span>
                </div>

            </div>

            <div>
                <span className="mr-2 font-bold">Sodium (mEq/L):</span>
                <input
                    type="text"
                    value={input.sodium}
                    onChange={(e) => checkRange("sodium", e.target.value, 0)}
                    className="input input-bordered"
                />
                <span> ({values.sodium} points)</span>
            </div>

            <div>
                <span className="mr-2 font-bold">Potassium (mEq/L):</span>
                <input
                    type="text"
                    value={input.potassium}
                    onChange={(e) => checkRange("potassium", e.target.value, 0)}
                    className="input input-bordered"
                />
                <span> ({values.potassium} points)</span>
            </div>

            <div>
                <span className="mr-2 font-bold">Conjugated Bilirubin (mg/dL):</span>
                <input
                    type="text"
                    value={input.bilirubin}
                    onChange={(e) => checkUpperBound("bilirubin", e.target.value)}
                    className="input input-bordered"
                />
                <span> ({values.bilirubin} points)</span>
            </div>

            <div>
                <span className="mr-2 font-bold">White Blood Cell Count (10<sup>3</sup>/mm<sup>3</sup>):</span>
                <input
                    type="text"
                    value={input.wbcc}
                    onChange={(e) => checkLowerBound("wbcc", e.target.value)}
                    className="input input-bordered"
                />
                <span> ({values.wbcc} points)</span>
            </div>

            <div>
                <span className="mr-2 font-bold">Blood Urea Nitrogen (mg/dl):</span>
                <input
                    type="text"
                    value={input.bun}
                    onChange={(e) => checkUpperBound("bun", e.target.value)}
                    className="input input-bordered"
                />
                <span> ({values.bun} points)</span>
            </div>

            <div>
                <span className="mr-2 font-bold">Serum Bicarbonate (mEqu/L):</span>
                <input
                    type="text"
                    value={input.serumBicarb}
                    onChange={(e) => checkLowerBound("serumBicarb", e.target.value)}
                    className="input input-bordered"
                />
                <span> ({values.serumBicarb} points)</span>
            </div>

            <div>
                <span className="mr-2 font-bold">Temperature (C°):</span>
                <input
                    type="text"
                    value={input.temperature}
                    onChange={(e) => checkUpperBound("temperature", e.target.value)}
                    className="input input-bordered"
                />
                <span> ({values.temperature} points)</span>
            </div>
            <div>
                <span className="mr-2 font-bold">Glasgow Coma Scale:</span>
                <input
                    type="text"
                    value={input.temperature}
                    onChange={(e) => checkUpperBound("gcs", e.target.value)}
                    className="input input-bordered"
                />
                <span> ({values.temperature} points)</span>
            </div>
                <br></br>
                <div>
                <span className="mr-2 font-bold">Urinary Output: Anuria</span>
                <div className="space-x-2">
                    <button
                        className={`btn ${values.urinaryOutput === 11 ? "btn-accent" : "btn-warning"}`}
                        onClick={() => handleValueChange("urinaryOutput", 11)}
                    >
                        Yes
                    </button>
                    <button
                        className={`btn ${values.urinaryOutput === 0 ? "btn-accent" : "btn-warning"}`}
                        onClick={() => handleValueChange("urinaryOutput", 0)}
                    >
                        No
                    </button>
                    <span>({values.urinaryOutput ?? 0} points)</span>
                </div>
            </div>

            <div>
                <label className="font-bold">Type of admission: Unscheduled / prenatally undiagnosed</label>
                <div className="space-x-2">
                    <button
                        className={`btn ${values.adType === 8 ? "btn-accent" : "btn-warning"}`}
                        onClick={() => handleValueChange("adType", 8)}
                    >
                        Yes
                    </button>
                    <button
                        className={`btn ${values.adType === 0 ? "btn-accent" : "btn-warning"}`}
                        onClick={() => handleValueChange("adType", 0)}
                    >
                        No
                    </button>

                    <span>({values.adType ?? 0} points)</span>
                </div>
            </div>

                <div>
                    <label className="font-bold">Reasons for admission:</label>
                    <div className="space-x-2">
                        {mode === "mortality" && (
                            <button
                                className={`btn ${values.diag.ecmo ? "btn-accent" : "btn-warning"}`}
                                onClick={() => toggleDiag("ecmo")}
                            >
                                * ECMO
                            </button>
                        )}

                        <button
                            className={`btn ${values.diag.cpr ? "btn-accent" : "btn-warning"}`}
                            onClick={() => toggleDiag("cpr")}
                        >
                            * CPR
                        </button>
                        {mode === "mortality" && (
                            <button
                                className={`btn ${values.diag.bw ? "btn-accent" : "btn-warning"}`}
                                onClick={() => toggleDiag("bw")}
                            >
                                * GA or BW
                            </button>
                        )
                        <button
                            className={`btn ${values.diag.ino ? "btn-accent" : "btn-warning"}`}
                            onClick={() => toggleDiag("ino")}
                        >
                            * iNO
                        </button>

                        <button
                            className="btn btn-warning"
                            onClick={() => toggleDiag("other")}
                        >
                            Other
                        </button>

                        <span>({diagScore} points)</span>
                    </div>
                </div>


                <br></br>
                <h2 className="fixed bottom-6 right-6 text-4xl font-extrabold bg-white shadow-2xl rounded-2xl px-6 py-4">
                    Score: {totalScore}
                </h2>
                <p className="text-m ">
                    *
                    <br></br>
                    &nbsp;&nbsp;ECMO = Needed ECMO support within the first 24 hours since admission
                    <br></br>
                    &nbsp;&nbsp;GA or BW = gestational age {">"}32 and {"<"}34 weeks or birth weight {">"}1500 and {"<"}2000g
                    <br></br>
                    &nbsp;&nbsp;CPR = Needed CPR within the first 24 hours since admission
                    <br></br>
                    &nbsp;&nbsp;iNO = Needed iNO within the first 24 hours since admission
                </p>
            </div>
        </div>
    );
};
const ProtectedPSAPSCALC = () => {
    const [inputPassword, setInputPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);

    const correctPassword = "bVdobGQ4M2tEdTIzMW5aYVE=";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputPassword === atob(correctPassword)) {
            setAuthenticated(true);
        } else {
            alert("Wrong password!");
        }
    };

    if (!authenticated) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg p-6 rounded-2xl space-y-4"
                >
                    <h1 className="text-2xl font-bold text-center">Enter Password</h1>
                    <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Password"
                    />
                    <button
                        type="submit"
                        className="btn btn-accent w-full rounded-xl shadow"
                    >
                        Unlock
                    </button>
                </form>
            </div>
        );
    }

    return <PSAPSCALC/>;
};
export default ProtectedPSAPSCALC;
