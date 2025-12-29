import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useEffect } from "react";
import Footer from "../../components/common/Footer";

function HomePage() {
  useEffect(() => {
  document.title = `INDIA OSS`;
}, []);
  return (
    <>  
      {/* <Navbar /> */}
     
      <Outlet />
       {/* <Footer />  */}
      
    </>
  );
}
export default HomePage;







