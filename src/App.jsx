import Landing from "./components/Landing.jsx";
import { Route, Routes } from "react-router-dom";
import Experience from "./components/Experience.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/scene" element={<Experience />} />
        </Routes>
    );
}

export default App;
