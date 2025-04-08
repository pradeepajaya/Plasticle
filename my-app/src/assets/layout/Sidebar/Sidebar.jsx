import { navigationLinks } from "../../../data/data"
import { iconsImgs } from "../../../utils/images"
import "./Sidebar.css"

const Sidebar = () => {
  return (
    <div className={`sidebar`}>
        <nav className="navigation">
            <ul className="nav-list">
                {
                    navigationLinks.map((navigationLink)=>(
                        <li className="nav-item" key={
                            navigationLink.id
                        }>
                            <a href="#" className={`nav-link`}>
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