import { useEffect } from "react";
import "./App.css";

function App() {
    const selectedPostal = (args: any) => {
        console.log(args);
    };

    useEffect(() => {
        window.ecomStartWidget({
            id: 50317,
            callbackFunction: selectedPostal,
            containerId: "ecom-widget",
        });
    }, []);
    return (
        <>
            <div style={{ width: "100vw", height: "100vh" }}>
                <div
                    id="ecom-widget"
                    style={{ width: "65%", height: "50%" }}
                ></div>
            </div>
        </>
    );
}

export default App;
