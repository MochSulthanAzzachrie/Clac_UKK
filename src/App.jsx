import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Standard from "./layouts/standard";
import Scientific from "./layouts/scientific";
import Date_Calculation from "./layouts/date_calculation";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/standard" replace />} />
        <Route path="/standard" element={<Standard />} />
        <Route path="/scientific" element={<Scientific />} />
        <Route path="/date-calculation" element={<Date_Calculation />} />
      </Routes>
    </Router>
  );
}

export default App;