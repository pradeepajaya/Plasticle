import { useContext, useEffect, useState } from "react";
import { navigationLinks } from "../../../data/data";
import "./Sidebar.css";
import { SidebarContext } from "../../../Context/sidebarContext";

const Sidebar = () => {
    const [activeLinkIdx]=useState(1);
    const [sidebarClass, setSidebarClass]=useState("");
    const {isSidebarOpen} = useContext(SidebarContext);
    useEffect(()=>{
        if(isSidebarOpen){
            setSidebarClass("sidebar-change");
        }else{
            setSidebarClass('');
        }
    },[isSidebarOpen])
  return (
    <div className={`sidebar ${sidebarClass}`}>
        <nav className="navigation">
            <ul className="nav-list">
                {
                    navigationLinks.map((navigationLink)=>(
                        <li className="nav-item" key={
                            navigationLink.id
                        }>
                            <a href="#" className={`nav-link ${navigationLink.id===activeLinkIdx ? 'active': null}`}>
                                <img src={navigationLink.image}
                                className="nav-link-icon" alt={navigationLink.title}
                                />
                                <span className="nav-link-text">{navigationLink.title}</span>
                            </a>
                        </li>
                    ))
                }
            </ul>
        </nav>
    </div>
  )
}

export default Sidebar