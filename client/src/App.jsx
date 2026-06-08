import { Routes, Route } from "react-router-dom";
import Download from './components/Download';
import Navbar from './components/layouts/Navbar';
import Footer from './components/layouts/Footer';
import History from "./components/pages/History";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Download />} />
        <Route path="/history" element={<History />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;